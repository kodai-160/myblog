---
title: "Message For You"
date: "2026-04-02"
ctf: "Daily AlpacaHack(4/2)"
tags: ["web", "AlpacaHack"]
summary: "私からの隠れたメッセージを探してください"
---

## 配布されたファイル
```py
from flask import Flask, session
import os
import secrets 

FLAG = os.environ.get("FLAG", "Alpaca{**REDACTED**}")

app = Flask(__name__)
app.secret_key = secrets.token_hex(32)

MESSAGE = f"""
Roses are red,
Violets are blue,
I've hidden a flag
In a session for you: {FLAG}
""".strip()

HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message for You!</title>
</head>
<body>
    <p>I've got a message for you.</p>
    <p>It's hidden somewhere around here...</p>
</body>
</html>
""".strip()

@app.get("/")
def index():
    session["message"] = MESSAGE
    return HTML

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)

```

## writeup
この実装を見ると`session`にmessageが含まれていることが分かります。<br>
`session`の中身を見ると、<br>
`.eJwlyzELwjAQhuG_cmRxcagUEbqJk6uDk3Cc5msNxlzJGaWU_ncjbi8PvLN7wkwGuM6d1GAkGZTh15d0Dhrx-ss1FlQ6rt6ge_AeiYT6KEO1X9bTgibqNdOkpaN9HOUm80GbxwbGklu2D9odS_K81QrgqSmLW77kUS59.adezLw.mzHVT-JgdcHgooCYZcJLwu2ucqA`となっていました。<br>
これを解読してみます。<br>
`.<compressed_payload>.<timestamp>.<signature>`の形式で署名されているようです。<br>
データ部分はzlibで圧縮され、base64でエンコードされています。これをデコードします。<br>
すると`{"message":"Roses are red,\nViolets are blue,\nI've hidden a flag\nIn a session for you: Alpaca{Co0k1es_ar3_swe37_and_5o_are_y0u}"}`といったメッセージが出てきて、FLAGが出てきました。


FLAG : `Alpaca{Co0k1es_ar3_swe37_and_5o_are_y0u}`