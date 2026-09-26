import { getUpdates } from "./services/telegram.service.js";
import { handleInterviewMessage } from "./modules/interview/service.js";
import { sendMessage } from "./services/telegram.service.js";

let offset: number | undefined;

async function startBot() {
    console.log("Bot iniciado. Aguardando mensagens...");

    while (true) {
        try {
            const response = await getUpdates(offset);

            if (!response.ok || !Array.isArray(response.result)) {
                console.error("Resposta inválida do Telegram.");
                continue;
            }

            for (const update of response.result) {
                offset = update.update_id + 1;

                const message = update.message;

                if (!message?.text) {
                    continue;
                }

                console.log(
                    `[Telegram] ${message.chat.id}: ${message.text}`,
                );

                const result = await handleInterviewMessage(
                    String(message.chat.id),
                    message.text,
                );

                await sendMessage(
                    message.chat.id,
                    result.reply,
                );
            }
        } catch (error) {
            console.error("Erro no polling:", error);

            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}

startBot();