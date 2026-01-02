const tagFilters = document.querySelector("[data-tag-filters]");
const cards = Array.from(document.querySelectorAll(".card[data-tags]"));
const emptyState = document.querySelector(".empty-state");

const normalizeTag = (tag) =>
  String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_\u3040-\u30ff\u4e00-\u9faf]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const updateActiveTag = (selected, trigger) => {
  if (!tagFilters) return;
  tagFilters.querySelectorAll(".tag").forEach((tag) => {
    const normalized = normalizeTag(tag.dataset.tag);
    tag.classList.toggle("is-active", normalized === selected && tag === trigger);
  });

  const fallback = tagFilters.querySelector(`[data-tag="${selected}"]`);
  if (fallback) {
    tagFilters.querySelectorAll(".tag").forEach((tag) => {
      tag.classList.toggle("is-active", tag === fallback);
    });
  }
};

const applyFilter = (selected, trigger) => {
  const normalized = normalizeTag(selected);
  const value = normalized || "all";
  updateActiveTag(value, trigger);

  let visibleCount = 0;
  cards.forEach((card) => {
    const tags = card.dataset.tags
      ? card.dataset.tags.split(",").map(normalizeTag).filter(Boolean)
      : [];
    const isVisible = value === "all" || tags.includes(value);
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (emptyState) {
    emptyState.hidden = visibleCount !== 0;
  }
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tag]");
  if (!button) return;
  if (button.dataset.tag === undefined) return;
  applyFilter(button.dataset.tag, button);
});
