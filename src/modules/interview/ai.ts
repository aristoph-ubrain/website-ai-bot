import { generateStructuredText } from "../../services/gemini.service.js";
import type { WebsiteBrief } from "./types.js";

export interface InterviewAIResult {
  reply: string;
  complete: boolean;
  brief: WebsiteBrief;
}
const interviewResponseSchema = {
  type: "object",
  properties: {
    reply: {
      type: "string",
      description: "Mensagem que será enviada ao cliente no WhatsApp.",
    },
    complete: {
      type: "boolean",
      description: "Indica se a entrevista já possui informações suficientes.",
    },
    brief: {
      type: "object",
      properties: {
        businessName: { type: ["string", "null"] },
        businessType: { type: ["string", "null"] },
        description: { type: ["string", "null"] },

        services: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: ["string", "null"] },
              price: { type: ["string", "null"] },
            },
            required: ["name", "description", "price"],
          },
        },

        targetAudience: { type: ["string", "null"] },

        city: { type: ["string", "null"] },
        neighborhood: { type: ["string", "null"] },
        address: { type: ["string", "null"] },

        whatsapp: { type: ["string", "null"] },
        instagram: { type: ["string", "null"] },

        openingHours: { type: ["string", "null"] },

        style: { type: ["string", "null"] },

        colors: {
          type: "array",
          items: { type: "string" },
        },

        sections: {
          type: "array",
          items: { type: "string" },
        },

        mainGoal: { type: ["string", "null"] },
      },
      required: [
        "businessName",
        "businessType",
        "description",
        "services",
        "targetAudience",
        "city",
        "neighborhood",
        "address",
        "whatsapp",
        "instagram",
        "openingHours",
        "style",
        "colors",
        "sections",
        "mainGoal",
      ],
    },
  },
  required: ["reply", "complete", "brief"],
};
export async function processInterviewMessage(
  brief: WebsiteBrief,
  message: string,
): Promise<InterviewAIResult> {
  const prompt = `
Você é um entrevistador especializado em criação de sites para microempreendedores.

Seu objetivo é coletar informações suficientes para criar um site profissional.

REGRAS:
- Analise a mensagem do cliente.
- Atualize o briefing somente com informações fornecidas pelo cliente.
- Nunca invente informações.
- Preserve informações já existentes.
- Não apague informações já preenchidas.
- Faça apenas UMA pergunta por vez.
- A pergunta deve buscar uma informação relevante que ainda esteja faltando.
- Quando o briefing estiver suficientemente completo, marque complete como true.
- Seja natural, amigável e objetivo.
- Responda em português do Brasil.

BRIEFING ATUAL:
${JSON.stringify(brief, null, 2)}

MENSAGEM DO CLIENTE:
${message}

Retorne o briefing atualizado, a próxima resposta para o cliente e indique se a entrevista terminou.
`;

const response = await generateStructuredText(
  prompt,
  interviewResponseSchema,
);

  return JSON.parse(response) as InterviewAIResult;
}