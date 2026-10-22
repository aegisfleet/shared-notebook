# Shared Notebook

![Logo](static/images/logo.png)

Hugo + Hextra テーマを使った個人ノート・ドキュメント共有サイト。  
GitHub Pages に自動デプロイされる。

## 特徴

- 🌙 ダーク / ライトテーマ切り替え（目に優しいソフトダークグレー配色）
- 🔍 高速全文検索（FlexSearch モーダル検索 & Pagefind 全文検索）
- 🖼️ 画像クリック拡大（Medium Zoom）
- 📊 Mermaid ダイアグラム標準対応
- 🏷️ タグ分類・カテゴリポータル
- 📱 レスポンシブ & Nextra 風モダン 3 カラムレイアウト

## ローカル開発

```bash
# Hugo サーバー起動（下書きも含む）
hugo server -D

# ブラウザで確認
# http://localhost:1313/shared-notebook/
```

## コンテンツの追加

`content/docs/` 以下に Markdown ファイル、またはディレクトリを作成する（Page Bundles に対応）。

```markdown
---
title: "ドキュメントタイトル"
date: 2026-06-09
description: "ドキュメントの概要"
tags: ["タグ1", "タグ2"]
---
```

## デプロイ

`main` ブランチに push すると GitHub Actions が自動でビルド・Pagefind インデックス生成・GitHub Pages へのデプロイを実行する。