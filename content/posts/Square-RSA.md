---
title: "Square RSA"
date: "2026-01-07"
ctf: "Daily AlpacaHack(1/7)"
tags: ["crypto", "AlpacaHack"]
summary: "RSA 暗号で素数を使い回すことにしました!"
---

## 配布されたファイル
```py
import os
from Crypto.Util.number import getPrime, bytes_to_long

flag = os.environ.get("FLAG", "Alpaca{****** REDACTED ******}").encode()
assert len(flag) == 30

p = getPrime(128)
n = p * p  # !?

e = 65537
m = bytes_to_long(flag)
c = pow(m, e, n)

print(f"{n = }")
print(f"{c = }")
```

```txt
n = 66579369096057840799275275806551056825754855027296356876541315429102104919401
c = 23240514848563033397887056861198100244595942784363115352574337396646368790635
```

## writeup
今回与えられたファイルではRSA暗号が実装されています。<br>
しかし、nが`n = p * p`で構成されていることが問題です。
暗号文が`mod n = p * p`で計算されているので、復号化も同じことをやります。<br>

また、$n = p^2$ のときのオイラー関数は
$$
\varphi(p^2) = p^2 - p = p(p - 1)
$$

なので、秘密指数は
$$
d \equiv e^{-1} \pmod{p(p - 1)}
$$
で取り、最後は
$$
m \equiv c^d \pmod{p^2}
$$
です。



FLAG : `Alpaca{b1g_1nt3ger_v4l_h3x_f0rmat_1s_cl34n_b64_p4dd1ng_is_cool}`