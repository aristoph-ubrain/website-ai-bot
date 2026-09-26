import { sendMessage } from "./services/telegram.service.js";

await sendMessage(
  8770550168,
  "Olá! Aqui é o Meu Site IA 🤖",
);

console.log("Mensagem enviada!");