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