import { handleInterviewMessage } from "./modules/interview/service.js";
import { prisma } from "./database/prisma.js";

try {
  const whatsapp = "5585999999998";

  const firstResult = await handleInterviewMessage(
    whatsapp,
    "Tenho uma barbearia chamada Corte 10 em Maraponga, Fortaleza.",
  );

  console.log("1ª resposta:");
  console.log(firstResult.reply);

  const secondResult = await handleInterviewMessage(
    whatsapp,
    "Quero o site principalmente para conseguir novos clientes pelo WhatsApp.",
  );

  console.log("\n2ª resposta:");
  console.log(secondResult.reply);

  console.log("\nConcluída:", secondResult.complete);

  console.log("\nBriefing:");
  console.dir(secondResult.brief, { depth: null });

  console.log("\nEntrevista:");
  console.log(secondResult.interview);
} finally {
  await prisma.$disconnect();
}