import { logout, deleteAccount } from "../auth.js";

function initAccountMenu() {
  const menu = document.createElement("div");
  menu.className = "account-menu";
  menu.innerHTML = `
    <button
      type="button"
      class="account-menu__trigger"
      id="accountMenuTrigger"
      aria-haspopup="true"
      aria-expanded="false"
      aria-label="Account menu"
    >⚙</button>

    <div class="account-menu__panel" id="accountMenuPanel" hidden>
      <button type="button" class="account-menu__item" id="logoutBtn">
        Log out
      </button>
      <button type="button" class="account-menu__item account-menu__item--danger" id="deleteAccountBtn">
        Delete account
      </button>
    </div>
  `;
  document.body.appendChild(menu);

  const dialog = document.createElement("dialog");
  dialog.className = "confirm-dialog";
  dialog.id = "deleteConfirmDialog";
  dialog.innerHTML = `
    <div class="confirm-dialog__card">
      <h2>Delete your account?</h2>
      <p>This permanently removes your account and all your words. This can't be undone.</p>
      <div class="confirm-dialog__actions">
        <button type="button" class="std-btn" id="cancelDeleteBtn">Cancel</button>
        <button type="button" class="std-btn std-btn--danger" id="confirmDeleteBtn">Delete account</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const trigger = document.getElementById("accountMenuTrigger");
  const panel = document.getElementById("accountMenuPanel");
  const logoutBtn = document.getElementById("logoutBtn");
  const deleteAccountBtn = document.getElementById("deleteAccountBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function openPanel() {
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  trigger.addEventListener("click", () => {
    panel.hidden ? openPanel() : closePanel();
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) closePanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  logoutBtn.addEventListener("click", async () => {
    closePanel();
    await logout();
  });

  deleteAccountBtn.addEventListener("click", () => {
    closePanel();
    dialog.showModal();
  });

  cancelDeleteBtn.addEventListener("click", () => {
    dialog.close();
  });

  confirmDeleteBtn.addEventListener("click", async () => {
    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = "Deleting...";

    const result = await deleteAccount();

    if (!result) {
      confirmDeleteBtn.disabled = false;
      confirmDeleteBtn.textContent = "Delete account";
    }
  });
}

export { initAccountMenu };
