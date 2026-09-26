import { prisma } from "../../database/prisma.js";
import { createEmptyBrief } from "./brief.js";
import type { WebsiteBrief } from "./types.js";
import { processInterviewMessage } from "./ai.js";

export async function createInterview(
  whatsapp: string,
  name?: string,
) {
  const customer = await prisma.customer.upsert({
    where: {
      whatsapp,
    },

    update: name !== undefined
      ? { name }
      : {},

    create: name !== undefined
      ? {
          whatsapp,
          name,
        }
      : {
          whatsapp,
        },
  });

  const brief = createEmptyBrief();

  return prisma.interview.create({
    data: {
      customerId: customer.id,
      brief: JSON.stringify(brief),
    },
  });
}
export async function getActiveInterview(whatsapp: string) {
  return prisma.interview.findFirst({
    where: {
      status: "active",
      customer: {
        whatsapp,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
export async function updateInterview(
  interviewId: number,
  brief: WebsiteBrief,
  currentStep: number,
  status = "active",
) {
  return prisma.interview.update({
    where: {
      id: interviewId,
    },
    data: {
      brief: JSON.stringify(brief),
      currentStep,
      status,
    },
  });
}
export async function getInterviewBrief(
  interviewId: number,
): Promise<WebsiteBrief> {
  const interview = await prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
  });

  if (!interview) {
    throw new Error("Entrevista não encontrada.");
  }

  return JSON.parse(interview.brief) as WebsiteBrief;
}
export async function handleInterviewMessage(
  whatsapp: string,
  message: string,
) {
  let interview = await getActiveInterview(whatsapp);

  if (!interview) {
    interview = await createInterview(whatsapp);
  }

  const brief = await getInterviewBrief(interview.id);

  const result = await processInterviewMessage(
    brief,
    message,
  );

  const updatedInterview = await updateInterview(
    interview.id,
    result.brief,
    interview.currentStep + 1,
    result.complete ? "completed" : "active",
  );

  return {
    interview: updatedInterview,
    reply: result.reply,
    complete: result.complete,
    brief: result.brief,
  };
}