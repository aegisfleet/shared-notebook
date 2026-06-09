# Shared Notebook

Hugo + PaperMod テーマを使った個人ノート・ドキュメント共有サイト。  
GitHub Pages に自動デプロイされる。

## 特徴

- 🌙 ダーク / ライトテーマ切り替え
- 📊 Mermaid ダイアグラム対応
- 🔍 全文検索（Fuse.js）
- 🏷️ タグ分類

## ローカル開発

```bash
# Hugo サーバー起動（下書きも含む）
hugo server -D

# ブラウザで確認
# http://localhost:1313/
```

## コンテンツの追加

`content/docs/` 以下に Markdown ファイルを作成する。  
Mermaid ダイアグラムを含む場合はフロントマターに `mermaid: true` を追加する。

```markdown
---
title: "ドキュメントタイトル"
date: 2026-06-09
tags: ["タグ1", "タグ2"]
mermaid: true  # Mermaid ダイアグラムを含む場合に追加
---
```

## デプロイ

`main` ブランチに push すると GitHub Actions が自動でビルド・デプロイを実行する。

### GitHub リポジトリの初回設定

1. GitHub リポジトリの **Settings > Pages** を開く
2. **Source** を `GitHub Actions` に変更する