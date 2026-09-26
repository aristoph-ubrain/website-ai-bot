import { createEmptyBrief } from "./modules/interview/brief.js";
import { processInterviewMessage } from "./modules/interview/ai.js";

let brief = createEmptyBrief();

let result = await processInterviewMessage(
  brief,
  "Tenho uma barbearia chamada Corte 10 em Maraponga, Fortaleza.",
);

console.log("1ª resposta:");
console.log(result.reply);

brief = result.brief;

result = await processInterviewMessage(
  brief,
  "Quero o site principalmente para conseguir novos clientes pelo WhatsApp.",
);

console.log("\n2ª resposta:");
console.log(result.reply);

console.log("\nEntrevista concluída:", result.complete);

console.log("\nBriefing final:");
console.dir(result.brief, { depth: null });