import {
  fetchWebsiteContent
} from "../services/club-fetch.service";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt/gd-chaves-recebe-o-fc-penafiel-na-10-a-jornada/"
    );

  console.log(
    html.substring(0, 3000)
  );
}

run().catch(console.error);