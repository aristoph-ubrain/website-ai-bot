import { generateLovablePrompt } from "./modules/interview/lovable-prompt.js";
import type { WebsiteBrief } from "./modules/interview/types.js";

const brief: WebsiteBrief = {
  businessName: "Corte 10",
  businessType: "Barbearia",
  description: "Barbearia especializada em cortes masculinos.",
  services: [
    {
      name: "Corte masculino",
      description: "Corte tradicional e moderno.",
      price: "R$ 35,00",
    },
    {
      name: "Barba",
      description: "Modelagem e acabamento de barba.",
      price: "R$ 25,00",
    },
  ],
  targetAudience: "Homens da região de Maraponga e Fortaleza.",
  city: "Fortaleza",
  neighborhood: "Maraponga",
  address: null,
  whatsapp: "5585999999999",
  instagram: "Não possui",
  openingHours: "Segunda a sábado, das 8h às 19h.",
  style: "Moderno e masculino",
  colors: ["preto", "dourado"],
  sections: [
    "Início",
    "Sobre",
    "Serviços",
    "Contato",
  ],
  mainGoal: "Conseguir novos clientes pelo WhatsApp",
  requestedFeatures: [
  "receber pedidos pelo WhatsApp",
  "criar cardápio",
],
};

const prompt = await generateLovablePrompt(brief);

console.log(prompt);