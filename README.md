# website-ai-bot

Bot de entrevistas para levantamento de requisitos de sites.

O **website-ai-bot** conversa com o dono de um pequeno negócio pelo **Telegram**, faz perguntas uma por vez para descobrir as informações importantes do negócio e transforma as respostas em um **brief estruturado**. Quando a entrevista termina, o sistema usa IA para gerar um **prompt final pronto para colar no Lovable**, permitindo que o Lovable seja responsável pela geração do site.

> Status atual: o fluxo principal está funcionando localmente com **Telegram + Gemini + Prisma + SQLite**.

---

## 1. O que o projeto faz

O projeto foi pensado para automatizar a etapa de levantamento de requisitos antes da criação de um site.

Em vez de pedir para o cliente preencher um formulário enorme, o bot conduz uma conversa simples:

1. O cliente inicia a conversa pelo Telegram.
2. O bot cria uma nova entrevista.
3. A IA faz uma pergunta por vez.
4. Cada resposta atualiza o briefing do negócio.
5. O sistema preserva informações já coletadas.
6. O sistema evita inventar dados que o cliente não forneceu.
7. Existe um limite máximo de perguntas.
8. Ao concluir a entrevista, a IA gera um prompt completo para o Lovable.
9. O prompt é enviado de volta pelo Telegram.
10. Uma nova entrevista é criada automaticamente para que o próximo atendimento comece limpo.

---

## 2. Fluxo geral

```text
Cliente
   │
   ▼
Telegram
   │
   ▼
src/telegram-bot.ts
   │
   ▼
handleInterviewMessage()
   │
   ├── busca/cria entrevista
   │
   ├── carrega briefing
   │
   ▼
processInterviewMessage()
   │
   ├── Gemini
   │
   ├── interpreta resposta
   │
   ├── atualiza briefing
   │
   └── gera próxima pergunta
   │
   ▼
Prisma / SQLite
   │
   ▼
Entrevista concluída
   │
   ▼
generateLovablePrompt()
   │
   ▼
Prompt final para Lovable
   │
   ▼
Telegram → Cliente
   │
   ▼
Nova entrevista ativa
```

---

## 3. Tecnologias

### Backend

- **Node.js**
- **TypeScript**
- **tsx** para executar TypeScript durante o desenvolvimento

### IA

- **Google Gemini** através do pacote `@google/genai`
- Saída estruturada para transformar respostas do usuário em dados do briefing

### Banco de dados

- **Prisma ORM**
- **SQLite** para desenvolvimento local
- Configuração compatível com **Prisma 7** usando `prisma7.config.ts`

### Mensageria

- **Telegram Bot API**
- Atualmente utilizando **long polling (`getUpdates`)**

### Geração do site

- O sistema **não gera o site diretamente**.
- Ele gera um **prompt estruturado para o Lovable**.

---

## 4. Estrutura principal do projeto

A estrutura atual relevante é semelhante a:

```text
website-ai-bot/
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── database/
│   │   └── prisma.ts
│   │
│   ├── modules/
│   │   └── interview/
│   │       ├── ai.ts
│   │       ├── brief.ts
│   │       ├── lovable-prompt.ts
│   │       ├── phone.ts
│   │       ├── service.ts
│   │       └── types.ts
│   │
│   ├── services/
│   │   └── telegram.service.ts
│   │
│   ├── interview-ai-test.ts
│   ├── lovable-prompt-test.ts
│   ├── telegram-bot.ts
│   └── server.ts
│
├── dev.db
├── prisma7.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

> A árvore pode evoluir conforme o projeto crescer. Os arquivos acima representam a arquitetura do fluxo atual.

---

# 5. Responsabilidade de cada arquivo

## `src/telegram-bot.ts`

É a entrada do bot do Telegram.

Sua responsabilidade é:

- consultar novas mensagens no Telegram;
- identificar o `chat.id` do usuário;
- tratar `/start` como início de uma nova entrevista;
- encaminhar mensagens normais para `handleInterviewMessage()`;
- enviar a resposta da IA de volta ao Telegram;
- manter o polling funcionando mesmo quando ocorre uma falha temporária de rede.

O projeto está usando **long polling**, então o processo fica executando continuamente e chamando a API do Telegram em busca de novas mensagens.

---

## `src/services/telegram.service.ts`

Centraliza a comunicação com a API do Telegram.

Entre as responsabilidades estão:

- fazer chamadas para `getUpdates`;
- enviar mensagens com `sendMessage`;
- encapsular o token e os detalhes da API do Telegram.

A ideia é evitar espalhar chamadas HTTP do Telegram pelo restante da aplicação.

---

## `src/modules/interview/service.ts`

É a camada principal da lógica da entrevista.

Ela coordena o fluxo inteiro:

```text
Telegram
   ↓
service.ts
   ↓
AI
   ↓
Banco
   ↓
Próxima resposta
```

Responsabilidades principais:

- encontrar entrevista ativa;
- criar entrevista quando necessário;
- carregar o briefing atual;
- calcular quantas perguntas ainda podem ser feitas;
- chamar a IA;
- salvar o briefing atualizado;
- incrementar `currentStep`;
- finalizar a entrevista;
- gerar o prompt para o Lovable;
- criar automaticamente uma nova entrevista após a conclusão.

---

## `src/modules/interview/ai.ts`

Contém a lógica de conversa com o Gemini.

A função principal é:

```ts
processInterviewMessage(
  brief,
  message,
  questionsRemaining,
)
```

Ela recebe:

- o briefing atual;
- a mensagem enviada pelo cliente;
- o número de perguntas restantes.

E retorna informações como:

- resposta que será enviada ao cliente;
- briefing atualizado;
- indicação de conclusão da entrevista.

### Regras importantes da IA

A IA foi configurada para:

- fazer apenas uma pergunta por vez;
- não inventar informações;
- preservar informações já preenchidas;
- considerar respostas negativas como respostas válidas;
- não repetir perguntas já respondidas;
- diferenciar objetivo comercial de funcionalidade do site;
- não transformar automaticamente "WhatsApp" em checkout ou sistema de pedidos;
- não inventar produtos, preços ou descrições;
- respeitar o número máximo de perguntas.

---

## `src/modules/interview/types.ts`

Define o formato do briefing que representa o negócio.

O tipo principal é `WebsiteBrief`.

Estrutura atual:

```ts
export interface WebsiteBrief {
  businessName: string | null;
  businessType: string | null;
  description: string | null;

  services: {
    name: string;
    description: string | null;
    price: string | null;
  }[];

  targetAudience: string | null;

  city: string | null;
  neighborhood: string | null;
  address: string | null;

  whatsapp: string | null;
  instagram: string | null;

  openingHours: string | null;

  style: string | null;
  colors: string[];

  sections: string[];

  mainGoal: string | null;

  requestedFeatures: string[];
}
```

### Diferença entre campos importantes

`services` representa produtos ou serviços fornecidos pelo negócio.

`mainGoal` representa o objetivo principal do site ou do negócio, por exemplo:

```text
Atrair mais clientes
```

`requestedFeatures` representa funcionalidades ou elementos que o cliente pediu, por exemplo:

```text
Receber pedidos pelo WhatsApp
Criar cardápio
```

Essa separação é importante porque o objetivo comercial não deve ser confundido com uma funcionalidade técnica.

---

## `src/modules/interview/brief.ts`

Cria o briefing inicial vazio.

O objetivo é garantir que toda nova entrevista comece com a mesma estrutura:

```text
null   → informação ainda não preenchida
[]     → lista inicialmente vazia
```

Exemplo:

```ts
createEmptyBrief()
```

Isso evita que novas entrevistas herdem informações da entrevista anterior.

---

## `src/modules/interview/lovable-prompt.ts`

É responsável por transformar o briefing final em um prompt para o Lovable.

A IA recebe o briefing e gera um texto que descreve:

- negócio;
- localização;
- público;
- objetivo;
- produtos/serviços;
- funcionalidades solicitadas;
- contato;
- estilo visual;
- cores;
- estrutura desejada;
- restrições.

### Regra principal

O prompt deve usar **somente informações fornecidas pelo cliente**.

Quando uma informação não existe, ela não deve ser inventada.

Por exemplo, se o cliente diz apenas:

```text
Quero criar um cardápio.
```

isso não significa que o sistema possa inventar:

```text
Pizza Calabresa - R$ 35,00
Pizza Portuguesa - R$ 40,00
Pizza Frango - R$ 38,00
```

O prompt pode solicitar a criação da estrutura de cardápio, mas os produtos precisam ser fornecidos pelo cliente.

---

## `src/modules/interview/phone.ts`

Contém a normalização de números brasileiros de WhatsApp.

A função atual é:

```ts
normalizeBrazilianWhatsApp(value)
```

Ela remove caracteres desnecessários e valida formatos brasileiros antes de usar o número em um link como:

```text
https://wa.me/5585999999999
```

---

## `src/database/prisma.ts`

Inicializa o cliente do Prisma utilizado pela aplicação.

Os serviços da aplicação importam essa instância para acessar o banco SQLite.

---

## `src/server.ts`

Executa o servidor HTTP da aplicação.

No fluxo atual de desenvolvimento com **long polling do Telegram**, ele não é obrigatório para o bot funcionar.

Ele pode ser útil futuramente para:

- API HTTP;
- endpoints administrativos;
- webhook do Telegram;
- integração com frontend;
- health check;
- deploy em uma VM.

Atualmente, para conversar com o bot via polling, o processo principal é `src/telegram-bot.ts`.

---

# 6. Banco de dados

O projeto utiliza Prisma com SQLite.

O banco local é:

```text
dev.db
```

O modelo principal da lógica de entrevista possui a ideia de:

```text
Customer
   │
   └── Interview
           │
           ├── status
           ├── currentStep
           ├── brief
           ├── createdAt
           └── updatedAt
```

## `Customer`

Representa a pessoa/conexão associada ao atendimento.

No código atual, o campo histórico utilizado para identificar o contato é chamado `whatsapp`, embora o valor esteja sendo usado para armazenar o identificador do chat do Telegram.

### Observação de arquitetura

Isso funciona para o fluxo atual, mas futuramente pode ser interessante substituir essa ideia por algo mais genérico, como:

```text
channel = telegram
externalId = 8770550168
```

Assim o mesmo sistema poderia suportar Telegram, WhatsApp e outros canais sem reutilizar o nome `whatsapp` para um identificador de Telegram.

Essa mudança não é necessária para o funcionamento atual.

---

# 7. Status da entrevista

As entrevistas utilizam estados como:

```text
active
completed
cancelled
```

### `active`

Entrevista em andamento.

É a entrevista utilizada quando chega uma nova mensagem do cliente.

### `completed`

A entrevista terminou e o prompt para o Lovable foi gerado.

A entrevista antiga permanece salva para manter histórico.

### `cancelled`

A entrevista ativa anterior foi encerrada sem ser utilizada como entrevista atual.

Isso acontece principalmente quando o usuário envia `/start` para começar novamente.

---

# 8. Limite de perguntas

O sistema possui:

```ts
const MAX_INTERVIEW_QUESTIONS = 12;
```

A cada mensagem:

```ts
questionsRemaining = Math.max(
  MAX_INTERVIEW_QUESTIONS - questionsAsked,
  0,
);
```

Isso impede que a entrevista continue indefinidamente.

Quando o limite chega a zero, a entrevista é encerrada e o sistema parte para a geração do prompt.

---

# 9. Como funciona o `/start`

O comando `/start` possui um comportamento especial.

Quando o usuário envia:

```text
/start
```

o bot:

1. encerra qualquer entrevista ativa anterior como `cancelled`;
2. cria uma nova entrevista;
3. envia uma mensagem inicial para a IA;
4. recebe a primeira pergunta;
5. envia essa pergunta ao usuário.

Portanto, `/start` funciona como **reiniciar a entrevista do zero**.

A entrevista antiga não é apagada do banco.

---

# 10. O que acontece ao terminar uma entrevista

Quando a IA entende que a entrevista terminou, o sistema:

```text
Entrevista atual
      ↓
status = completed
      ↓
gera prompt Lovable
      ↓
envia prompt pelo Telegram
      ↓
cria nova entrevista active
```

Isso significa que o usuário pode continuar conversando depois de receber o prompt e a próxima mensagem já será associada a uma nova entrevista.

---

# 11. Exemplo de conversa

Exemplo simplificado:

```text
Cliente: /start

Bot: Qual é o nome do seu negócio?

Cliente: Corte 10

Bot: Qual é o tipo de negócio?

Cliente: Barbearia

Bot: Em qual cidade e bairro ele fica?

Cliente: Fortaleza, Maraponga

Bot: Qual é o principal objetivo do site?

Cliente: Atrair mais clientes pelo WhatsApp

...
```

Ao final, o sistema transforma as respostas em um briefing estruturado e gera algo semelhante a:

```text
Crie um site profissional, moderno e totalmente responsivo para a barbearia "Corte 10"...
```

Esse texto é o resultado final que será utilizado no Lovable.

---

# 12. Configuração do ambiente

## Pré-requisitos

Instale:

- Node.js 22 ou compatível com o projeto;
- npm;
- uma conta/bot no Telegram;
- uma chave de API do Gemini.

---

## Instalar dependências

Na raiz do projeto:

```bash
npm install
```

---

# 13. Variáveis de ambiente

Crie o arquivo:

```text
.env
```

As credenciais sensíveis devem ficar no `.env` e **não devem ser commitadas no Git**.

Exemplo conceitual:

```env
TELEGRAM_BOT_TOKEN=seu_token_do_telegram
GEMINI_API_KEY=sua_chave_do_gemini
```

> Use exatamente os nomes esperados pelos arquivos de configuração do projeto. Se esses nomes forem alterados no código, atualize também o `.env.example` e este README.

---

# 14. Prisma

Depois de configurar o ambiente, gere o cliente do Prisma:

```bash
npx prisma generate
```

Para aplicar alterações do schema durante o desenvolvimento:

```bash
npx prisma migrate dev
```

Para visualizar o banco:

```bash
npx prisma studio
```

---

# 15. Executando o bot localmente

Para iniciar o bot do Telegram usando o fluxo atual de long polling:

```bash
npx tsx src/telegram-bot.ts
```

Ao iniciar, deverá aparecer algo semelhante a:

```text
Bot iniciado. Aguardando mensagens...
```

Depois, envie uma mensagem para o bot pelo Telegram.

O terminal deverá registrar algo como:

```text
[Telegram] 8770550168: Oi
```

---

# 16. `npm run dev`

O comando:

```bash
npm run dev
```

inicia o `src/server.ts` de acordo com a configuração atual do projeto.

No estado atual, **o bot em long polling não depende desse servidor HTTP para funcionar**.

Portanto:

### Para testar apenas o Telegram

```bash
npx tsx src/telegram-bot.ts
```

### Para executar o servidor HTTP

```bash
npm run dev
```

### Futuramente

Quando o projeto evoluir para webhook, API ou frontend conectado ao backend, o servidor HTTP poderá se tornar uma parte importante da aplicação.

---

# 17. Tratamento de erros de conexão com Telegram

O polling possui tratamento de exceções.

Exemplo de erro possível:

```text
TypeError: fetch failed
ConnectTimeoutError
UND_ERR_CONNECT_TIMEOUT
```

Esse erro significa que o Node não conseguiu se conectar à API do Telegram dentro do tempo limite.

O código captura o erro e tenta novamente após alguns segundos, em vez de encerrar imediatamente o processo.

Isso pode ocorrer por motivos como:

- instabilidade da internet;
- bloqueio de rede;
- firewall;
- VPN/proxy;
- indisponibilidade momentânea do endpoint;
- timeout de conexão.

Esse tipo de erro de rede não significa necessariamente que exista um problema na lógica da entrevista.

---

# 18. Testes manuais da IA

Existem arquivos de teste para validar partes importantes sem depender de uma conversa real no Telegram.

Exemplos:

```bash
npx tsx src/interview-ai-test.ts
```

ou:

```bash
npx tsx src/lovable-prompt-test.ts
```

Esses testes podem ser utilizados para verificar:

- atualização do briefing;
- regras de interpretação da IA;
- limite de perguntas;
- geração do prompt final;
- diferenciação entre objetivo e funcionalidades;
- não invenção de produtos e preços.

---

# 19. Exemplo de briefing

Um briefing pode terminar com uma estrutura semelhante a:

```json
{
  "businessName": "Corte 10",
  "businessType": "Barbearia",
  "description": null,
  "services": [
    {
      "name": "Corte masculino",
      "description": "Corte tradicional e moderno.",
      "price": "R$ 35,00"
    },
    {
      "name": "Barba",
      "description": "Modelagem e acabamento de barba.",
      "price": "R$ 25,00"
    }
  ],
  "targetAudience": "Homens da região",
  "city": "Fortaleza",
  "neighborhood": "Maraponga",
  "address": null,
  "whatsapp": "5585999999999",
  "instagram": null,
  "openingHours": null,
  "style": "Moderno",
  "colors": [],
  "sections": [],
  "mainGoal": "Conseguir novos clientes pelo WhatsApp",
  "requestedFeatures": []
}
```

Esse JSON é uma representação do briefing, não necessariamente o texto final enviado ao Lovable.

---

# 20. Princípio de não invenção

Esse é um dos conceitos mais importantes do sistema.

A IA deve funcionar como uma entrevistadora e organizadora de requisitos, não como uma fonte para completar informações desconhecidas.

### Permitido

O cliente diz:

```text
É uma pizzaria tradicional familiar.
```

O sistema registra essa informação.

### Não permitido

O cliente não informou produtos.

A IA não deve inventar:

```text
Calabresa
Portuguesa
Frango com Catupiry
```

### Outro exemplo

O cliente diz:

```text
Quero receber pedidos pelo WhatsApp.
```

Isso não significa automaticamente:

```text
carrinho
checkout
pagamento online
login
painel administrativo
```

Essas funcionalidades somente devem aparecer quando forem solicitadas ou definidas explicitamente pelo cliente.

---

# 21. Por que usar um briefing estruturado?

Sem o `WebsiteBrief`, a aplicação teria que passar toda a conversa diretamente para o gerador de site.

Com o briefing:

```text
Conversa
   ↓
Informações estruturadas
   ↓
Validação/regras
   ↓
Prompt final
```

Isso facilita:

- controle dos dados;
- persistência no banco;
- histórico de entrevistas;
- testes;
- correções de lógica;
- futuras integrações;
- geração de prompts consistentes.

---

# 22. Histórico de entrevistas

As entrevistas não são apagadas automaticamente quando terminam.

Exemplo:

```text
Interview #1 → completed
Interview #2 → completed
Interview #3 → active
```

Assim é possível manter histórico dos atendimentos e, futuramente, construir uma área administrativa para visualizar entrevistas antigas.

---

# 23. Arquitetura atual vs. arquitetura futura

## Atual

```text
Telegram
   ↓
Long Polling
   ↓
Node.js
   ↓
Gemini
   ↓
Prisma
   ↓
SQLite
   ↓
Prompt Lovable
```

Tudo pode funcionar localmente no computador do desenvolvedor.

## Futura

A arquitetura pode evoluir para algo como:

```text
Telegram / WhatsApp
        ↓
      Webhook
        ↓
   API / Backend
        ↓
     Service
        ↓
      Gemini
        ↓
   PostgreSQL
        ↓
 Painel administrativo
        ↓
 Prompt Lovable
```

Também é possível hospedar o backend em uma VM para que o bot funcione 24 horas sem depender do computador local.

---

# 24. Deploy futuro em VM

Para produção, a ideia é remover a dependência do PC local.

Uma VM pode executar continuamente:

```text
Node.js
Prisma
Banco
Bot Telegram
Servidor HTTP
```

Com isso, o processo poderá ficar ativo mesmo quando o computador do desenvolvedor estiver desligado.

Em uma etapa futura, o long polling também pode ser substituído por **webhook**, caso seja desejável uma arquitetura baseada em servidor HTTP público.

---

# 25. Segurança

Nunca faça commit de:

```text
.env
```

ou de qualquer arquivo que contenha:

- token do Telegram;
- chave da API do Gemini;
- senhas;
- credenciais de banco;
- outras chaves privadas.

O `.gitignore` deve conter pelo menos os arquivos sensíveis e arquivos locais gerados pelo ambiente.

Exemplo:

```gitignore
.env
node_modules/
dev.db
```

A regra exata pode variar conforme o fluxo de deploy e se o banco local precisa ser versionado.

---

# 26. Git

Fluxo recomendado durante o desenvolvimento:

```bash
git status
git add .
git commit -m "descreve a alteração"
```

Evite commits com:

- tokens;
- chaves de API;
- dados reais de clientes;
- banco local contendo informações sensíveis.

---

# 27. Como pensar o projeto

O projeto pode ser dividido em quatro grandes responsabilidades:

### 1. Comunicação

```text
Telegram
```

Responsável por receber e enviar mensagens.

### 2. Entrevista

```text
service.ts + ai.ts
```

Responsável por conduzir a conversa e coletar informações.

### 3. Persistência

```text
Prisma + SQLite
```

Responsável por guardar clientes, entrevistas, status e briefing.

### 4. Geração

```text
lovable-prompt.ts
```

Responsável por transformar o briefing em um prompt utilizável no Lovable.

Essa separação facilita a evolução do sistema.

---

# 28. Fluxo completo de uma nova entrevista

```text
1. Usuário envia /start
           ↓
2. Entrevista ativa anterior → cancelled
           ↓
3. Nova Interview → active
           ↓
4. IA recebe mensagem inicial
           ↓
5. IA faz primeira pergunta
           ↓
6. Usuário responde
           ↓
7. Gemini interpreta resposta
           ↓
8. WebsiteBrief é atualizado
           ↓
9. Próxima pergunta
           ↓
10. Processo continua até conclusão ou limite de 12 perguntas
           ↓
11. Interview atual → completed
           ↓
12. Prompt Lovable é gerado
           ↓
13. Prompt é enviado pelo Telegram
           ↓
14. Nova Interview → active
```

---

# 29. Princípios atuais do projeto

O comportamento esperado do sistema é:

```text
Uma pergunta por vez
Informação fornecida > informação inventada
Objetivo ≠ funcionalidade
Produto/serviço ≠ objetivo
WhatsApp ≠ automaticamente checkout
Histórico não é apagado
Entrevista possui limite de perguntas
Ao finalizar → gera prompt
Ao gerar prompt → começa nova entrevista
```

---

# 30. Próximos passos naturais

Algumas evoluções que combinam com a arquitetura atual:

1. substituir `whatsapp` por `channel + externalId`;
2. adicionar painel web para visualizar entrevistas;
3. adicionar autenticação administrativa;
4. trocar SQLite por PostgreSQL em produção;
5. colocar o sistema em uma VM;
6. executar o bot como serviço com reinício automático;
7. migrar de long polling para webhook quando fizer sentido;
8. adicionar suporte a outros canais além do Telegram;
9. versionar prompts e configurações da IA;
10. adicionar testes automatizados do fluxo completo.

---

# 31. Comandos rápidos

### Instalar dependências

```bash
npm install
```

### Gerar Prisma Client

```bash
npx prisma generate
```

### Criar/aplicar migration durante desenvolvimento

```bash
npx prisma migrate dev
```

### Abrir Prisma Studio

```bash
npx prisma studio
```

### Iniciar bot Telegram

```bash
npx tsx src/telegram-bot.ts
```

### Iniciar servidor HTTP

```bash
npm run dev
```

### Verificar TypeScript

```bash
npx tsc --noEmit
```

---

# 32. Resumo

O **website-ai-bot** é um sistema de coleta inteligente de requisitos para criação de sites.

O usuário conversa com um bot no Telegram, a IA conduz uma entrevista estruturada, as respostas são persistidas com Prisma/SQLite e, no final, o sistema produz um prompt detalhado para o Lovable.

A principal ideia arquitetural é separar:

```text
Canal de comunicação
        ↓
Entrevista
        ↓
Brief estruturado
        ↓
Prompt
        ↓
Lovable
```

Isso deixa o projeto preparado para crescer de um protótipo local para uma plataforma de geração de sites baseada em entrevistas automatizadas.
