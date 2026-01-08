import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";
import katex from "katex";

const md = new MarkdownIt({ html:true, linkify:true, typographer:true })
  .use(texmath, { engine: katex, delimiters: "dollars", katexOptions: { throwOnError:false } });
console.log('texmath.katex exists?', !!texmath.katex && typeof texmath.katex.renderToString === 'function');

const s = `また、$n = p^2$ のときのオイラー関数は\n$\\varphi(p^2) = p^2 - p = p(p - 1)$\nなので、秘密指数は $d \\equiv e^{-1} \\pmod{p(p - 1)}$ で取り、最後は $m \\equiv c^d \\pmod{p^2}$ です。`;

console.log(md.render(s));
