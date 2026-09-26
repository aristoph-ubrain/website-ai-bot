import {
    getUpdates,
    sendMessage,
} from "./services/telegram.service.js";

import {
    handleInterviewMessage,
    startNewInterview,
} from "./modules/interview/service.js";

let offset: number | undefined;

async function handleTelegramMessage(
    chatId: number,
    text: string,
) {
    if (text === "/start") {
        await startNewInterview(String(chatId));

        const result = await handleInterviewMessage(
            String(chatId),
            "Olá, quero criar um novo site.",
        );

        await sendMessage(
            chatId,
            result.reply,
        );

        return;
    }

    const result = await handleInterviewMessage(
        String(chatId),
        text,
    );

    await sendMessage(
        chatId,
        result.reply,
    );
}

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

                await handleTelegramMessage(
                    message.chat.id,
                    message.text,
                );
            }
        } catch (error) {
            console.error("Erro no polling:", error);

            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}

startBot();