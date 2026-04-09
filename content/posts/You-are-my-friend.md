---
title: "You are my friend"
date: "2026-04-03"
ctf: "Daily AlpacaHack(4/3)"
tags: ["Crypto", "AlpacaHack"]
summary: "やあ！友よ！"
---

## 配布されたファイル
```py
def rot13_char(c):
    if 'a' <= c <= 'z':
        return chr((ord(c) - ord('a') + 13) % 26 + ord('a'))
    if 'A' <= c <= 'Z':
        return chr((ord(c) - ord('A') + 13) % 26 + ord('A'))
    return c

def rot13(text):
    return ''.join(rot13_char(c) for c in text)

cts = [238, 55, 26, 13, 30, 30, 21, 56, 58, 43, 60, 40, 52, 45, 6, 47, 48, 33, 53, 51, 62, 24, 37, 61, 5, 56, 7, 23, 83, 123, 44, 56, 52, 24, 7, 23, 15]

# flagは Alpaca{...} 形式を仮定
ct = ['?'] * len(cts)
ct[0] = 'N'  # rot13('A') = 'N'

for i in range(1, len(cts)):
    ct[i] = chr(cts[i] ^ ord(ct[i - 1]))

ct = ''.join(ct)
flag = rot13(ct)

# 必要なら key も復元できる
key = cts[0] ^ ord(ct[0])

print("ct  =", ct)
print("key =", key)
print("flag =", flag)
```

## writeup
`ct[0]='N'`となっており、与えられたプログラムに書いてある通り、`rot13('A') = 'N'`に変換できます。<br>
またctsは`cts[i] ^ ord(ct[i-1])`となっておりXORを行っているので、逆のことをしてあげれば復元できます。<br>

## solver
```py
def rot13_char(c):
    if 'a' <= c <= 'z':
        return chr((ord(c) - ord('a') + 13) % 26 + ord('a'))
    if 'A' <= c <= 'Z':
        return chr((ord(c) - ord('A') + 13) % 26 + ord('A'))
    return c

def rot13(text):
    return ''.join(rot13_char(c) for c in text)

cts = [238, 55, 26, 13, 30, 30, 21, 56, 58, 43, 60, 40, 52, 45, 6, 47, 48, 33, 53, 51, 62, 24, 37, 61, 5, 56, 7, 23, 83, 123, 44, 56, 52, 24, 7, 23, 15]

# flagは Alpaca{...} 形式を仮定
ct = ['?'] * len(cts)
ct[0] = 'N'  # rot13('A') = 'N'

for i in range(1, len(cts)):
    ct[i] = chr(cts[i] ^ ord(ct[i - 1]))

ct = ''.join(ct)
flag = rot13(ct)

# 必要なら key も復元できる
key = cts[0] ^ ord(ct[0])

print("ct  =", ct)
print("key =", key)
print("flag =", flag)

ct  = Nycnpn{CyRnFr_YvFgRa_Gb_Zber!ZvNzber}
key = 160
flag = Alpaca{PlEaSe_LiStEn_To_More!MiAmore}
```

FLAG : `Alpaca{PlEaSe_LiStEn_To_More!MiAmore}`