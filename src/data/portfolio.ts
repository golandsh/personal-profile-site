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
      id: "gemini-voice-agent",
      code: "PRJ-01",
      title: "Embeddable Gemini Voice Agent",
      domain: "AI Workflows",
      organization: "Independent Project (Private Repo)",
      year: "2025 — 2026",
      summary:
        "General-purpose voice agent built on Gemini that can be installed into any client system with minimal setup—requiring only instructions and tool definitions.",
      impact:
        "Designed for quick drop-in integration across different client environments without custom plumbing each time.",
      architectureHighlights: [
        "Built a reusable voice-interaction core powered by Gemini models.",
        "Kept integration minimal: provide system instructions and tool definitions to adapt it to any client workflow.",
        "Structured cleanly as a modular, portable package (currently hosted in a private repository).",
      ],
      stack: ["Gemini", "TypeScript", "Voice AI", "Tool Calling"],
      status: "upcoming",
      targetRelease: "Private Repo · Demo Slot Ready",
    },
    {
      id: "signature-editor-engine",
      code: "PRJ-02",
      title: "Drag-and-Drop Visual Editor Engine",
      domain: "Architecture",
      organization: "WiseStamp",
      year: "2021 — 2026",
      summary:
        "Modular frontend editor engine supporting drag-and-drop email signature composition, custom field schemas, and smoother feature delivery.",
      impact:
        "Made the editor foundation easier to maintain and helped the team ship new capabilities faster.",
      architectureHighlights: [
        "Built a responsive drag-and-drop editing canvas with extensible custom field definitions.",
        "Structured rendering state and editor components in TypeScript and Vue.js for long-term maintainability.",
        "Supported shared code review and architecture practices across the frontend team.",
      ],
      stack: ["TypeScript", "Vue.js", "Node.js", "Modular State"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "email-on-acid-testing",
      code: "PRJ-03",
      title: "Automated Email Signature Testing (Email on Acid)",
      domain: "Architecture",
      organization: "WiseStamp",
      year: "2022 — 2026",
      summary:
        "Automated testing workflow built on the Email on Acid API to verify not only application code, but actual rendered email signatures across email clients.",
      impact:
        "Caught layout and rendering regressions automatically before signatures reached users.",
      architectureHighlights: [
        "Integrated the Email on Acid API into an automated QA workflow.",
        "Tested generated signature HTML output directly rather than relying solely on unit checks.",
        "Helped verify visual consistency across diverse desktop and webmail clients.",
      ],
      stack: ["Node.js", "TypeScript", "Email on Acid API", "Automated QA"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "dynamic-signature-rules",
      code: "PRJ-04",
      title: "Rule-Based Dynamic Signature Assignment",
      domain: "Architecture",
      organization: "WiseStamp",
      year: "2022 — 2026",
      summary:
        "Replaced static employee-page signature assignment with a flexible rule engine evaluating recipient addresses and domains (e.g. internal vs. external recipients).",
      impact:
        "Enabled automatic signature selection per email context, backed by thorough unit and service tests.",
      architectureHighlights: [
        "Designed a deterministic rule engine matching recipient domains and addresses.",
        "Supported applying distinct signatures automatically when any recipient is outside the company domain.",
        "Covered rule evaluation and edge cases with comprehensive unit and service test suites.",
      ],
      stack: ["TypeScript", "Node.js", "Rule Engine", "Unit & Service Tests"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "langchain-signature-agent",
      code: "PRJ-05",
      title: "LangChain AI Signature Agent",
      domain: "AI Workflows",
      organization: "WiseStamp",
      year: "2024 — 2026",
      summary:
        "AI-powered signature-generation capability built with LangChain to help automate custom email signature creation and management.",
      impact:
        "Combined practical LLM agent workflows with structured product constraints for everyday users.",
      architectureHighlights: [
        "Designed an intelligent LangChain agent flow tailored to signature generation and layout rules.",
        "Paired AI-assisted prototyping (Cursor & Claude Code) with clean backend integration in Python/Node.js.",
        "Kept outputs predictable and aligned with the editor's underlying schema.",
      ],
      stack: ["Python", "LangChain", "TypeScript", "AI Agents", "GCP"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "recurly-revenue-platform",
      code: "PRJ-06",
      title: "Subscription Billing & CRM Integrations",
      domain: "Payments",
      organization: "WiseStamp",
      year: "2021 — 2026",
      summary:
        "Recurly payment and subscription integration handling billing, refunds, lifecycle events, compliance reporting, and Pipedrive/Salesloft sync.",
      impact:
        "Kept subscription billing reliable while giving sales and operations clearer lead visibility.",
      architectureHighlights: [
        "Maintained billing, refund, subscription lifecycle, and compliance reporting pipelines end to end.",
        "Built deep CRM integrations with Pipedrive and Salesloft for smoother lead tracking.",
        "Focused on predictable data consistency across Node.js, MongoDB, and GCP services.",
      ],
      stack: ["Node.js", "TypeScript", "Recurly API", "MongoDB", "GCP"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "agmatix-agronomy-platform",
      code: "PRJ-07",
      title: "Crop Planting & Agronomy Planning System",
      domain: "Architecture",
      organization: "Agmatix",
      year: "2019 — 2021",
      summary:
        "Greenfield full-stack system built in Java and Vue.js—two languages learned on the job—to help farmers and agronomists plan crop plantings.",
      impact:
        "Took the platform from initial concept to production for agronomy teams and growers.",
      architectureHighlights: [
        "Learned Java and Vue.js on the project to deliver both backend APIs and frontend workflows.",
        "Translated complex crop-mineral models into practical planting and analytical tools.",
        "Built scalable AWS cloud services backed by MongoDB with a focus on data integrity.",
      ],
      stack: ["Java", "Vue.js", "AWS", "MongoDB", "Git"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "road-6-north-integration",
      code: "PRJ-08",
      title: "Road 6 North Integration Redesign",
      domain: "Cloud & Serverless",
      organization: "Pango Pay & Go",
      year: "2017 — 2019",
      summary:
        "Reworked a broken toll-road integration by partnering with the client to consolidate 4–6 per-section API calls per drive into a single batched trip workflow.",
      impact:
        "Cut API traffic significantly and simplified vehicle recognition across camera signal events.",
      architectureHighlights: [
        "Diagnosed a fragmented integration firing an API call for every individual toll section.",
        "Collaborated with the client to batch all trip sections into 1 consolidated request.",
        "Paired with AWS Lambda and SQS serverless patterns and improved production observability.",
      ],
      stack: ["C#", "AWS Lambda", "SQS", "SQL Server", "Client Integration"],
      status: "upcoming",
      targetRelease: "Architecture Dossier · Ready for Live Link",
    },
    {
      id: "taldor-recurring-payments",
      code: "PRJ-09",
      title: "40-Parameter Payment System Refactor & Recurring Billing",
      domain: "Payments",
      organization: "Taldor",
      year: "2014 — 2017",
      summary:
        "Broke down an unwieldy legacy payment system with 40+ input parameters into a clean, maintainable workflow and enabled automatic recurring payments.",
      impact:
        "Made complex monetary transactions easier to maintain and extended support for scheduled recurring installments.",
      architectureHighlights: [
        "Decomposed a 40+ parameter monolithic payment flow into modular, testable steps.",
        "Enabled automatic recurring payments and debt-restructuring installment plans.",
        "Delivered reliable state-processing and financial auditing pipelines for the Execution Office.",
      ],
      stack: ["C#", "ASP.NET", "SQL Server", "Payment Workflows"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "pilat-scheduling-refactor",
      code: "PRJ-10",
      title: "TV Broadcast Scheduling & Legacy Service Simplification",
      domain: "Architecture",
      organization: "Pilat Media",
      year: "2009 — 2014",
      summary:
        "Worked on large-scale TV broadcast scheduling and refactored a duplicated multi-team service from thousands of lines down to a clean 5-line tool.",
      impact:
        "Eliminated cross-team duplication while supporting high-availability broadcasting operations.",
      architectureHighlights: [
        "Maintained and improved core scheduling engines for enterprise TV broadcasting.",
        "Consolidated thousands of lines of duplicated multi-team service code into a 5-line utility.",
        "Helped establish and mentor the Kyiv engineering branch from its early hires.",
      ],
      stack: ["C#", "Oracle", "Git", "Refactoring"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
    {
      id: "advantech-sync-mansion",
      code: "PRJ-11",
      title: "Multi-System Schema Mapper & Mansion Platform Rewrite",
      domain: "Architecture",
      organization: "Advantech",
      year: "2007 — 2009",
      summary:
        "Built a shared synchronization backend with schema mappers for RAD's detached systems, and brought/rewrote Mansion's affiliate platform from Singapore to Israel.",
      impact:
        "Allowed independent systems with different schemas to sync shared data automatically and localized full platform ownership.",
      architectureHighlights: [
        "Designed schema mappers bridging detached systems so shared data stayed synchronized automatically.",
        "Took over Mansion's outsourced Singapore codebase and rewrote it for local engineering ownership in Israel.",
        "Migrated Pilat Media's Sales module from Magic to .NET.",
      ],
      stack: [".NET", "C#", "Schema Mapping", "WinForms", "Web Systems"],
      status: "upcoming",
      targetRelease: "Case Study Slot · Ready for Live Link",
    },
  ]);
