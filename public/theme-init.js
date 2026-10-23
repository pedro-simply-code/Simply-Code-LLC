(function () {
  try {
    var key = "theme";
    var stored = localStorage.getItem(key) || "system";
    var resolved = stored;
    if (stored === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
  } catch {}
})();
