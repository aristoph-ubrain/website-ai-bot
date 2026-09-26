import {
  createInterview,
  getInterviewBrief,
  updateInterview,
} from "./modules/interview/service.js";
import { prisma } from "./database/prisma.js";

try {
  const interview = await createInterview(
    "5585999999999",
    "Cliente Teste",
  );

  const brief = await getInterviewBrief(interview.id);

  brief.businessName = "Studio Bella";
  brief.businessType = "Salão de beleza";
  brief.city = "Fortaleza";
  brief.neighborhood = "Maraponga";

  await updateInterview(
    interview.id,
    brief,
    1,
  );

  const updatedBrief = await getInterviewBrief(interview.id);

  console.log("Briefing atualizado:");
  console.log(updatedBrief);
} finally {
  await prisma.$disconnect();
}