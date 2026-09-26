import { createEmptyBrief } from "./modules/interview/brief.js";
import { processInterviewMessage } from "./modules/interview/ai.js";

const brief = createEmptyBrief();

const result = await processInterviewMessage(
  brief,
  "Tenho uma barbearia chamada Corte 10 em Maraponga, Fortaleza.",
  0,
);

console.log("Resposta:");
console.log(result.reply);

console.log("\nConcluída:");
console.log(result.complete);

console.log("\nBriefing:");
console.dir(result.brief, { depth: null });