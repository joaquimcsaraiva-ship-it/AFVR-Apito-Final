import pool from "../config/database";

interface ClubSeed {
  clubName: string;
  websiteUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  active: boolean;
}

const clubs: ClubSeed[] = [
  {
    clubName: "GD Chaves",
    websiteUrl: "https://gdchaves.pt",
    facebookUrl: "https://www.facebook.com/GDChaves/",
    instagramUrl: "https://www.instagram.com/grupo_desportivo_chaves/",
    active: true
  },
  {
    clubName: "SC Régua",
    websiteUrl: "https://scregua.com",
    facebookUrl: "https://www.facebook.com/PaginaOficialSportClubedaRegua/",
    instagramUrl: "https://www.instagram.com/scregua/",
    active: true
  },
  {
    clubName: "Associação Vale d'Ouro",
    websiteUrl: "https://pinhao-futsal.associacaovaledouro.pt",
    facebookUrl: "https://www.facebook.com/associacaovaledouro/",
    instagramUrl: null,
    active: true
  },
  {
    clubName: "Casa do Povo de Vilarandelo",
    websiteUrl: "https://casapovovilarandelo.com/futsal/",
    facebookUrl: "https://www.facebook.com/futsalcpvilarandelo/",
    instagramUrl: "https://www.instagram.com/cpvfutsal/",
    active: true
  },

  {
    clubName: "Abambres SC",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/abambressportclub/",
    instagramUrl: "https://www.instagram.com/abambressportclub/",
    active: true
  },
  {
    clubName: "ADC Constantim",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/ADCConstantim/",
    instagramUrl: "https://www.instagram.com/adcconstantim/",
    active: true
  },
  {
    clubName: "Atei FC",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/AteiFC/",
    instagramUrl: null,
    active: true
  },
  {
    clubName: "FC Fontelas",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/FCFontelas/",
    instagramUrl: "https://www.instagram.com/fcfontelas/",
    active: true
  },
  {
    clubName: "FC Santa Marta",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/fcsantamartapenaguiao/",
    instagramUrl: "https://www.instagram.com/fc.santamarta/",
    active: true
  },
  {
    clubName: "GD Cerva",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/GrupoDesportivodeCerva/",
    instagramUrl: "https://www.instagram.com/grupodesportivodecerva/",
    active: true
  },
  {
    clubName: "GD Valpaços",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/gdvportugalmail.pt/",
    instagramUrl: null,
    active: true
  },
  {
    clubName: "GD Vilar de Perdizes",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/vilardeperdizes.futebol/",
    instagramUrl: "https://www.instagram.com/gd_vilar_de_perdizes/",
    active: true
  },
  {
    clubName: "GDC Salto",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/p/Grupo-Desportivo-e-Cultural-de-Salto-100063043970634/",
    instagramUrl: "https://www.instagram.com/gdcsalto/",
    active: true
  },
  {
    clubName: "Juventude de Pedras Salgadas",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/juventudepedrassalgadas/",
    instagramUrl: "https://www.instagram.com/juventudepedrassalgadas/",
    active: true
  },
  {
    clubName: "Mondinense FC",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/mondinense/",
    instagramUrl: "https://www.instagram.com/mondinensefc/",
    active: true
  },
  {
    clubName: "Sabroso SC",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/sabrososc/",
    instagramUrl: "https://www.instagram.com/sabroso_sc/",
    active: true
  },
  {
    clubName: "SC Cumieira",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/SCCumieira/",
    instagramUrl: "https://www.instagram.com/s.c.cumieira/",
    active: true
  },
  {
    clubName: "SC Mesão Frio",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/S.C.MesaoFrio/",
    instagramUrl: "https://www.instagram.com/s.c.mesaofrio/",
    active: true
  },
  {
    clubName: "SC Vila Pouca de Aguiar",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/SCVPA1963/",
    instagramUrl: "https://www.instagram.com/scvpa_1963/",
    active: true
  },
  {
    clubName: "SC Vila Real",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/scvilareal/",
    instagramUrl: "https://www.instagram.com/scvilareal/",
    active: true
  },
  {
    clubName: "Vidago FC",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/VidagoFC/",
    instagramUrl: "https://www.instagram.com/vidago_fc/",
    active: true
  },

  {
    clubName: "AD Lobrigos",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/p/AD-Lobrigos-61577884344453/",
    instagramUrl: "https://www.instagram.com/adlobrigos/",
    active: true
  },
  {
    clubName: "ACDR Souto Maior",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/p/ACDR-Souto-Maior-Futsal-61560111040980/",
    instagramUrl: "https://www.instagram.com/acdr_soutomaiorfutsal/",
    active: true
  },
  {
    clubName: "Amigos Abeira Douro",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/p/Associação-Amigos-Abeira-Douro-100057336645041/",
    instagramUrl: "https://www.instagram.com/amigos_abeira_douro/",
    active: true
  },
  {
    clubName: "ASM Vila Marim",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/p/Asm-Vila-Marim-100071839210215/",
    instagramUrl: "https://www.instagram.com/asm_vila_marim/",
    active: true
  },
  {
    clubName: "AHBV Provesende",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/p/Provezende-Futsal-100064846296748/",
    instagramUrl: null,
    active: true
  },
  {
    clubName: "CDC Montalegre",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/CentroDesportivoCulturalMontalegre/",
    instagramUrl: null,
    active: true
  },
  {
    clubName: "GD Boticas",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/grupodesportivoboticas/",
    instagramUrl: "https://www.instagram.com/gdboticas/",
    active: true
  },
  {
    clubName: "Hóquei Clube Flaviense",
    websiteUrl: null,
    facebookUrl: "https://www.facebook.com/p/Hóquei-Clube-Flaviense-100063671855458/",
    instagramUrl: null,
    active: true
  },

  { clubName: "AC Alijoense", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "Académico Alves Roçadas", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "ADCE Diogo Cão", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "ADE Geração Talentos", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "AUDC Sabrosa", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "CCP Alto Douro", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "CD Sanfinense", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "FC Lordelo", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true },
  { clubName: "GD Ribeira de Pena", websiteUrl: null, facebookUrl: null, instagramUrl: null, active: true }
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
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT DO NOTHING
      `,
      [
        club.clubName,
        club.websiteUrl,
        club.facebookUrl,
        club.instagramUrl,
        club.active
      ]
    );

    console.log(`✓ ${club.clubName}`);
  }

  console.log(`Importados ${clubs.length} clubes.`);
  await pool.end();
}

seed().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});