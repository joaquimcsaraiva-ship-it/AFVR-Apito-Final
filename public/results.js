(() => {
  if (location.pathname !== "/results") return;

  const $ = (selector) => document.querySelector(selector);
  const state = { competitions: [], matches: [], uploadRows: [] };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  async function api(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
      let message = "Não foi possível concluir a operação.";
      try { message = (await response.json()).message || message; } catch { /* resposta sem JSON */ }
      if (response.status === 401) window.AFVRAuth?.openLogin(message);
      throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
  }

  function showMessage(selector, message, isError = false) {
    const element = $(selector);
    element.textContent = message;
    element.classList.toggle("preview-error", isError);
  }

  async function loadCompetitions(selectedId = "") {
    state.competitions = await api("/api/competitions");
    const options = '<option value="">Selecione uma competição</option>' + state.competitions
      .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)} · ${escapeHtml(item.season)}</option>`)
      .join("");
    $("#resultCompetition").innerHTML = options;
    if (selectedId) $("#resultCompetition").value = String(selectedId);
  }

  function formatDate(value) {
    if (!value) return "Data por definir";
    const date = new Date(value);
    if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0) {
      return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeZone: "UTC" }).format(date);
    }
    return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function renderMatches() {
    const region = $("#resultsList");
const renderTable = (matches) => `
<div class="table-wrap">
<table>
<thead>
<tr>
<th>Data</th>
<th>Jogo</th>
<th>Resultado</th>
<th>Campo</th>
<th>Origem</th>
</tr>
</thead>
<tbody>
${matches.map((match) => `
<tr>
<td>${escapeHtml(formatDate(match.playedAt))}</td>

<td>
<span class="competition-name">${escapeHtml(match.homeTeam)}</span>
<span class="competition-id">vs.</span>
<span class="competition-name">${escapeHtml(match.awayTeam)}</span>
</td>

<td>
${
match.homeScore == null
? '<span class="result-tbd">Por jogar</span>'
: `<span class="result-score">${escapeHtml(match.homeScore)} – ${escapeHtml(match.awayScore)}</span>`
}
</td>

<td>${escapeHtml(match.venue || "—")}</td>

<td>
<span class="source-tag">
${match.source === "fpf" ? "FPF" : "Manual"}
</span>
</td>
</tr>
`).join("")}
</tbody>
</table>
</div>
`;
    if (!$("#resultCompetition").value) {
      region.innerHTML = '<div class="empty"><div class="empty-icon">◷</div><h3>Selecione uma competição</h3><p>Escolha uma competição para consultar ou carregar jogos e resultados.</p></div>';
      return;
    }
    if (!state.matches.length) {
      region.innerHTML = '<div class="empty"><div class="empty-icon">◷</div><h3>Sem jogos registados</h3><p>Sincronize os jogos da FPF, registe um jogo ou importe um ficheiro CSV.</p></div>';
      return;
    }
const now = new Date();

const playedMatches = state.matches
  .filter(match =>
    match.playedAt &&
    new Date(match.playedAt) <= now
  )
  .sort(
    (a, b) =>
      new Date(b.playedAt) - new Date(a.playedAt)
  );

const upcomingMatches = state.matches
  .filter(match =>
    match.playedAt &&
    new Date(match.playedAt) > now
  )
  .sort(
    (a, b) =>
      new Date(a.playedAt) - new Date(b.playedAt)
  );
console.log("Matches:", state.matches);
const matches = [...state.matches].sort(
  (a, b) =>
    new Date(b.playedAt || 0) -
    new Date(a.playedAt || 0)
);

console.log("Resultados:", playedMatches.length);
console.log("Próximos:", upcomingMatches.length);
region.innerHTML = `
<section class="standings-group">
  <h3 class="standings-group-title">
    Últimos Resultados
  </h3>

  ${
    playedMatches.length
      ? renderTable(playedMatches)
      : '<div class="empty">Sem resultados registados.</div>'
  }
</section>

<section class="standings-group">
  <h3 class="standings-group-title">
    Próximos Jogos
  </h3>

  ${
    upcomingMatches.length
      ? renderTable(upcomingMatches)
      : '<div class="empty">Sem jogos agendados.</div>'
  }
</section>
`;
    $("#resultsFooter").textContent = `${state.matches.length} ${state.matches.length === 1 ? "jogo registado" : "jogos registados"}. Resultados FPF são sincronizados pela identificação do jogo.`;
  }

  function renderConflicts(conflicts) {

  const region = $("#conflictsList");

  if (!conflicts.length) {

    region.innerHTML = `
      <div class="empty">
        <div class="empty-icon">✓</div>
        <h3>Sem conflitos</h3>
        <p>
          Não existem discrepâncias entre as fontes de resultados.
        </p>
      </div>
    `;

    $("#conflictsFooter").textContent =
      "Nenhum conflito encontrado.";

    return;
  }

  region.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Jogo</th>
            <th>Origem Oficial</th>
            <th>Estado</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          ${conflicts.map(conflict => `
            <tr class="conflict-row">
              <td>${escapeHtml(conflict.id)}</td>

              <td>
                <span class="competition-name">
                  ${escapeHtml(conflict.home_team)}
                </span>

                <span class="competition-id">
                  vs.
                </span>

                <span class="competition-name">
                  ${escapeHtml(conflict.away_team)}
                </span>
              </td>

              <td>
                ${escapeHtml(conflict.official_source || "—")}
              </td>

              <td>
                <span class="badge badge-inactive">
                  ${escapeHtml(conflict.verification_status || "pendente")}
                </span>
              </td>

              <td>
                ${escapeHtml(formatDate(conflict.played_at))}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  $("#conflictsFooter").textContent =
    `${conflicts.length} conflitos encontrados.`;
}
    const region = $("#standingsList");
function renderStandings(rows) {
  const region = $("#standingsList");

 if (!$("#resultCompetition").value) {
      region.innerHTML = '<div class="empty">Selecione uma competição para consultar a classificação.</div>';
      $("#standingsFooter").textContent = "";
      return;
    }
    if (!rows.length) {
      region.innerHTML = '<div class="empty">Ainda não há resultados suficientes para calcular uma classificação nesta competição.</div>';
      $("#standingsFooter").textContent = "Apenas competições em formato de campeonato apresentam classificação.";
      return;
    }
    
rows = rows.map((row, index) => ({
  ...row,
  position: index + 1,
  team: row.teamName
}));
const groups = new Map();
    for (const row of rows) {
      const name = row.groupName || "";
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(row);
    }
    region.innerHTML = [...groups.entries()].map(([name, groupRows]) => `<section class="standings-group">
      ${name ? `<h3 class="standings-group-title">${escapeHtml(name)}</h3>` : ""}
      <div class="table-wrap"><table><thead><tr><th>#</th><th>Equipa</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GM</th><th>GS</th><th>DG</th><th>Pts</th></tr></thead><tbody>${groupRows.map((row) => `<tr>
      <td>${escapeHtml(row.position)}</td><td><span class="competition-name">${escapeHtml(row.team)}</span></td>
      <td>${escapeHtml(row.played)}</td><td>${escapeHtml(row.wins)}</td><td>${escapeHtml(row.draws)}</td><td>${escapeHtml(row.losses)}</td>
      <td>${escapeHtml(row.goalsFor)}</td><td>${escapeHtml(row.goalsAgainst)}</td><td>${escapeHtml(row.goalDifference)}</td><td><strong>${escapeHtml(row.points)}</strong></td>
    </tr>`).join("")}</tbody></table></div></section>`).join("");
    $("#standingsFooter").textContent = `Pontuação calculada com 3 pontos por vitória e 1 por empate, a partir dos jogos registados${groups.size > 1 ? "; classificação separada por zona/grupo" : ""}.`;
  }

  async function loadConflicts() {

  const region = $("#conflictsList");

  if (!region) {
    return;
  }

  region.innerHTML =
    '<div class="loading">A carregar conflitos...</div>';

  try {
    const conflicts =
      await api("/api/results/conflicts");

    renderConflicts(conflicts);

  } catch (error) {

    region.innerHTML =
      `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}


  async function loadMatches() {

  const competitionId =
    $("#resultCompetition").value;

  if (!competitionId) {
    state.matches = [];
    renderMatches();
    renderStandings([]);
    return;
  }

  $("#resultsList").innerHTML =
    '<div class="loading">A carregar jogos…</div>';

  $("#standingsList").innerHTML =
    '<div class="loading">A calcular classificação…</div>';

  try {

    const [matches, standings] =
  await Promise.all([
    api(`/api/results?competitionId=${encodeURIComponent(competitionId)}`),
    api(`/api/standings/${encodeURIComponent(competitionId)}`)
  ]);

    state.matches = matches;

    renderMatches();
    renderStandings(standings);

  } catch (error) {

    $("#resultsList").innerHTML =
      `<div class="error">${escapeHtml(error.message)}</div>`;

    $("#standingsList").innerHTML =
      `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

  $("#resultCompetition").addEventListener("change", loadMatches);
  $("#refreshResults")
  .addEventListener(
    "click",
    loadMatches
  );

$("#refreshResults")
  .addEventListener(
    "click",
    loadMatches
  );

$("#refreshConflicts")
  ?.addEventListener(
    "click",
    loadConflicts
  );

  $("#syncAllFpf").addEventListener("click", async () => {
    const button = $("#syncAllFpf");
    button.disabled = true;
    button.textContent = "A preparar sincronização…";
    showMessage("#fpfBulkMessage", "A iniciar a sincronização de todas as competições da época. Pode demorar alguns minutos.");
    try {
      await api("/api/results/fpf/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          associationId: Number($("#fpfAssociation").value),
          seasonId: Number($("#fpfSeason").value)
        })
      });
      const poll = async () => {
        try {
          const status = await api("/api/results/fpf/sync-all/status");
          showMessage("#fpfBulkMessage", `Sincronização: ${status.completed}/${status.total} competições; ${status.matchesSaved} jogos guardados; ${status.failed} falhas.${status.currentCompetition ? ` A processar: ${status.currentCompetition}.` : ""}`);
          if (status.state === "running") { setTimeout(poll, 4000); return; }
          button.disabled = false;
          button.textContent = "Sincronizar todas da época";
          await loadCompetitions($("#resultCompetition").value);
          await loadMatches();
          if (status.errors?.length) {
            showMessage("#fpfBulkMessage", `Concluída com ${status.competitionsSynced} competições sincronizadas, ${status.matchesSaved} jogos guardados e ${status.failed} falhas. Consulte a mensagem da FPF se uma prova não foi importada.`, status.failed > 0);
          }
        } catch (error) {
          button.disabled = false;
          button.textContent = "Sincronizar todas da época";
          showMessage("#fpfBulkMessage", error.message, true);
        }
      };
      void poll();
    } catch (error) {
      button.disabled = false;
      button.textContent = "Sincronizar todas da época";
      showMessage("#fpfBulkMessage", error.message, true);
    }
  });

  $("#findFpfCompetitions").addEventListener("click", async () => {
    const associationId = Number($("#fpfAssociation").value);
    const seasonId = Number($("#fpfSeason").value);
    const button = $("#findFpfCompetitions");
    button.disabled = true;
    button.textContent = "A consultar FPF…";
    showMessage("#fpfMessage", "A obter o catálogo de competições da FPF…");
    try {
      const competitions = await api(`/api/results/fpf/competitions?associationId=${associationId}&seasonId=${seasonId}`);
      $("#fpfCompetition").innerHTML = '<option value="">Selecione uma competição</option>' + competitions
        .map((item) => `<option value="${escapeHtml(item.fpfCompetitionId)}" data-season="${escapeHtml(item.season)}" data-sport="${escapeHtml(item.sport)}">${escapeHtml(item.name)}</option>`)
        .join("");
      $("#fpfCompetitionControls").hidden = false;
      showMessage("#fpfMessage", `${competitions.length} competições encontradas. Selecione uma para sincronizar os jogos.`);
    } catch (error) {
      $("#fpfCompetitionControls").hidden = true;
      showMessage("#fpfMessage", error.message, true);
    } finally {
      button.disabled = false;
      button.textContent = "Carregar competições";
    }
  });

  $("#syncFpf").addEventListener("click", async () => {
    const fpfCompetitionId = Number($("#fpfCompetition").value);
    if (!fpfCompetitionId) { showMessage("#fpfMessage", "Selecione uma competição da FPF.", true); return; }
    const button = $("#syncFpf");
    button.disabled = true;
    button.textContent = "A sincronizar…";
    showMessage("#fpfMessage", "A obter e guardar os jogos desta competição…");
    try {
      const result = await api("/api/results/fpf/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          associationId: Number($("#fpfAssociation").value),
          seasonId: Number($("#fpfSeason").value),
          fpfCompetitionId
        })
      });
      await loadCompetitions(result.localCompetitionId);
      await loadMatches();
      const skippedText = result.skipped ? ` ${result.skipped} jogos ficaram por interpretar e não foram importados.` : "";
      showMessage("#fpfMessage", `${result.saved} jogos sincronizados: ${result.competitionName} (${result.season}).${skippedText}`);
    } catch (error) {
      showMessage("#fpfMessage", error.message, true);
    } finally {
      button.disabled = false;
      button.textContent = "Sincronizar jogos";
    }
  });

  $("#manualMatchForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const competitionId = Number($("#resultCompetition").value);
    if (!competitionId) { showMessage("#manualMessage", "Selecione primeiro uma competição.", true); return; }
    const homeScoreValue = $("#homeScore").value.trim();
    const awayScoreValue = $("#awayScore").value.trim();
    if ((homeScoreValue === "") !== (awayScoreValue === "")) {
      showMessage("#manualMessage", "Preencha os dois resultados ou deixe ambos vazios.", true);
      return;
    }
    const match = {
      homeTeam: $("#homeTeam").value.trim(),
      awayTeam: $("#awayTeam").value.trim(),
      playedAt: $("#matchDate").value ? new Date($("#matchDate").value).toISOString() : null,
      venue: $("#matchVenue").value.trim() || null,
      homeScore: homeScoreValue === "" ? null : Number(homeScoreValue),
      awayScore: awayScoreValue === "" ? null : Number(awayScoreValue)
    };
    try {
      await api("/api/results/manual", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionId, match })
      });
      $("#manualMatchForm").reset();
      showMessage("#manualMessage", "Jogo guardado com sucesso.");
      await loadMatches();
    } catch (error) { showMessage("#manualMessage", error.message, true); }
  });

  function parseCsv(text) {
    text = text.replace(/^\uFEFF/, "");
    const firstLine = text.split(/\r?\n/, 1)[0] || "";
    const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
    const rows = [];
    let row = [], cell = "", quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === delimiter && !quoted) { row.push(cell.trim()); cell = ""; }
      else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && text[i + 1] === "\n") i += 1;
        row.push(cell.trim());
        if (row.some((value) => value !== "")) rows.push(row);
        row = []; cell = "";
      } else cell += char;
    }
    row.push(cell.trim());
    if (row.some((value) => value !== "")) rows.push(row);
    if (rows.length < 2) throw new Error("O CSV tem de conter uma linha de cabeçalho e pelo menos um jogo.");

    const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
    const headers = rows[0].map(normalize);
    const indexFor = (...aliases) => headers.findIndex((header) => aliases.includes(header));
    const columns = {
      home: indexFor("equipacasa", "casa", "hometeam", "home"),
      away: indexFor("equipavisitante", "visitante", "awayteam", "away"),
      date: indexFor("data", "date", "playedat"),
      homeScore: indexFor("goloscasa", "resultadocasa", "homescore"),
      awayScore: indexFor("golosvisitante", "resultadovisitante", "awayscore"),
      venue: indexFor("local", "campo", "venue", "stadium")
    };
    if (columns.home < 0 || columns.away < 0 || columns.homeScore < 0 || columns.awayScore < 0) {
      throw new Error("Cabeçalho inválido. Use equipa_casa, equipa_visitante, golos_casa e golos_visitante.");
    }
    const dateValue = (value, rowNumber) => {
      if (!value) return null;
      let date;
      const portuguese = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (portuguese) date = new Date(Date.UTC(Number(portuguese[3]), Number(portuguese[2]) - 1, Number(portuguese[1]), 12));
      else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) date = new Date(`${value}T12:00:00.000Z`);
      else date = new Date(value);
      if (Number.isNaN(date.getTime())) throw new Error(`Data inválida na linha ${rowNumber}.`);
      return date.toISOString();
    };
    const scoreValue = (value, rowNumber) => {
      if (value === "") return null;
      const score = Number(value);
      if (!Number.isInteger(score) || score < 0) throw new Error(`Resultado inválido na linha ${rowNumber}.`);
      return score;
    };
    return rows.slice(1).map((values, index) => {
      const rowNumber = index + 2;
      const homeTeam = values[columns.home] || "";
      const awayTeam = values[columns.away] || "";
      if (!homeTeam || !awayTeam) throw new Error(`Falta uma equipa na linha ${rowNumber}.`);
      const homeScore = scoreValue(values[columns.homeScore] || "", rowNumber);
      const awayScore = scoreValue(values[columns.awayScore] || "", rowNumber);
      if ((homeScore == null) !== (awayScore == null)) throw new Error(`Preencha os dois golos ou deixe ambos vazios na linha ${rowNumber}.`);
      return {
        homeTeam,
        awayTeam,
        playedAt: columns.date < 0 ? null : dateValue(values[columns.date] || "", rowNumber),
        venue: columns.venue < 0 ? null : (values[columns.venue] || null),
        homeScore,
        awayScore
      };
    });
  }

  function renderPreview() {
    const region = $("#csvPreview");
    const rows = state.uploadRows;
    region.innerHTML = `<div class="preview-table"><table><thead><tr><th>Jogo</th><th>Resultado</th><th>Data</th></tr></thead><tbody>${rows.slice(0, 8).map((match) => `<tr><td>${escapeHtml(match.homeTeam)} – ${escapeHtml(match.awayTeam)}</td><td>${match.homeScore == null ? "Por jogar" : `${match.homeScore} – ${match.awayScore}`}</td><td>${escapeHtml(match.playedAt ? formatDate(match.playedAt) : "—")}</td></tr>`).join("")}</tbody></table></div>
      <div class="preview-actions"><span class="panel-help">${rows.length} jogos prontos para importar${rows.length > 8 ? " (primeiros 8 na pré-visualização)" : ""}.</span><button class="button button-primary" id="importCsvRows" type="button">Importar ${rows.length} jogos</button></div>`;
    $("#importCsvRows").addEventListener("click", importCsvRows);
  }

  $("#csvFile").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    state.uploadRows = [];
    $("#csvPreview").innerHTML = "";
    if (!file) return;
    try {
      state.uploadRows = parseCsv(await file.text());
      renderPreview();
    } catch (error) {
      $("#csvPreview").innerHTML = `<p class="result-message preview-error">${escapeHtml(error.message)}</p>`;
    }
  });

  async function importCsvRows() {
    const competitionId = Number($("#resultCompetition").value);
    if (!competitionId) { $("#csvPreview").insertAdjacentHTML("afterbegin", '<p class="result-message preview-error">Selecione uma competição antes de importar.</p>'); return; }
    const button = $("#importCsvRows");
    button.disabled = true;
    button.textContent = "A importar…";
    try {
      const result = await api("/api/results/upload", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ competitionId, matches: state.uploadRows })
      });
      state.uploadRows = [];
      $("#csvFile").value = "";
      $("#csvPreview").innerHTML = `<p class="result-message">${result.saved} jogos importados com sucesso.</p>`;
      await loadMatches();
    } catch (error) {
      button.disabled = false;
      button.textContent = `Importar ${state.uploadRows.length} jogos`;
      $("#csvPreview").insertAdjacentHTML("afterbegin", `<p class="result-message preview-error">${escapeHtml(error.message)}</p>`);
    }
  }

  $("#downloadCsvTemplate").addEventListener("click", () => {
    const csv = "data,equipa_casa,equipa_visitante,golos_casa,golos_visitante,local\n";
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    link.download = "modelo-resultados-afvr.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  loadCompetitions()
  .then(renderMatches)
  .catch((error) => {
    $("#resultsList").innerHTML =
      `<div class="error">${escapeHtml(error.message)}</div>`;
  });

loadConflicts();

})();
document
  .getElementById("themeToggle")
  ?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });
