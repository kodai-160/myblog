# CTF writeup blog

Markdown + LaTeXで書けるCTF writeup用ブログの最小構成です。  
ローカルでプレビューしながら執筆でき、静的ファイルとして公開できます。

## 使い方

### セットアップ

```bash
npm install
```

### プレビュー（執筆中の確認）

```bash
npm run dev
```

`http://localhost:4173` でライブリロード付きのプレビューが開きます。

### ビルド（公開用）

```bash
npm run build
```

`dist/` が公開用の成果物です。GitHub Pages などにそのまま配置できます。

## 投稿の追加

`content/posts/` に Markdown を追加してください。先頭にフロントマターを入れます。

```md
---
title: "writeupタイトル"
date: "2024-06-01"
ctf: "CTF名"
tags: ["pwn", "web"]
summary: "概要の一文"
---
```

## 独自ドメインでの公開

GitHub Pages を使う場合は、`public/CNAME` にドメイン名を記載し、
DNSでCNAME設定を行ってください。

## 構成

```
content/posts/   # writeupのMarkdown
public/          # CSSなど静的ファイル
scripts/         # ビルド・プレビュー用スクリプト
dist/            # 生成物（公開用）
```
