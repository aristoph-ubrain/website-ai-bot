import { generateText } from "./services/gemini.service.js";

const response = await generateText(
  "Responda apenas: serviço Gemini funcionando!"
);

console.log(response);