---
title: "jailaij"
date: "2026-01-06"
ctf: "Daily AlpacaHack(1/6)"
tags: ["misc", "AlpacaHack"]
summary: "クローラーからのアクセスが変らしい！"
---

## 配布されたファイル
```py
# flag is in ./flag.txt
s = input("> ")
assert s == s[::-1], "Not a palindrome!"
eval(s)
```

## writeup
与えられたファイルでは入力された文字列が回文かどうかを判定したのちに、eval関数を実行しています。<br>
pythonでは`#`を使うことでコメントアウトすることができるので、これを使って回文を作りつつ、eval関数を実行させます。<br>
solver
```py
print(open("./flag.txt").read())#))(daer.)"txt.galf/."(nepo(tnirp
```

FLAG : `Alpaca{nkosopa_life_is_beautiful}`

## 作問者writeup
https://github.com/minaminao/ctf-writeups/tree/main/daily-alpacahack/2026-01/06_jailiaj

## 感想
breakpointでデバッガを起動させるという発想に至らなかったので、非常に勉強になりました。