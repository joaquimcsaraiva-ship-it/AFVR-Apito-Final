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

const standingsByCompetition =
  await Promise.all(
    teamCompetitionList.map(async competition => {
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
  teamCompetitionList.length
    ? teamCompetitionList.map(competition => `
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

    teamSummary.textContent =
      `${matches.length} jogos encontrados`;

    const now = new Date();

    const playedMatches = matches
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

    const upcoming = matches
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