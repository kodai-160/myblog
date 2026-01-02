---
title: "pwnable.kr : fd のwriteup"
date: "2024-06-01"
ctf: "pwnable.kr"
tags: ["pwn", "beginner", "linux"]
summary: "file descriptorの仕様を使ったシンプルなpwn問題。"
---

## 問題概要

`fd` は file descriptor をユーザー入力で切り替える問題です。

数式は LaTeX で書けます。  
例えば、`N` ビットの探索は次のように表現できます。

$$
O(2^N)
$$

## 解法

```bash
python3 -c 'print("A" * 32 + "\x00\x00\x00\x00")'
```

## 学び

- file descriptor が `0,1,2` に対応していること
- `read` 系の挙動を正確に把握することの重要性
