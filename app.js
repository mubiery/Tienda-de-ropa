const $ = id => document.getElementById(id);

function show(view) {
  $("formView").classList.toggle("hidden", view !== "form");
  $("adminView").classList.toggle("hidden", view !== "admin");
  if (view === "admin") renderLogs();
}

$("formBtn").onclick = () => show("form");
$("adminBtn").onclick = () => show("admin");
$("refreshBtn").onclick = () => renderLogs();

$("flagForm").onsubmit = async event => {
  event.preventDefault();
  $("message").textContent = "Enviando...";

  const payload = {
    email: $("email").value,
    name: $("name").value,
    exercise: $("exercise").value,
    phrase: $("phrase").value
  };

  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    $("message").textContent = data.ok
      ? `Intento guardado. Resultado: ${data.result}`
      : data.message || "No se pudo guardar.";

    if (data.ok) $("flagForm").reset();
  } catch {
    $("message").textContent = "No se pudo contactar al servidor.";
  }
};

async function renderLogs() {
  const table = $("logsTable");
  table.innerHTML = '<tr><td colspan="9">Cargando...</td></tr>';

  try {
    const res = await fetch("/api/logs");
    const logs = await res.json();

    table.innerHTML = logs.length
      ? logs.map(log => `
        <tr>
          <td>${escapeHtml(log.time || "")}</td>
          <td class="mono">${escapeHtml(log.email || "")}</td>
          <td>${escapeHtml(log.name || "")}</td>
          <td>${escapeHtml(log.exercise || "")}</td>
          <td class="mono">${escapeHtml(log.phrase || "")}</td>
          <td class="${log.result === "Correcto" ? "ok" : log.result === "Incorrecto" ? "bad" : ""}">${escapeHtml(log.result || "")}</td>
          <td>${escapeHtml(log.reason || "")}</td>
          <td class="mono">${escapeHtml(log.ip || "")}</td>
          <td class="mono small">${escapeHtml(log.userAgent || "")}</td>
        </tr>
      `).join("")
      : '<tr><td colspan="9">No hay intentos registrados todavía.</td></tr>';
  } catch {
    table.innerHTML = '<tr><td colspan="9">No se pudo cargar el servidor.</td></tr>';
  }
}

$("clearBtn").onclick = async () => {
  if (!confirm("¿Borrar todos los registros?")) return;
  await fetch("/api/logs", { method: "DELETE" });
  renderLogs();
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
