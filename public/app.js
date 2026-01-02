const tagFilters = document.querySelector("[data-tag-filters]");
const cards = Array.from(document.querySelectorAll(".card[data-tags]"));
const emptyState = document.querySelector(".empty-state");

console.log("tagFilters:", tagFilters);
console.log("cards:", cards);
console.log("emptyState:", emptyState);

const normalizeTag = (tag) =>
  String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const updateActiveTag = (selected) => {
  if (!tagFilters) return;
  tagFilters.querySelectorAll(".tag").forEach((el) => {
    const normalized = normalizeTag(el.dataset.tag);
    const tagValue = normalized || "all";
    const selectedValue = selected || "all";
    el.classList.toggle("is-active", tagValue === selectedValue);
  });
};

const applyFilter = (selected) => {
  const normalized = normalizeTag(selected);
  const value = normalized || "all";
  console.log("applyFilter:", value);
  updateActiveTag(value);

  let visibleCount = 0;
  cards.forEach((card) => {
    const tags = card.dataset.tags
      ? card.dataset.tags.split(",").map(normalizeTag).filter(Boolean)
      : [];
    const isVisible = value === "all" || tags.includes(value);
    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) visibleCount += 1;
  });

  if (emptyState) {
    emptyState.classList.toggle("is-hidden", visibleCount === 0);
  }
};

const getTagFromURL = () => {
  try {
    const params = new URLSearchParams(location.search);
    const q = params.get("tag");
    return q ? decodeURIComponent(q) : null;
  } catch (e) {
    return null;
  }
};

if (tagFilters) {
  // ボタンだけを対象に確実に拾う
  tagFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tag]");
    if (!button) return;
    console.log("tag clicked:", button.dataset.tag);
    applyFilter(button.dataset.tag);
  });

  // 初期表示は URL にあればそれを、なければ all
  const initialTag = getTagFromURL();
  applyFilter(initialTag || "all");
}