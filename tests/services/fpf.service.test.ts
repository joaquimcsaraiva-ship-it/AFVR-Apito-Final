import { extractFpfSeriesBlocks, parseStaticFixtures, type FpfCompetition } from "../../src/services/fpf.service";

const competition: FpfCompetition = {
  fpfCompetitionId: 29925,
  seasonId: 106,
  season: "2026/2027",
  name: "Taça Distrital",
  sport: "football",
  detailsUrl: "https://centroderesultados-as-prd.azurewebsites.net/Competition/Details?competitionId=29925&seasonId=106"
};

describe("FPF static fixture parser", () => {
  it("keeps each FPF zone or series attached to its own fixture container", () => {
    const html = `
      <div id="htmlSerieId_1"><div class="title">ZONA-CENTRO</div>
        <div><a href="/Competition/GetClassificationAndMatchesByFixture?fixtureId=1">1</a></div>
      </div>
      <div id="htmlSerieId_2"><div class="title">ZONA-NORTE</div>
        <div><a href="/Competition/GetClassificationAndMatchesByFixture?fixtureId=2">1</a></div>
      </div>
    `;

    expect(extractFpfSeriesBlocks(html).map((block) => block.groupName)).toEqual([
      "Zona Centro",
      "Zona Norte"
    ]);
  });

  it("reads visible team, date, time and venue fields from match cards", () => {
    const html = `
      <h3>1º ENCONTRO - 15 NOVEMBRO 2026</h3>
      <div>JOGOS</div>
      <article>
        <span>Gd Boticas</span><span>15 NOV</span><time>10:00</time>
        <span>Academia Johnson Januário</span><div>Pavilhão Municipal Boticas</div>
      </article>
      <article>
        <div>Sc Cumieira 1 DEZ</div><span>14:30 Vidago Fc</span>
        <span>Campo Flávia</span>
      </article>
    `;

    const matches = parseStaticFixtures(html, competition);

    expect(matches).toHaveLength(2);
    expect(matches[0]).toMatchObject({
      homeTeam: "Gd Boticas",
      awayTeam: "Academia Johnson Januário",
      playedAt: "2026-11-15T10:00:00.000Z",
      venue: "Pavilhão Municipal Boticas",
      status: "scheduled"
    });
    expect(matches[1]).toMatchObject({
      homeTeam: "Sc Cumieira",
      awayTeam: "Vidago Fc",
      playedAt: "2026-12-01T14:30:00.000Z",
      venue: "Campo Flávia",
      status: "scheduled"
    });
    expect(matches.some((match) => match.homeTeam === "1º ENCONTRO -")).toBe(false);
  });

  it("ignores score tokens that appear where a home team should be", () => {
    const html = `
      <article><span>1 - 4</span><span>15 NOV</span><time>10:00</time>
        <span>Sport Clube De Vila Real</span>
      </article>
      <article><span>Gd Boticas</span><span>16 NOV</span><time>11:00</time>
        <span>Academia Johnson Januário</span>
      </article>
    `;

    const matches = parseStaticFixtures(html, competition);
    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({ homeTeam: "Gd Boticas", awayTeam: "Academia Johnson Januário" });
  });
});
