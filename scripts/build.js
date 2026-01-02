import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import markdownItKatex from "markdown-it-katex";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "posts");
const DIST_DIR = path.join(ROOT, "dist");
const PUBLIC_DIR = path.join(ROOT, "public");

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(markdownItKatex);

const loadConfig = async () => {
  const raw = await fs.readFile(path.join(ROOT, "site.config.json"), "utf8");
  return JSON.parse(raw);
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\-_\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const formatDate = (value) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
};

const layout = ({ title, description, content, config }) => `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" />
  </head>
  <body>
    <header>
      <div class="container hero">
        <a href="/" aria-label="${config.title}">
          <strong>${config.title}</strong>
        </a>
        <p>${config.description}</p>
      </div>
    </header>
    <main class="container">
      ${content}
    </main>
    <footer class="footer">
      <small>© ${new Date().getFullYear()} ${config.author}</small>
    </footer>
  </body>
</html>`;

const renderTags = (tags = []) =>
  tags.length
    ? `<div class="tags">${tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}</div>`
    : "";

const buildIndex = (posts, config) => {
  const achievements = posts
    .flatMap((post) =>
      (post.achievements || []).map((item) => ({
        title: post.title,
        ctf: post.ctf,
        date: post.date,
        item
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const content = `
    <section class="grid">
      ${posts
        .map(
          (post) => `
            <article class="card">
              <h2><a href="${post.url}">${post.title}</a></h2>
              <div class="meta">${formatDate(post.date)} · ${post.ctf}</div>
              <p>${post.summary}</p>
              ${renderTags(post.tags)}
            </article>
          `
        )
        .join("")}
    </section>
    <section style="margin-top: 48px;">
      <h2>実績一覧</h2>
      <div class="card">
        <ul>
          ${achievements
            .map(
              (achievement) =>
                `<li><strong>${achievement.ctf}</strong> (${formatDate(
                  achievement.date
                )}): ${achievement.item} <em>— ${achievement.title}</em></li>`
            )
            .join("")}
        </ul>
      </div>
    </section>
  `;

  return layout({
    title: config.title,
    description: config.description,
    content,
    config
  });
};

const buildPost = (post, config) => {
  const content = `
    <article class="article">
      <h1>${post.title}</h1>
      <div class="meta">${formatDate(post.date)} · ${post.ctf}</div>
      ${renderTags(post.tags)}
      ${post.html}
    </article>
  `;

  return layout({
    title: `${post.title} | ${config.title}`,
    description: post.summary,
    content,
    config
  });
};

const copyPublic = async () => {
  await ensureDir(DIST_DIR);
  const entries = await fs.readdir(PUBLIC_DIR, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const src = path.join(PUBLIC_DIR, entry.name);
      const dest = path.join(DIST_DIR, entry.name);
      if (entry.isDirectory()) {
        await fs.cp(src, dest, { recursive: true });
      } else {
        await fs.copyFile(src, dest);
      }
    })
  );
};

const readPosts = async () => {
  const files = await fs.readdir(CONTENT_DIR);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const fullPath = path.join(CONTENT_DIR, file);
        const raw = await fs.readFile(fullPath, "utf8");
        const { data, content } = matter(raw);
        const slug = data.slug ?? slugify(path.basename(file, ".md"));
        const url = `/posts/${slug}/`;
        return {
          ...data,
          slug,
          url,
          html: md.render(content)
        };
      })
  );

  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const writePostPages = async (posts, config) => {
  await Promise.all(
    posts.map(async (post) => {
      const dir = path.join(DIST_DIR, "posts", post.slug);
      await ensureDir(dir);
      const html = buildPost(post, config);
      await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
    })
  );
};

export const buildSite = async () => {
  const config = await loadConfig();
  await fs.rm(DIST_DIR, { recursive: true, force: true });
  await ensureDir(DIST_DIR);
  await copyPublic();
  const posts = await readPosts();
  await writePostPages(posts, config);
  const indexHtml = buildIndex(posts, config);
  await fs.writeFile(path.join(DIST_DIR, "index.html"), indexHtml, "utf8");
};

if (import.meta.url === `file://${process.argv[1]}`) {
  buildSite();
}
