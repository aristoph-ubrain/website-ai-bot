import { prisma } from "../../database/prisma.js";
import { createEmptyBrief } from "./brief.js";
import type { WebsiteBrief } from "./types.js";
import { processInterviewMessage } from "./ai.js";
import { generateLovablePrompt } from "./lovable-prompt.js";

const MAX_INTERVIEW_QUESTIONS = 12;

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
export async function startNewInterview(
  whatsapp: string,
  name?: string,
) {
  await prisma.interview.updateMany({
    where: {
      status: "active",
      customer: {
        whatsapp,
      },
    },
    data: {
      status: "cancelled",
    },
  });

  return createInterview(whatsapp, name);
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

  const questionsAsked = interview.currentStep;

  const questionsRemaining = Math.max(
    MAX_INTERVIEW_QUESTIONS - questionsAsked,
    0,
  );

  const result = await processInterviewMessage(
    brief,
    message,
    questionsRemaining,
  );

  const nextStep = interview.currentStep + 1;

  const isCompleted =
    result.complete ||
    nextStep >= MAX_INTERVIEW_QUESTIONS;

  const updatedInterview = await updateInterview(
    interview.id,
    result.brief,
    nextStep,
    isCompleted ? "completed" : "active",
  );

  if (isCompleted) {
    const lovablePrompt = await generateLovablePrompt(
      result.brief,
    );

    const newInterview = await createInterview(whatsapp);

    return {
      interview: updatedInterview,
      nextInterview: newInterview,
      reply: lovablePrompt,
      complete: true,
      brief: result.brief,
      lovablePrompt,
    };
  }

  return {
    interview: updatedInterview,
    reply: result.reply,
    complete: false,
    brief: result.brief,
  };
}