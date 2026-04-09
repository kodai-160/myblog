---
title: "impossible-puzzle"
date: "2026-04-04"
ctf: "Daily AlpacaHack(4/4)"
tags: ["web", "AlpacaHack"]
summary: "長さが違うのに、同じ!?"
---

## 配布されたファイル
```py
<?php

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $A = $_POST['A'] ?? '';
    $B = $_POST['B'] ?? '';

    // type check
    if (!is_string($A) || !is_string($B)) {
        die('Invalid input');
    }
    // check
    if (strlen($A) != strlen($B) && $A == $B){
        echo "<blockquote>Congratulations! Here is your flag:\n" . getenv('FLAG') . "</blockquote>";
    }
    else {
        echo "<blockquote>Try again!</blockquote>";
    }
}

?>

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
    <title>Impossible Puzzle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/sakura.css/css/sakura.css" type="text/css" />
    <script src="https://cdn.jsdelivr.net/npm/dompurify@3.3.1/dist/purify.min.js"></script>
</head>

<body>
    <h1>Impossible Puzzle</h1>
    <p>Enter two strings A and B. If they are equal in content but different in length, you will get the flag!</p>
    <form method="post">
        <label for="A">A:</label>
        <input type="text" id="A" name="A" required>
        <label for="B">B:</label>
        <input type="text" id="B" name="B" required>
        <button type="submit">Submit</button>
    </form>
</body>
</html>
```

## writeup
与えられたファイルでは`A`と`B`で長さは違うが、同じ値を指すことができればFLAGをゲットできることが分かります。<br>
phpについてドキュメントで文字列比較がどのように扱われるかを見ます。<br>
https://www.php.net/manual/en/language.operators.comparison.php <br>
すると以下のように記載があります。
```text
If both operands are numeric strings, or one operand is a number and the other one is a numeric string, then the comparison is done numerically.
```
つまり指定するoperandがともにnumeric stringsの場合、数値比較になってしまうことが分かります。
よって以下のようにパラメータを指定すると求めることができます。
`A=01, B=1`

FLAG : `Alpaca{L00se_c0mpar1sons_1n_php_mak3s_unexp3cted_behavi0r}`