import type { WebsiteBrief } from "./types.js";

export function createEmptyBrief(): WebsiteBrief {
  return {
    businessName: null,
    businessType: null,
    description: null,

    services: [],

    targetAudience: null,

    city: null,
    neighborhood: null,
    address: null,

    whatsapp: null,
    instagram: null,

    openingHours: null,

    style: null,
    colors: [],

    sections: [],

    mainGoal: null,

    requestedFeatures: [],
  };
}