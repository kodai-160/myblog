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

if (tagFilters) {
  tagFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tag]");
    if (!button) return;

    const selected = normalizeTag(button.dataset.tag);
    tagFilters.querySelectorAll(".tag").forEach((tag) => {
      tag.classList.toggle("is-active", tag === button);
    });

    let visibleCount = 0;
    cards.forEach((card) => {
      const tags = card.dataset.tags
        ? card.dataset.tags.split(",").map(normalizeTag).filter(Boolean)
        : [];
      const isVisible = selected === "all" || tags.includes(selected);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  });
}
