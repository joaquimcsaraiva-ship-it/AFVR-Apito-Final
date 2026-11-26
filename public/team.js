(async () => {
  const params =
    new URLSearchParams(window.location.search);

  const teamName =
    params.get("name")?.trim();
const favoriteButton =
  document.getElementById("favoriteTeamButton");

const favoritesStorageKey =
  "afvrFavoriteTeams";

function getFavoriteTeams() {
  try {
    const saved =
      localStorage.getItem(favoritesStorageKey);

    const favorites =
      saved ? JSON.parse(saved) : [];

    return Array.isArray(favorites)
      ? favorites
      : [];
  } catch {
    return [];
  }
}

function isFavoriteTeam(name) {
  return getFavoriteTeams().some(
    favorite =>
      favorite.toLocaleLowerCase("pt-PT") ===
      name.toLocaleLowerCase("pt-PT")
  );
}

function updateFavoriteButton() {
  if (!favoriteButton || !teamName) {
    return;
  }

  const isFavorite =
    isFavoriteTeam(teamName);

  favoriteButton.textContent =
    isFavorite
      ? "★ Nos favoritos"
      : "☆ Adicionar aos favoritos";

  favoriteButton.setAttribute(
    "aria-pressed",
    String(isFavorite)
  );

  favoriteButton.classList.toggle(
    "is-favorite",
    isFavorite
  );
}

function toggleFavoriteTeam() {
  if (!teamName) {
    return;
  }

  const favorites =
    getFavoriteTeams();

  const existingIndex =
    favorites.findIndex(
      favorite =>
        favorite.toLocaleLowerCase("pt-PT") ===
        teamName.toLocaleLowerCase("pt-PT")
    );

  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
  } else {
    favorites.push(teamName);
  }

  localStorage.setItem(
    favoritesStorageKey,
    JSON.stringify(favorites)
  );

  updateFavoriteButton();
}

favoriteButton?.addEventListener(
  "click",
  toggleFavoriteTeam
);

updateFavoriteButton();

  const teamNameElement =
    document.getElementById("teamName");

  const teamSummary =
    document.getElementById("teamSummary");

const teamContext =
  document.getElementById("teamContext");

  const teamStats =
    document.getElementById("teamStats");

  const recentResults =
    document.getElementById("recentResults");

const teamCompetitions =
  document.getElementById("teamCompetitions");

const teamStandings =
  document.getElementById("teamStandings");

  const upcomingMatches =
    document.getElementById("upcomingMatches");

  if (!teamName) {
    teamNameElement.textContent =
      "Equipa não encontrada";

    teamSummary.textContent =
      "Indique uma equipa para consultar.";

    return;
  }

  teamNameElement.textContent = teamName;
  teamSummary.textContent = "A carregar jogos...";

  try {
    const response =
      await fetch(
        `/api/results/search?q=${encodeURIComponent(teamName)}`
      );

    if (!response.ok) {
      throw new Error(
        "Não foi possível carregar os jogos."
      );
    }

    const matches = await response.json();

const competitionsResponse =
  await fetch("/api/competitions");

if (!competitionsResponse.ok) {
  throw new Error(
    "Não foi possível carregar as competições."
  );
}

const competitions =
  await competitionsResponse.json();
function getAgeGroup(competition) {
  const name =
    String(competition?.name || "")
      .toLocaleLowerCase("pt-PT");

  if (name.includes("petiz")) {
    return "Petizes";
  }

  if (name.includes("traquina")) {
    return "Traquinas";
  }

  if (
    name.includes("sub - 10") ||
    name.includes("sub- 10") ||
    name.includes("sub-10")
  ) {
    return "Sub-10";
  }

  if (
    name.includes("sub - 11") ||
    name.includes("sub- 11") ||
    name.includes("sub-11")
  ) {
    return "Sub-11";
  }

  if (
    name.includes("sub - 12") ||
    name.includes("sub- 12") ||
    name.includes("sub-12")
  ) {
    return "Sub-12";
  }

  if (
    name.includes("sub - 13") ||
    name.includes("sub- 13") ||
    name.includes("sub-13") ||
    name.includes('sub "13"')
  ) {
    return "Sub-13";
  }

  if (
    name.includes("sub - 14") ||
    name.includes("sub- 14") ||
    name.includes("sub-14")
  ) {
    return "Sub-14";
  }

  if (
    name.includes('juniores "a"') ||
    name.includes("juniores a")
  ) {
    return "Juniores A";
  }

  if (
    name.includes('juniores "b"') ||
    name.includes("juniores b")
  ) {
    return "Juniores B";
  }

  if (
    name.includes("sénior") ||
    name.includes("senior") ||
    name.includes("divisão de honra") ||
    name.includes("divisao de honra")
  ) {
    return "Seniores";
  }

  return "Outro";
}

const competitionIds =
  new Set(
    matches
      .map(match => Number(match.competitionId))
      .filter(Number.isInteger)
  );

const teamCompetitionList =
  competitions.filter(competition =>
    competitionIds.has(Number(competition.id))
  );

const availableAgeGroups = [
  ...new Set(
    teamCompetitionList
      .map(competition => getAgeGroup(competition))
      .filter(ageGroup => ageGroup !== "Outro")
  )
];

const ageGroupOrder = [
  "Seniores",
  "Juniores A",
  "Juniores B",
  "Sub-14",
  "Sub-13",
  "Sub-12",
  "Sub-11",
  "Sub-10",
  "Traquinas",
  "Petizes"
];

availableAgeGroups.sort(
  (a, b) =>
    ageGroupOrder.indexOf(a) -
    ageGroupOrder.indexOf(b)
);

const selectedAgeGroup =
  new URLSearchParams(window.location.search)
    .get("ageGroup") || "";

const filteredTeamCompetitionList =
  selectedAgeGroup
    ? teamCompetitionList.filter(
        competition =>
          getAgeGroup(competition) === selectedAgeGroup
      )
    : teamCompetitionList;

const contextSports = [
  ...new Set(
    filteredTeamCompetitionList
      .map(competition =>
        competition.sport === "futsal"
          ? "Futsal"
          : "Futebol"
      )
  )
];

const contextAgeGroup =
  selectedAgeGroup || "Todos os escalões";

const contextCompetitionCount =
  filteredTeamCompetitionList.length;

teamContext.innerHTML = `
  <div class="team-context-item">
    <strong>${contextAgeGroup}</strong>
    <span>Escalão</span>
  </div>

  <div class="team-context-item">
    <strong>
      ${contextSports.join(" · ") || "—"}
    </strong>
    <span>Modalidade</span>
  </div>

  <div class="team-context-item">
    <strong>${contextCompetitionCount}</strong>
    <span>
      ${contextCompetitionCount === 1
        ? "Competição"
        : "Competições"}
    </span>
  </div>
`;

const ageGroupFilter =
  document.createElement("div");

ageGroupFilter.className =
  "team-age-group-filter";

ageGroupFilter.innerHTML = `
  <label for="teamAgeGroup">
    Escalão
  </label>

  <select id="teamAgeGroup">
    <option value="">
      Todos os escalões
    </option>

    ${availableAgeGroups
  .map(ageGroup => `
    <option
      value="${ageGroup}"
      ${ageGroup === selectedAgeGroup ? "selected" : ""}
    >
      ${ageGroup}
    </option>
  `)
  .join("")}
  </select>
`;

teamSummary.insertAdjacentElement(
  "afterend",
  ageGroupFilter
);

const teamAgeGroup =
  document.getElementById("teamAgeGroup");

teamAgeGroup?.addEventListener(
  "change",
  event => {
    const url =
      new URL(window.location.href);

    const ageGroup =
      event.target.value;

    if (ageGroup) {
  url.searchParams.set(
    "ageGroup",
    ageGroup
  );
}
else {
      url.searchParams.delete(
        "ageGroup"
      );
    }

    window.location.href =
      url.toString();
  }
);
console.log(
  "Escalões disponíveis:",
  availableAgeGroups
);

const standingsByCompetition =
  await Promise.all(
    filteredTeamCompetitionList.map(async competition => {
      try {
        const response =
          await fetch(
            `/api/standings/${encodeURIComponent(competition.id)}`
          );

        if (!response.ok) {
          return {
            competition,
            rows: []
          };
        }

        const rows =
          await response.json();

        return {
          competition,
          rows
        };

      } catch {
        return {
          competition,
          rows: []
        };
      }
    })
  );

const teamGroups = [
  ...new Set(
    standingsByCompetition
      .flatMap(({ rows }) =>
        rows
          .filter(standing =>
            standing.teamName
              ?.toLocaleLowerCase("pt-PT")
              .includes(
                teamName.toLocaleLowerCase("pt-PT")
              )
          )
          .map(standing =>
            String(standing.groupName || "").trim()
          )
          .filter(Boolean)
      )
  )
];

if (teamGroups.length) {
  teamContext.insertAdjacentHTML(
    "beforeend",
    `
      <div class="team-context-item">
        <strong>${teamGroups.join(" · ")}</strong>
        <span>Série</span>
      </div>
    `
  );
}

const searchedTeam =
  teamName.toLocaleLowerCase("pt-PT");

const teamStandingRows =
  standingsByCompetition.flatMap(
    ({ competition, rows }) => {

      const groups = new Map();

      rows.forEach(standing => {
        const groupKey =
          standing.groupName || "__NO_GROUP__";

        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }

        groups
          .get(groupKey)
          .push(standing);
      });

      return [...groups.values()]
        .flatMap(groupRows =>
          groupRows
            .map((standing, index) => ({
              ...standing,
              position: index + 1,
              competition
            }))
            .filter(standing =>
              standing.teamName
                .toLocaleLowerCase("pt-PT")
                .includes(searchedTeam)
            )
        );
    }
  );

teamStandings.innerHTML =
  teamStandingRows.length
    ? teamStandingRows.map(standing => `
        <article class="team-standing-card">

          <div class="team-standing-head">

            <div>
              <strong>
                ${standing.teamName}
              </strong>

              <span>
                ${standing.competition.name}
              </span>

              ${
                standing.groupName
                  ? `
                      <span>
                        ${standing.groupName}
                      </span>
                    `
                  : ""
              }
            </div>

            <div class="team-position">
              ${standing.position}.º
            </div>

          </div>

          <div class="team-standing-stats">

            <div>
              <strong>${standing.points}</strong>
              <span>Pontos</span>
            </div>

            <div>
              <strong>${standing.played}</strong>
              <span>Jogos</span>
            </div>

            <div>
              <strong>${standing.wins}</strong>
              <span>Vitórias</span>
            </div>

            <div>
              <strong>${standing.draws}</strong>
              <span>Empates</span>
            </div>

            <div>
              <strong>${standing.losses}</strong>
              <span>Derrotas</span>
            </div>

            <div>
              <strong>
                ${standing.goalsFor}-${standing.goalsAgainst}
              </strong>
              <span>Golos</span>
            </div>

          </div>

        </article>
      `).join("")
    : `
        <p class="team-empty">
          Não existe classificação disponível
          para esta equipa.
        </p>
      `;

teamCompetitions.innerHTML =
  filteredTeamCompetitionList.length
    ? filteredTeamCompetitionList.map(competition => `
        <article class="team-competition">
          <div>
            <strong>
              ${competition.name}
            </strong>

            <span>
              ${competition.season || ""}
            </span>
          </div>

          <a
            href="/results?competitionId=${encodeURIComponent(competition.id)}"
            class="team-competition-link"
          >
            Ver competição →
          </a>
        </article>
      `).join("")
    : `
        <p class="team-empty">
          Não foram identificadas competições.
        </p>
      `;

    const selectedCompetitionIds =
  new Set(
    filteredTeamCompetitionList
      .map(competition => Number(competition.id))
  );
const filteredMatches =
  selectedAgeGroup
    ? matches.filter(match =>
        selectedCompetitionIds.has(
          Number(match.competitionId)
        )
      )
    : matches;

teamSummary.textContent =
  `${filteredMatches.length} jogos encontrados`;

const now = new Date();

const playedMatches = filteredMatches

      .filter(match =>
        match.playedAt &&
        new Date(match.playedAt) <= now &&
        match.homeScore !== null &&
        match.awayScore !== null
      )
      .sort(
        (a, b) =>
          new Date(b.playedAt) -
          new Date(a.playedAt)
      );

    const upcoming = filteredMatches
      .filter(match =>
        match.playedAt &&
        new Date(match.playedAt) > now
      )
      .sort(
        (a, b) =>
          new Date(a.playedAt) -
          new Date(b.playedAt)
      );

    const lastFive =
      playedMatches.slice(0, 5);

    const nextFive =
      upcoming.slice(0, 5);

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    playedMatches.forEach(match => {
      const searchedTeam =
        teamName.toLocaleLowerCase("pt-PT");

      const homeTeam =
        match.homeTeam.toLocaleLowerCase("pt-PT");

      const isHome =
        homeTeam.includes(searchedTeam);

      const teamGoals =
        isHome
          ? match.homeScore
          : match.awayScore;

      const opponentGoals =
        isHome
          ? match.awayScore
          : match.homeScore;

      goalsFor += teamGoals;
      goalsAgainst += opponentGoals;

      if (teamGoals > opponentGoals) {
        wins++;
      } else if (teamGoals === opponentGoals) {
        draws++;
      } else {
        losses++;
      }
    });

    teamStats.innerHTML = `
      <div class="team-stat">
        <strong>${playedMatches.length}</strong>
        <span>Jogos realizados</span>
      </div>

      <div class="team-stat">
        <strong>${wins}</strong>
        <span>Vitórias</span>
      </div>

      <div class="team-stat">
        <strong>${draws}</strong>
        <span>Empates</span>
      </div>

      <div class="team-stat">
        <strong>${losses}</strong>
        <span>Derrotas</span>
      </div>

      <div class="team-stat">
        <strong>${goalsFor}</strong>
        <span>Golos marcados</span>
      </div>

      <div class="team-stat">
        <strong>${goalsAgainst}</strong>
        <span>Golos sofridos</span>
      </div>
    `;

    recentResults.innerHTML =
      lastFive.length
        ? lastFive.map(match => `
            <article class="team-match">
              <div>
                <strong>${match.homeTeam}</strong>
              </div>

              <div class="team-score">
                ${match.homeScore}
                -
                ${match.awayScore}
              </div>

              <div>
                <strong>${match.awayTeam}</strong>
              </div>

              <small>
                ${new Date(match.playedAt)
                  .toLocaleDateString("pt-PT")}
              </small>
            </article>
          `).join("")
        : `
            <p class="team-empty">
              Sem resultados recentes.
            </p>
          `;

    upcomingMatches.innerHTML =
      nextFive.length
        ? nextFive.map(match => `
            <article class="team-match">
              <div>
                <strong>${match.homeTeam}</strong>
              </div>

              <div class="team-score">
                vs
              </div>

              <div>
                <strong>${match.awayTeam}</strong>
              </div>

              <small>
                ${new Date(match.playedAt)
                  .toLocaleDateString("pt-PT")}
                ${match.venue
                  ? ` · ${match.venue}`
                  : ""}
              </small>
            </article>
          `).join("")
        : `
            <p class="team-empty">
              Sem próximos jogos.
            </p>
          `;

  } catch (error) {
    console.error("TEAM_PAGE_ERROR", error);

    teamSummary.textContent =
      "Não foi possível carregar os dados da equipa.";
  }
})();