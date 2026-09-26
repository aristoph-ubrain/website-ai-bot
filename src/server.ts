import Fastify from "fastify";
import { prisma } from "./database/prisma.js";
import { generateText } from "./services/gemini.service.js";

const app = Fastify({
    logger: true,
});

app.get("/", async () => {
    return {
        message: "API funcionando!",
    };
});

app.get("/db", async () => {
    const customers = await prisma.customer.count();

    return {
        database: "connected",
        customers,
    };
});

const start = async () => {
    try {
        await app.listen({
            port: 3000,
            host: "0.0.0.0",
        });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};
app.get("/ai", async () => {
    const response = await generateText(
        "Responda apenas: Fastify conectado ao Gemini!"
    );

    return {
        response,
    };
});
start();