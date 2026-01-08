---
title: "Ruby-Flag-Checker"
date: "2026-01-03"
ctf: "Daily AlpacaHack(1/3)"
tags: ["reversing", "AlpacaHack"]
summary: "🦙 < Ruby でフラグチェッカーを書いてみるパカ!"
---

## 配布されたファイル

```rb
require 'prime';print "flag> ";puts(Prime::Generator23.new.take(23).zip(STDIN.read(23).bytes).map{|x,y|x^y}.pack("C*")=="Coufhlj@bixm|UF\\JCjP^P<"?"Correct!":"Incorrect!")
```

## writeup
与えられたRubyのファイルは見にくいので、整形しました。
```ruby
require 'prime'

EXPECTED = "Coufhlj@bixm|UF\\JCjP^P<"
GEN_SIZE = 23

print "flag> "
input = STDIN.read(GEN_SIZE)

primes = Prime::Generator23.new.take(GEN_SIZE)

decoded = primes.zip(input.bytes).map { |p, b| p ^ b }.pack("C*")

puts decoded == EXPECTED ? "Correct!" : "Incorrect!"
```

このプログラムでは、2から始めて順に23個の素数を生成した後にそれのXORを取って、それが`EXPECTED`と一致するとCorrectになりFLAGがゲットできるというものです。なのでそれをそのままsolverで行います。

以下solverです。
```rb
require "prime"

expected = "Coufhlj@bixm|UF\\JCjP^P<"
gen_size = 23

primes = Prime::Generator23.new.take(gen_size)
flag_bytes = primes.zip(expected.bytes).map { |p, e| p ^ e }
flag = flag_bytes.pack("C*")

p primes
p flag_bytes
puts flag
```

FLAG : `Alpaca{Super_power_gem}`