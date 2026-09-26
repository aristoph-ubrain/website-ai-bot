import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN não foi definido.");
}

const baseUrl = `https://api.telegram.org/bot${token}`;

export async function getBotInfo() {
  const response = await fetch(`${baseUrl}/getMe`);

  if (!response.ok) {
    throw new Error(`Erro na API do Telegram: ${response.status}`);
  }

  return response.json();
}
export async function getUpdates(offset?: number) {
  const url = new URL(`${baseUrl}/getUpdates`);

  url.searchParams.set("timeout", "30");

  if (offset !== undefined) {
    url.searchParams.set("offset", String(offset));
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro na API do Telegram: ${response.status}`);
  }

  return response.json();
}
export async function sendMessage(
  chatId: number,
  text: string,
) {
  const response = await fetch(`${baseUrl}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao enviar mensagem: ${response.status}`);
  }

  return response.json();
}