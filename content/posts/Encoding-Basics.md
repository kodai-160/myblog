---
title: "Encoding Basics"
date: "2026-01-05"
ctf: "Daily AlpacaHack(1/5)"
tags: ["crypto", "AlpacaHack"]
summary: "CTFのCryptoでよく使われるencode方法を学びましょう！"
---

## 配布されたファイル
```py
from Crypto.Util.number import *
import base64
import os

flag = os.getenv("FLAG", "DUMMYD{DUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUMMYDUMMY}").encode()
flag1 = flag[:20]
flag2 = flag[20:40]
flag3 = flag[40:]

print(f"long_value = {bytes_to_long(flag1)}")
print(f'hex_string = "{flag2.hex()}"')
print(f'base64_string = "{base64.b64encode(flag3).decode()}"')
```

```txt
long_value = 373502670300504551747111047082539140193958649718
hex_string = "346c5f6833785f6630726d61745f31735f636c33"
base64_string = "NG5fYjY0X3A0ZGQxbmdfaXNfY29vbH0="
```

## writeup
flagが3分割されており、20文字ずつに`bytes_to_long`, `hex()`, `base64`のエンコードがされている。<br>
それとは逆のことをしてあげるとflagが求められる。<br>
以下がsolver
```py
from Crypto.Util.number import *
import base64
import os

long_value = 373502670300504551747111047082539140193958649718
hex_string = "346c5f6833785f6630726d61745f31735f636c33"
base64_string = "NG5fYjY0X3A0ZGQxbmdfaXNfY29vbH0="

print(long_to_bytes(long_value))
print(bytes.fromhex(hex_string))
print(base64.b64decode(base64_string))
```

FLAG : `Alpaca{b1g_1nt3ger_v4l_h3x_f0rmat_1s_cl34n_b64_p4dd1ng_is_cool}`