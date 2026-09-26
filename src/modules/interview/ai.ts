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
      description: "Mensagem que será enviada ao cliente.",
    },

    complete: {
      type: "boolean",
      description: "Indica se a entrevista já terminou.",
    },

    brief: {
      type: "object",
      properties: {
        businessName: {
          type: ["string", "null"],
        },

        businessType: {
          type: ["string", "null"],
        },

        description: {
          type: ["string", "null"],
        },

        services: {
          type: "array",
          description:
            "Produtos ou serviços mencionados pelo cliente. Não invente itens.",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
              },
              description: {
                type: ["string", "null"],
              },
              price: {
                type: ["string", "null"],
              },
            },
            required: [
              "name",
              "description",
              "price",
            ],
          },
        },

        targetAudience: {
          type: ["string", "null"],
        },

        city: {
          type: ["string", "null"],
        },

        neighborhood: {
          type: ["string", "null"],
        },

        address: {
          type: ["string", "null"],
        },

        whatsapp: {
          type: ["string", "null"],
        },

        instagram: {
          type: ["string", "null"],
        },

        openingHours: {
          type: ["string", "null"],
        },

        style: {
          type: ["string", "null"],
        },

        colors: {
          type: "array",
          items: {
            type: "string",
          },
        },

        sections: {
          type: "array",
          items: {
            type: "string",
          },
        },

        mainGoal: {
          type: ["string", "null"],
        },

        requestedFeatures: {
          type: "array",
          description:
            "Funcionalidades explicitamente solicitadas pelo cliente.",
          items: {
            type: "string",
          },
        },
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
        "requestedFeatures",
      ],
    },
  },

  required: [
    "reply",
    "complete",
    "brief",
  ],
};

export async function processInterviewMessage(
  brief: WebsiteBrief,
  message: string,
  questionsRemaining: number,
): Promise<InterviewAIResult> {
  const prompt = `
Você é um entrevistador especializado em criação de sites para microempreendedores.

Seu objetivo é coletar informações suficientes para criar um briefing
que será usado posteriormente para gerar um prompt para o Lovable.

REGRAS OBRIGATÓRIAS:

- Analise a mensagem do cliente.
- Atualize o briefing somente com informações fornecidas pelo cliente.
- Nunca invente informações.
- Preserve todas as informações já existentes.
- Nunca substitua uma informação existente por null.
- Faça apenas UMA pergunta por vez.
- Nunca repita uma pergunta que o cliente já respondeu.
- Se o cliente disser "não", "não tenho", "não possui", "não quero"
  ou algo equivalente, considere aquela informação como respondida.
- Para campos opcionais, quando o cliente responder negativamente,
  use uma indicação como "Não possui" em vez de null.
- null significa somente que a informação ainda não foi perguntada
  ou ainda não foi respondida.
- Se o cliente mencionar produtos ou serviços, registre-os em services.
- Não crie preços, descrições ou produtos que o cliente não informou.
- Separe claramente o objetivo principal do site das funcionalidades.
- "Quero mais clientes pelo WhatsApp" é um objetivo comercial.
  Isso NÃO significa automaticamente agendamento, reserva, checkout,
  pagamento ou sistema de pedidos.
- Só registre uma funcionalidade em requestedFeatures quando o cliente
  tiver pedido ou mencionado explicitamente essa funcionalidade.
- "Criar cardápio" deve ser registrado como funcionalidade solicitada.
  Isso não significa que produtos do cardápio já foram fornecidos.
- "WhatsApp" como canal de contato não significa que deve existir
  um sistema de pedidos, carrinho ou checkout.
- Se o cliente informar apenas o nome de um produto, registre o nome
  sem inventar preço, descrição ou ingredientes.
- Seja natural, amigável e objetivo.
- Use português do Brasil.
- Faça perguntas fáceis de responder por uma pessoa que não entende
  termos de marketing ou desenvolvimento.
- Evite expressões técnicas como "perfil do público".
  Prefira perguntas como "Quem costuma comprar de vocês?".
- Você pode fazer no máximo ${questionsRemaining} pergunta(s) adicional(is).
- Se questionsRemaining for 0, não faça nenhuma pergunta e finalize a entrevista.
- Quando não houver necessidade de continuar perguntando, marque complete como true.

BRIEFING ATUAL:
${JSON.stringify(brief, null, 2)}

MENSAGEM DO CLIENTE:
${message}

Retorne:
1. a resposta para o cliente;
2. se a entrevista terminou;
3. o briefing atualizado.
`;

  const response = await generateStructuredText(
    prompt,
    interviewResponseSchema,
  );

  const result = JSON.parse(response) as InterviewAIResult;

  if (questionsRemaining === 0) {
    result.complete = true;
    result.reply =
      "Perfeito! Já tenho as informações necessárias para preparar o prompt do seu site.";
  }

  return result;
}