---
title: "Fushigi Crawler"
date: "2026-01-04"
ctf: "Daily AlpacaHack(1/4)"
tags: ["web", "AlpacaHack"]
summary: "クローラーからのアクセスが変らしい！"
---

## 配布されたファイル(flagゲットに使えるもの)
```js
import express from "express";
import rateLimit from "express-rate-limit";

const FLAG = process.env.FLAG ?? console.log("No flag") ?? process.exit(1);

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/api", rateLimit({ windowMs: 60 * 1000, max: 4, }));

app.post("/api/crawl-request", async (req, res) => {
  const url = req.body?.url;
  if (typeof url !== "string" || (!url.startsWith("http://") && !url.startsWith("https://")))
    return res.status(400).send("Invalid url");
  try {
    const r = await fetch(url, { headers: { FLAG }, signal: AbortSignal.timeout(5000) }); // !!
    if (!r.ok) return res.status(502).send("Fetch failed");
    return res.sendStatus(200);
  } catch (e) {
    return res.status(500).send(`Something wrong: ${e.name}`);
  }
});

app.listen(3333);
```

## writeup
![与えられているwebページ](/content/image/Fushigi-Crawler.png)

図のように、URLを入力するとそこにbotがアクセスするwebサイトが与えられる。

配布されたコードを見ると、urlが`string`ではない、urlが`http://` もしくは`https://` で始まっていない場合は外される。

また
```js
const r = await fetch(url, { headers: { FLAG }, signal: AbortSignal.timeout(5000) });
```
このbotが他のサイトにアクセスすると、headerに`FLAG`が送られる。<br>
よって自分で立てたサーバのurlを貼るとFLAGがゲットできる。<br>
今回私は[webhook.site](https://webhook.site/)を使った。<br>
するとflagが返ってきた。<br>
![flag](/content/image/Fushigi-Crawler-flag.png)

FLAG : `Alpaca{CRAWLER_IS_SUGOI!}`