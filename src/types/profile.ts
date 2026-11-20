import { z } from "zod";
import { isExternalHttpUrl } from "@/lib/safe-url";

const SafeHttpsUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isExternalHttpUrl, { message: "URL must be a valid https: URL" });

export const CareerFocusSchema = z.enum([
  "leadership",
  "cloud-payments",
  "frontend-product",
]);

export type CareerFocus = z.infer<typeof CareerFocusSchema>;

export const CareerRoleSchema = z.object({
  id: z.string().min(1),
  company: z.string().min(1),
  role: z.string().min(1),
  period: z.string().min(1),
  duration: z.string().min(1),
  location: z.string().min(1),
  featured: z.boolean(),
  focusAreas: z.array(CareerFocusSchema).min(1),
  summary: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
  technologies: z.array(z.string().min(1)),
});

export type CareerRole = Readonly<z.infer<typeof CareerRoleSchema>>;

export const ArchitecturalPillarSchema = z.object({
  id: z.string().min(1),
  index: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  proofPoint: z.string().min(1),
});

export type ArchitecturalPillar = Readonly<
  z.infer<typeof ArchitecturalPillarSchema>
>;

export const CapabilityGroupSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

export type CapabilityGroup = Readonly<z.infer<typeof CapabilityGroupSchema>>;

export const EducationEntrySchema = z.object({
  id: z.string().min(1),
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().min(1),
  period: z.string().min(1),
});

export type EducationEntry = Readonly<z.infer<typeof EducationEntrySchema>>;

export const HeroMetricSchema = z.object({
  id: z.string().min(1),
  value: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().min(1),
});

export type HeroMetric = Readonly<z.infer<typeof HeroMetricSchema>>;

export const ProfileSchema = z.object({
  name: z.string().min(1),
  monogram: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1),
  location: z.string().min(1),
  coordinates: z.string().min(1),
  email: z.string().email(),
  linkedinUrl: SafeHttpsUrlSchema,
  availabilityStatus: z.string().min(1),
  heroLead: z.string().min(1),
  aboutParagraphs: z.array(z.string().min(1)).min(1),
  languages: z.array(z.string().min(1)).min(1),
  metrics: z.array(HeroMetricSchema).min(1),
  pillars: z.array(ArchitecturalPillarSchema).min(1),
  career: z.array(CareerRoleSchema).min(1),
  capabilities: z.array(CapabilityGroupSchema).min(1),
  education: z.array(EducationEntrySchema).min(1),
});

export type Profile = Readonly<z.infer<typeof ProfileSchema>>;

export const PortfolioDomainSchema = z.enum([
  "Architecture",
  "Payments",
  "Cloud & Serverless",
  "AI Workflows",
]);

export type PortfolioDomain = z.infer<typeof PortfolioDomainSchema>;

const PortfolioBaseSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  title: z.string().min(1),
  domain: PortfolioDomainSchema,
  organization: z.string().min(1),
  year: z.string().min(1),
  summary: z.string().min(1),
  impact: z.string().min(1),
  architectureHighlights: z.array(z.string().min(1)).min(1),
  stack: z.array(z.string().min(1)).min(1),
});

export const PortfolioProjectSchema = z.discriminatedUnion("status", [
  PortfolioBaseSchema.extend({
    status: z.literal("live"),
    liveUrl: SafeHttpsUrlSchema,
    repoUrl: SafeHttpsUrlSchema.optional(),
  }),
  PortfolioBaseSchema.extend({
    status: z.literal("upcoming"),
    targetRelease: z.string().min(1),
  }),
]);

export type PortfolioProject = Readonly<z.infer<typeof PortfolioProjectSchema>>;
