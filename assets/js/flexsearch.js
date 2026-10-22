// FlexSearch data plane. Builds the page + section indexes lazily on first
// use, runs queries, and returns normalized results. UI lives in
// search-dialog.js and consumes this via `window.hextraSearch`.

// Render the search data as JSON.
// {{ $searchDataFile := printf "%s.search-data.json" .Language.Lang }}
// {{ $searchData := resources.Get "json/search-data.json" | resources.ExecuteAsTemplate $searchDataFile . }}
// {{ if hugo.IsProduction }}
//   {{ $searchData = $searchData | minify | fingerprint }}
// {{ end }}

(function () {
  const searchDataURL = '{{ $searchData.RelPermalink }}';

  let pageIndex;
  let sectionIndex;
  let indexPromise = null;

  /**
   * Preloads the search index by fetching data and adding it to the FlexSearch index.
   * @returns {Promise<void>} A promise that resolves when the index is preloaded.
   */
  /** CJKブロックをバイグラム＋全体トークンに分解する */
  function encodeCjk(text) {
    const tokens = [];
    const cjkBlocks = text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7a3\u3400-\u4dbf\uf900-\ufaff]+/gu);
    if (!cjkBlocks) return tokens;

    for (const block of cjkBlocks) {
      if (block.length === 1) {
        tokens.push(block);
        continue;
      }
      for (let i = 0; i < block.length - 1; i++) {
        tokens.push(block.substring(i, i + 2));
      }
      if (block.length <= 8) tokens.push(block);
    }
    return tokens;
  }

  /**
   * URLパーツからパンくずテキストと配列を構築する。
   * @returns {Object} crumb（パンくず文字列）と crumbParts（配列）を含むオブジェクト
   */
  function buildBreadcrumb(urlParts, data, route) {
    let crumb = '';
    const crumbParts = [];
    let searchUrl = '/';

    for (let i = 0; i < urlParts.length; i++) {
      const urlPart = urlParts[i];
      searchUrl += urlPart + '/';

      const crumbData = data[searchUrl];
      if (!crumbData) {
        console.debug('Excluded page', searchUrl, '- will not be included for search result breadcrumb for', route);
        continue;
      }

      let title = data[searchUrl].title;
      if (title === '_index') {
        title = urlPart.split('-').join(' ');
      }
      crumbParts.push(title);
      crumb += title;
      if (i < urlParts.length - 1) crumb += ' > ';
    }
    return { crumb, crumbParts };
  }

  /**
   * 1ルートのheadingデータをsectionIndexに登録し、ページ全文を返す。
   * @returns {string} ページ全文（pageIndexへの追加に使用）
   */
  function indexSections(routeData, route, crumb, pageId) {
    let pageContent = '';
    for (const heading in routeData.data) {
      const separator = heading.indexOf('#');
      const hash = separator === -1 ? heading : heading.slice(0, separator);
      const text = separator === -1 ? '' : heading.slice(separator + 1);
      const url = hash ? `${route}#${hash}` : route;
      const title = text || routeData.title;

      const content = routeData.data[heading] || '';
      const paragraphs = content.split('\n').filter(Boolean);

      sectionIndex.add({
        id: url, url, title, crumb,
        pageId: `page_${pageId}`,
        content: title,
        ...(paragraphs[0] && { display: paragraphs[0] })
      });

      for (let i = 0; i < paragraphs.length; i++) {
        sectionIndex.add({ id: `${url}_${i}`, url, title, crumb, pageId: `page_${pageId}`, content: paragraphs[i] });
      }

      pageContent += ` ${title} ${content}`;
    }
    return pageContent;
  }

  function preloadIndex() {
    if (indexPromise) return indexPromise;

    const tokenize = '{{- site.Params.search.flexsearch.tokenize | default  "forward" -}}';
    const encode = (str) => {
      const text = ('' + str).toLowerCase();
      const tokens = (text.match(/[0-9a-zа-яà-ſè-ӿ؀-ۿঀ-৿Ḁ-ỿ֐-׿]+/gu) || []);
      return tokens.concat(encodeCjk(text));
    };

    const attempt = (async () => {
      pageIndex = new FlexSearch.Document({
        tokenize, encode, cache: 100,
        document: { id: 'id', store: ['title', 'breadcrumbs'], index: 'content' }
      });
      sectionIndex = new FlexSearch.Document({
        tokenize, encode, cache: 100,
        document: {
          id: 'id', store: ['title', 'content', 'url', 'display', 'crumb'], index: 'content',
          tag: [{ field: 'pageId' }]
        }
      });

      const resp = await fetch(searchDataURL);
      const data = await resp.json();
      let pageId = 0;

      for (const route in data) {
        ++pageId;
        const urlParts = route.split('/').filter(x => x !== '' && !x.startsWith('#'));
        const { crumb, crumbParts } = buildBreadcrumb(urlParts, data, route);
        const pageContent = indexSections(data[route], route, crumb, pageId);

        pageIndex.add({
          id: pageId,
          title: data[route].title,
          breadcrumbs: crumbParts.slice(0, -1),
          content: pageContent
        });
      }
    })();

    const wrapped = attempt.catch((err) => {
      if (indexPromise === wrapped) indexPromise = null;
      pageIndex = undefined;
      sectionIndex = undefined;
      throw err;
    });
    indexPromise = wrapped;
    return indexPromise;
  }

  /**
   * Run the actual FlexSearch query and return sorted, deduped page groups.
   * @param {string} query
   * @returns {Array<{id: string, route: string, title: string, breadcrumbs: string[], matches: Array<{id: string, route: string, title: string, content: string}>}>}
   */
  function performSearch(query) {
    const maxPageResults = Number.parseInt('{{- site.Params.search.flexsearch.maxPageResults | default 20 -}}', 10);
    const maxSectionResults = Number.parseInt('{{- site.Params.search.flexsearch.maxSectionResults | default 10 -}}', 10);
    const pageResults = pageIndex.search(query, maxPageResults, { enrich: true, suggest: false })[0]?.result || [];

    const groups = [];
    const pageTitleMatches = {};

    for (let i = 0; i < pageResults.length; i++) {
      const result = pageResults[i];
      pageTitleMatches[i] = 0;

      const sectionResults = sectionIndex.search(query,
        { enrich: true, suggest: false, tag: { 'pageId': `page_${result.id}` } })[0]?.result || [];
      const occurred = {};
      const group = {
        _page_rk: i,
        route: '',
        title: result.doc.title,
        breadcrumbs: result.doc.breadcrumbs || [],
        matches: []
      };

      const nResults = Math.min(sectionResults.length, maxSectionResults);
      for (let j = 0; j < nResults; j++) {
        const { doc } = sectionResults[j];
        const isMatchingTitle = doc.display !== undefined;
        if (isMatchingTitle) {
          pageTitleMatches[i]++;
        }
        const { url, title } = doc;
        const content = doc.display || doc.content;

        if (occurred[url + '@' + content]) continue;
        occurred[url + '@' + content] = true;
        if (!group.route) group.route = url.split('#')[0];
        group.matches.push({
          route: url,
          title,
          content
        });
      }

      if (group.matches.length) groups.push(group);
    }

    let optionId = 0;
    return groups
      .toSorted((a, b) => {
        if (pageTitleMatches[a._page_rk] !== pageTitleMatches[b._page_rk]) {
          return pageTitleMatches[b._page_rk] - pageTitleMatches[a._page_rk];
        }
        return a._page_rk - b._page_rk;
      })
      .map((res) => ({
        id: `hextra-search-opt-${optionId++}`,
        route: res.route,
        title: res.title,
        breadcrumbs: res.breadcrumbs,
        matches: res.matches.map((match) => ({
          id: `hextra-search-opt-${optionId++}`,
          route: match.route,
          title: match.title,
          content: match.content
        }))
      }));
  }

  window.hextraSearch = {
    preload: preloadIndex,
    async search(query) {
      await preloadIndex();
      return performSearch(query);
    },
  };
})();
