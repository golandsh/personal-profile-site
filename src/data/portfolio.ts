import { z } from "zod";
import {
  PortfolioProjectSchema,
  type PortfolioProject,
} from "@/types/profile";

/**
 * Portfolio registry designed for effortless future expansion.
 * To publish a live project, change `status` to `"live"` and provide
 * validated `liveUrl` (and optional `repoUrl`).
 */
const PortfolioListSchema = z.array(PortfolioProjectSchema);

export const PORTFOLIO_PROJECTS: readonly PortfolioProject[] =
  PortfolioListSchema.parse([
    {
      id: "signature-editor-engine",
      code: "PRJ-01",
      title: "Drag-and-Drop Visual Editor Engine",
      domain: "Architecture",
      organization: "WiseStamp",
      year: "2021 — 2026",
      summary:
        "High-performance modular frontend engine enabling real-time drag-and-drop email signature composition, custom field schemas, and rapid product iteration.",
      impact:
        "Accelerated frontend feature rollout while modernizing core user interaction responsiveness.",
      architectureHighlights: [
        "Engineered a high-performance drag-and-drop editing canvas with extensible custom field definitions.",
        "Decoupled rendering state and editor primitives in strict TypeScript + Vue.js for faster feature velocity.",
        "Established repeatable code review and architectural conventions across the frontend team.",
      ],
      stack: ["TypeScript", "Vue.js", "Node.js", "Modular State"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "recurly-revenue-platform",
      code: "PRJ-02",
      title: "Subscription Billing & Compliance Engine",
      domain: "Payments",
      organization: "WiseStamp",
      year: "2021 — 2026",
      summary:
        "End-to-end Recurly payment integration orchestrating purchases, subscription upgrades, churn workflows, automated refunds, and executive financial reporting.",
      impact:
        "Automated full billing lifecycle and synced revenue telemetry across Pipedrive & Salesloft.",
      architectureHighlights: [
        "Owned purchase, churn, refund, and compliance financial reporting pipelines end to end.",
        "Architected deep enterprise CRM API integrations with Pipedrive and Salesloft for sales operations.",
        "Maintained audit-ready transactional consistency across Node.js, MongoDB, and GCP services.",
      ],
      stack: ["Node.js", "TypeScript", "Recurly API", "MongoDB", "GCP"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "national-toll-gateway",
      code: "PRJ-03",
      title: "Serverless National Toll-Road Gateway",
      domain: "Cloud & Serverless",
      organization: "Pango Pay & Go",
      year: "2017 — 2019",
      summary:
        "Event-driven AWS Lambda & SQS integration connecting live mobility transactions to a national toll-road network with real-time messaging and observability.",
      impact:
        "Executed a zero-downtime live cutover while lowering infrastructure overhead under peak traffic.",
      architectureHighlights: [
        "Migrated legacy microservices to serverless AWS Lambda functions orchestrated via SQS queues.",
        "Headed real-time backend messaging and data synchronization with a national toll-road network.",
        "Built monitoring, alerting, and incident response workflows that raised availability and shortened MTTR.",
      ],
      stack: ["AWS Lambda", "SQS", "C#", "SQL Server", "Observability"],
      status: "upcoming",
      targetRelease: "Architecture Dossier · Ready for Live Link",
    },
    {
      id: "ai-dev-playbook",
      code: "PRJ-04",
      title: "AI-Native Engineering Workflow Playbook",
      domain: "AI Workflows",
      organization: "Independent / Enterprise Practice",
      year: "2025 — 2026",
      summary:
        "Battle-tested Cursor and Claude Code engineering patterns combining strict TypeScript guardrails, automated test verification, and rapid prototyping.",
      impact:
        "Compressed prototyping-to-production timelines while maintaining enterprise code review standards.",
      architectureHighlights: [
        "Pioneered Cursor and Claude Code engineering workflows across production full-stack teams.",
        "Paired AI-accelerated implementation with zero-any TypeScript, unit test gates, and security reviews.",
        "Designed reusable workspace rules and single-skill verification checklists for repeatable delivery.",
      ],
      stack: ["Cursor", "Claude Code", "Next.js", "TypeScript", "Vitest"],
      status: "upcoming",
      targetRelease: "Public Repo Slot · Coming Soon",
    },
  ]);
