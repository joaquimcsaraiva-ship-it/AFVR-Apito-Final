import pool from "../config/database";

const clubs = [
  {
    clubName: "SC Vila Real",
    websiteUrl: "https://scvila.pt",
    facebookUrl: "https://facebook.com/SCVilaReal",
    instagramUrl: "https://instagram.com/scvila"
  },
  {
    clubName: "Mondinense FC",
    websiteUrl: "https://mondinensefc.pt",
    facebookUrl: "https://facebook.com/MondinenseFC",
    instagramUrl: "https://instagram.com/mondinensefc"
  },
  {
    clubName: "Abambres SC",
    websiteUrl: "https://abambressc.pt",
    facebookUrl: "https://facebook.com/AbambresSC",
    instagramUrl: "https://instagram.com/abambressc"
  },
  {
    clubName: "SC Régua",
    websiteUrl: "https://scregua.com",
    facebookUrl: "https://facebook.com/SCRégua",
    instagramUrl: null
  }
];

async function seed() {
  for (const club of clubs) {
    await pool.query(
      `
      INSERT INTO club_sources (
        club_name,
        website_url,
        facebook_url,
        instagram_url,
        active
      )
      VALUES ($1,$2,$3,$4,true)
      ON CONFLICT DO NOTHING
      `,
      [
        club.clubName,
        club.websiteUrl,
        club.facebookUrl,
        club.instagramUrl
      ]
    );

    console.log(`Inserido: ${club.clubName}`);
  }

  await pool.end();
}

seed().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});