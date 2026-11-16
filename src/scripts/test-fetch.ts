import { fetchWebsiteContent }
  from "../services/club-fetch.service";

async function run() {

  const html =
    await fetchWebsiteContent(
      "https://gdchaves.pt"
    );

  console.log(
    "HTML recebido:",
    html.length
  );

  console.log(
    html.substring(0, 500)
  );
}

run().catch(console.error);