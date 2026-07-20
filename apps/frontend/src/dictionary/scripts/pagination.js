const paginationContainer = document.getElementById("pagination");

function createPageButton(label, { disabled = false, current = false, onClick } = {}) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "std-btn pagination__btn";
  btn.textContent = label;
  btn.disabled = disabled;
  if (current) {
    btn.classList.add("is-current");
    btn.setAttribute("aria-current", "page");
  }
  if (onClick) btn.addEventListener("click", onClick);
  return btn;
}

function pageRange(currentPage, totalPages) {
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
}

function renderPagination(currentPage, totalPages, onPageChange) {
  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  paginationContainer.append(
    createPageButton("Prev", {
      disabled: currentPage === 1,
      onClick: () => goTo(currentPage - 1),
    }),
  );

  let lastPage = 0;
  for (const page of pageRange(currentPage, totalPages)) {
    if (lastPage && page - lastPage > 1) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "pagination__ellipsis";
      ellipsis.textContent = "…";
      paginationContainer.appendChild(ellipsis);
    }
    paginationContainer.append(
      createPageButton(String(page), {
        current: page === currentPage,
        onClick: () => goTo(page),
      }),
    );
    lastPage = page;
  }

  paginationContainer.append(
    createPageButton("Next", {
      disabled: currentPage === totalPages,
      onClick: () => goTo(currentPage + 1),
    }),
  );
}

export { renderPagination };
