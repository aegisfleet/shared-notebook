---
title: "Shared Notebook"
layout: "hextra-home"
---

<div class="hx:w-full hx:max-w-screen-xl hx:mx-auto hx:py-8">
  <div class="hx:text-center hx:mb-10">
    <div class="hx:inline-flex hx:items-center hx:gap-2 hx:px-4 hx:py-1.5 hx:rounded-full hx:text-sm hx:font-medium hx:bg-primary-50 hx:text-primary-700 hx:dark:bg-primary-950/60 hx:dark:text-primary-300 hx:mb-6">
      <span class="hx:w-2 hx:h-2 hx:rounded-full hx:bg-primary-500"></span>
      <span>個人ノート・ドキュメント共有サイト</span>
    </div>
    <h1 class="hx:text-4xl hx:font-extrabold hx:tracking-tight hx:sm:text-6xl hx:bg-clip-text hx:text-transparent hx:bg-gradient-to-r hx:from-gray-900 hx:to-gray-600 hx:dark:from-gray-100 hx:dark:to-gray-400 hx:mb-6">
      📓 Shared Notebook
    </h1>
    <p class="hx:text-xl hx:text-gray-600 hx:dark:text-gray-400 hx:max-w-2xl hx:mx-auto hx:mb-8">
      個人の知識・メモ・調査結果・生活ノウハウをまとめたノートサイト
    </p>
    <div class="hx:flex hx:gap-4 hx:justify-center">
      {{< hextra/hero-button text="ドキュメントを見る →" link="docs" >}}
    </div>
  </div>

  <div class="hx:border-t hx:border-gray-200 hx:dark:border-neutral-800 hx:pt-10 hx:mb-6">
    <h2 class="hx:text-2xl hx:font-bold hx:tracking-tight hx:mb-6 hx:text-gray-900 hx:dark:text-gray-100">
      📚 カテゴリ別ドキュメント
    </h2>
  </div>

  {{< cards >}}
    {{< card link="docs/ai-environment" title="AI環境まとめ" icon="lucide:bot" subtitle="仕事とプライベートにおけるAIツールの利用環境まとめ" tag="AI" >}}
    {{< card link="docs/ai-uiux-improvement" title="AIによるUI/UX改善" icon="lucide:sparkles" subtitle="GeminiやAntigravityを活用したUI/UX調査から実装までの改善フロー" tag="UI/UX" >}}
    {{< card link="docs/personal-development" title="個人開発環境" icon="lucide:code" subtitle="個人開発におけるIDE・AIエージェント・品質管理ツールなどの環境まとめ" tag="Dev" >}}
    {{< card link="docs/home-office" title="在宅環境・デスク" icon="lucide:monitor" subtitle="在宅勤務やプライベートで利用しているデバイスや周辺機器の環境まとめ" tag="Gadget" >}}
    {{< card link="docs/dog" title="愛犬ログ（パム）" icon="lucide:dog" subtitle="ポメラニアンのパムを迎えるための準備・初期費用・成長記録" tag="Dog" >}}
    {{< card link="docs/poikatsu" title="ポイ活フロー" icon="lucide:credit-card" subtitle="各種ポイントプログラム（楽天、dポイント、PayPay等）の獲得・消費フロー" tag="Life" >}}
    {{< card link="docs/virtual-background" title="バーチャル背景" icon="lucide:image" subtitle="Zoom / Teams / Google Meet で使える高品質な書斎・リビング背景画像集" tag="Asset" >}}
  {{< /cards >}}
</div>
