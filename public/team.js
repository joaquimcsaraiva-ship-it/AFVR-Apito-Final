(async () => {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const teamName =
    params.get("name");

  if (!teamName) {

    document.body.innerHTML =
      "<h1>Equipa não encontrada</h1>";

    return;

  }

  document.getElementById("teamName")
    .textContent = teamName;

  const response =
    await fetch(
      `/api/results/search?q=${encodeURIComponent(teamName)}`
    );

  const matches =
    await response.json();

  document.getElementById(
    "teamSummary"
  ).textContent =
    `${matches.length} jogos encontrados`;

})();