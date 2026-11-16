import axios from "axios";

export async function fetchWebsiteContent(
  url: string
): Promise<string> {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent": "AFVRResultadosBot/1.0"
    }
  });

  return response.data;
}