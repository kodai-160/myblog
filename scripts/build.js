import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import texmath from "markdown-it-texmath";
import katex from "katex";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "posts");
const DIST_DIR = path.join(ROOT, "dist");
const PUBLIC_DIR = path.join(ROOT, "public");

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
}).use(texmath, {
  engine: katex,
  delimiters: "dollars",
  katexOptions: { throwOnError: false },
});

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
    day: "2-digit",
  }).format(date);
};

const joinBase = (baseUrl = "", pathname = "/") => {
  const base = String(baseUrl).replace(/\/+$/, "");
  const pathPart = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return base ? `${base}${pathPart}` : pathPart;
};

const layout = ({ title, description, content, config }) => `<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="stylesheet" href="${joinBase(config.baseUrl, "/styles.css")}" />
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <a class="site-title" href="${joinBase(config.baseUrl, "/")}">${config.title}</a>
        <p class="site-description">${config.description}</p>
      </div>
    </header>
    <main class="container">
      ${content}
    </main>
    <footer class="site-footer container">
      <small>© ${new Date().getFullYear()} ${config.author}</small>
    </footer>
  </body>
</html>`;

const normalizeTag = (tag = "") => slugify(String(tag).trim());

const renderTags = (tags = []) =>
  tags.length
    ? `
      <ul class="tags">
        ${tags
          .map((tag) => {
            const normalized = normalizeTag(tag);
            return `<li><a href="${joinBase(
              "",
              `/#tag-${normalized}`
            )}">#${tag}</a></li>`;
          })
          .join("")}
      </ul>
    `
    : "";

const buildIndex = (posts, config) => {
  const categories = [...new Set(posts.flatMap((post) => post.tags || []))].sort();

  const content = `
    <section class="categories">
      <h2>カテゴリ</h2>
      <div class="category-list">
        <a href="${joinBase(config.baseUrl, "/")}">すべて</a>
        ${categories
          .map((tag) => {
            const normalized = normalizeTag(tag);
            return `<a href="#tag-${normalized}">${tag}</a>`;
          })
          .join("")}
      </div>
    </section>

    <section class="posts">
      ${posts
        .map((post) => {
          const tagIds = (post.tags || []).map((tag) => `tag-${normalizeTag(tag)}`).join(" ");
          return `
            <article class="post-card ${tagIds}">
              <h2><a href="${post.url}">${post.title}</a></h2>
              <p class="post-meta">${formatDate(post.date)} · ${post.ctf ?? ""}</p>
              <p>${post.summary ?? ""}</p>
              ${renderTags(post.tags)}
            </article>
          `;
        })
        .join("")}

      <p class="empty-state" hidden>該当するwriteupがありません。</p>
    </section>
  `;

  return layout({
    title: config.title,
    description: config.description,
    content,
    config,
  });
};

const buildPost = (post, config) => {
  const content = `
    <article class="post">
      <p><a href="${joinBase(config.baseUrl, "/")}">← 一覧に戻る</a></p>
      <h1>${post.title}</h1>
      <p class="post-meta">${formatDate(post.date)} · ${post.ctf ?? ""}</p>
      ${renderTags(post.tags)}
      <div class="post-body">
        ${post.html}
      </div>
    </article>
  `;

  return layout({
    title: `${post.title} | ${config.title}`,
    description: post.summary ?? config.description,
    content,
    config,
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

const copyContentImages = async () => {
  const CONTENT_IMAGE_DIR = path.join(ROOT, "content", "image");

  try {
    const stat = await fs.stat(CONTENT_IMAGE_DIR);
    if (stat.isDirectory()) {
      const dest = path.join(DIST_DIR, "content", "image");
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.cp(CONTENT_IMAGE_DIR, dest, { recursive: true });
    }
  } catch {
    // no images to copy
  }
};

const readPosts = async (config) => {
  const files = await fs.readdir(CONTENT_DIR);

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".md"))
      .map(async (file) => {
        const fullPath = path.join(CONTENT_DIR, file);
        const raw = await fs.readFile(fullPath, "utf8");
        const { data, content } = matter(raw);

        const slug = data.slug ?? slugify(path.basename(file, ".md"));
        const url = joinBase(config.baseUrl, `/posts/${slug}/`);

        let tags = data.tags || [];
        if (typeof tags === "string") {
          tags = tags.split(",").map((t) => t.trim());
        }

        const rendered = md.render(content);
        const thumbnailMatch = rendered.match(/<img[^>]+src="([^"]+)"/i);
        const thumbnail = thumbnailMatch ? thumbnailMatch[1] : null;

        return {
          ...data,
          tags,
          slug,
          url,
          html: rendered,
          thumbnail,
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
  await copyContentImages();

  const posts = await readPosts(config);
  await writePostPages(posts, config);

  const indexHtml = buildIndex(posts, config);
  await fs.writeFile(path.join(DIST_DIR, "index.html"), indexHtml, "utf8");
};

if (import.meta.url === `file://${process.argv[1]}`) {
  buildSite();
}