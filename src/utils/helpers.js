export function setButtonText(
  btn,
  isLoading,
  defaultText = "Save",
  loadingText = "Saving..."
) {
  if (!btn) return;

  if (!btn.dataset.defaultText) {
    btn.dataset.defaultText = defaultText || btn.textContent;
  }

  if (isLoading) {
    btn.textContent = loadingText;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.defaultText;
    btn.disabled = false;
  }
}

