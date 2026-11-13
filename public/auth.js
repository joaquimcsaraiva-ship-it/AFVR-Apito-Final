(() => {
  const $ = (selector) => document.querySelector(selector);
  const dialog = $("#authBackdrop");
  const form = $("#authForm");
  const error = $("#authError");
  if (!dialog || !form) return;

  let authenticated = false;

  function render() {
    $("#authUserText").textContent = authenticated ? "Sessão de gestão ativa" : "Consulta pública";
    $("#loginButton").hidden = authenticated;
    $("#logoutButton").hidden = !authenticated;
  }

  function openLogin(message = "") {
    error.textContent = message;
    dialog.hidden = false;
    $("#authPassword").focus();
  }

  function closeLogin() {
    dialog.hidden = true;
    error.textContent = "";
  }

  async function refreshSession() {
    try {
      const response = await fetch("/api/auth/session", { credentials: "same-origin" });
      const result = await response.json();
      authenticated = Boolean(result.authenticated);
    } catch {
      authenticated = false;
    }
    render();
  }

  $("#loginButton").addEventListener("click", () => openLogin());
  $("#logoutButton").addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    authenticated = false;
    render();
  });
  $("#closeAuthModal").addEventListener("click", closeLogin);
  $("#cancelAuth").addEventListener("click", closeLogin);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) closeLogin(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !dialog.hidden) closeLogin(); });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = $("#submitAuth");
    submit.disabled = true;
    submit.textContent = "A validar…";
    error.textContent = "";
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: $("#authUsername").value.trim(), password: $("#authPassword").value })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Não foi possível iniciar sessão.");
      authenticated = true;
      form.reset();
      closeLogin();
      render();
    } catch (reason) {
      error.textContent = reason instanceof Error ? reason.message : "Não foi possível iniciar sessão.";
    } finally {
      submit.disabled = false;
      submit.textContent = "Entrar";
    }
  });

  window.AFVRAuth = { openLogin };
  void refreshSession();
})();
