import { generateText } from "../../services/gemini.service.js";
import { normalizeBrazilianWhatsApp } from "./phone.js";
import type { WebsiteBrief } from "./types.js";

export async function generateLovablePrompt(
  brief: WebsiteBrief,
): Promise<string> {
  const whatsapp = normalizeBrazilianWhatsApp(
    brief.whatsapp,
  );

  const whatsappLink = whatsapp
    ? `https://wa.me/${whatsapp}`
    : null;

  const prompt = `
Você é um especialista em criação de prompts para o Lovable.

Sua tarefa é transformar o briefing abaixo em UM ÚNICO prompt completo
para criar um site profissional.

REGRAS OBRIGATÓRIAS:

- Retorne SOMENTE o prompt final para o Lovable.
- Não escreva explicações antes ou depois.
- Use português do Brasil.
- Não invente informações sobre o negócio.
- Não invente produtos, serviços, preços, horários, endereço,
  avaliações, depoimentos, Instagram, imagens ou dados comerciais.
- Preserve fielmente as informações fornecidas.
- O objetivo comercial e as funcionalidades são coisas diferentes.
- Nunca transforme um objetivo comercial em uma funcionalidade
  que não foi solicitada.

EXEMPLOS:
- "Quero conseguir novos clientes pelo WhatsApp"
  NÃO significa automaticamente agendamento online.
- "Quero receber pedidos pelo WhatsApp"
  NÃO significa automaticamente carrinho ou checkout.
- "Quero criar um cardápio"
  significa criar a estrutura visual do cardápio,
  mas NÃO significa inventar pizzas, preços, ingredientes ou produtos.
- "Quero um sistema de pedidos online"
  significa que essa funcionalidade foi explicitamente solicitada.

SOBRE PRODUTOS E SERVIÇOS:
- Use somente os produtos/serviços existentes no briefing.
- Se um produto ou serviço não tiver preço, não invente preço.
- Se um produto ou serviço não tiver descrição, não invente descrição.
- Se o cliente pediu um cardápio, catálogo ou lista de produtos mas
  ainda não forneceu os itens, crie apenas a estrutura preparada
  para receber esses dados posteriormente.

SOBRE FUNCIONALIDADES:
- Inclua somente funcionalidades listadas em requestedFeatures.
- Não adicione sistemas de login, pagamento, checkout, reservas,
  agendamento, carrinho, painel administrativo ou banco de pedidos
  sem que tenham sido explicitamente solicitados.

SOBRE WHATSAPP:
- Se houver um número válido no briefing, crie um CTA para contato
  pelo WhatsApp.
- Use este link quando disponível:
  ${whatsappLink ?? "não há número válido informado"}
- O botão deve servir para contato somente.
- Não transforme contato em agendamento ou pedido automático,
  a menos que isso tenha sido explicitamente solicitado.

SOBRE CARDÁPIO/CATÁLOGO:
- Se "criar cardápio", "criar catálogo" ou funcionalidade equivalente
  estiver em requestedFeatures, crie uma seção visual apropriada.
- Se não houver produtos cadastrados, deixe a seção preparada
  para receber os produtos posteriormente.
- Não invente itens para preencher a seção.

DESIGN:
- O site deve ser responsivo para celular, tablet e desktop.
- Utilize o estilo e as cores fornecidos pelo cliente.
- Crie uma hierarquia visual profissional.
- Use CTAs coerentes com o objetivo informado.
- Não adicione funcionalidades apenas porque seriam comuns para
  aquele tipo de negócio.

ESTRUTURA:
- Respeite as seções explicitamente informadas.
- Caso algumas seções fundamentais sejam necessárias para uma boa
  experiência, você pode criar uma estrutura visual básica,
  mas sem inventar fatos sobre o negócio.
- Organize o site de forma clara e profissional.

BRIEFING:
${JSON.stringify(brief, null, 2)}
`;

  return generateText(prompt);
}