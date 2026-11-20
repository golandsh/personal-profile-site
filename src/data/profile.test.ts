import { describe, expect, it } from "vitest";
import { PORTFOLIO_PROJECTS } from "@/data/portfolio";
import { PROFILE } from "@/data/profile";
import {
  PortfolioProjectSchema,
  ProfileSchema,
  type PortfolioProject,
  type Profile,
} from "@/types/profile";

function createValidLiveProject(
  overrides: Partial<Extract<PortfolioProject, { status: "live" }>> = {},
): Extract<PortfolioProject, { status: "live" }> {
  return {
    id: "live-sample",
    code: "PRJ-10",
    title: "Production Billing Service",
    domain: "Payments",
    organization: "WiseStamp",
    year: "2025",
    summary: "Subscription billing service.",
    impact: "Automated monthly financial reconciliation.",
    architectureHighlights: ["Idempotent webhook ingestion."],
    stack: ["TypeScript", "Node.js"],
    status: "live",
    liveUrl: "https://example.com/billing",
    ...overrides,
  };
}

function createValidProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    ...PROFILE,
    ...overrides,
  };
}

describe("profile and portfolio data contracts", () => {
  it("validates PROFILE against ProfileSchema with all 7 LinkedIn career roles", () => {
    const parsed = ProfileSchema.safeParse(PROFILE);
    expect(parsed.success).toBe(true);
    expect(PROFILE.name).toBe("Shlomi Goland");
    expect(PROFILE.email).toBe("golandsh@gmail.com");
    expect(PROFILE.career).toHaveLength(7);
    expect(PROFILE.career.map((role) => role.company)).toEqual([
      "WiseStamp",
      "Agmatix",
      "Pango Pay & Go",
      "Taldor",
      "Pilat Media",
      "Advantech",
      "Team",
    ]);
  });

  it("rejects invalid ProfileSchema payloads (bad email, unsafe linkedinUrl, empty arrays, invalid focus)", () => {
    expect(
      ProfileSchema.safeParse(createValidProfile({ email: "not-an-email" }))
        .success,
    ).toBe(false);

    expect(
      ProfileSchema.safeParse(
        createValidProfile({ linkedinUrl: "javascript:alert(1)" }),
      ).success,
    ).toBe(false);

    expect(
      ProfileSchema.safeParse(
        createValidProfile({ linkedinUrl: "http://linkedin.com/in/test" }),
      ).success,
    ).toBe(false);

    expect(
      ProfileSchema.safeParse(
        createValidProfile({ linkedinUrl: "/internal-only" }),
      ).success,
    ).toBe(false);

    expect(
      ProfileSchema.safeParse(createValidProfile({ career: [] })).success,
    ).toBe(false);

    const invalidFocusPayload: unknown = {
      ...createValidProfile(),
      career: [
        {
          ...PROFILE.career[0],
          focusAreas: ["invalid-focus"],
        },
      ],
    };
    expect(ProfileSchema.safeParse(invalidFocusPayload).success).toBe(false);
  });

  it("validates PORTFOLIO_PROJECTS and valid live projects with or without repoUrl", () => {
    expect(PORTFOLIO_PROJECTS.length).toBeGreaterThanOrEqual(4);
    for (const project of PORTFOLIO_PROJECTS) {
      expect(PortfolioProjectSchema.safeParse(project).success).toBe(true);
    }

    const withoutRepo = PortfolioProjectSchema.safeParse(
      createValidLiveProject({ liveUrl: "  https://example.com/demo  " }),
    );
    expect(withoutRepo.success).toBe(true);
    if (withoutRepo.success && withoutRepo.data.status === "live") {
      expect(withoutRepo.data.liveUrl).toBe("https://example.com/demo");
      expect(withoutRepo.data.repoUrl).toBeUndefined();
    }

    const withRepo = PortfolioProjectSchema.safeParse(
      createValidLiveProject({ repoUrl: "https://github.com/example/repo" }),
    );
    expect(withRepo.success).toBe(true);
  });

  it("rejects malformed or unsafe PortfolioProjectSchema payloads", () => {
    const unsafeLiveUrl: unknown = createValidLiveProject({
      liveUrl: "javascript:alert(1)",
    });
    expect(PortfolioProjectSchema.safeParse(unsafeLiveUrl).success).toBe(false);

    const unsafeRepoUrl: unknown = createValidLiveProject({
      repoUrl: "data:text/html,boom",
    });
    expect(PortfolioProjectSchema.safeParse(unsafeRepoUrl).success).toBe(false);

    const whitespaceOnlyLiveUrl: unknown = createValidLiveProject({
      liveUrl: "   ",
    });
    expect(
      PortfolioProjectSchema.safeParse(whitespaceOnlyLiveUrl).success,
    ).toBe(false);

    const missingLiveUrl: unknown = {
      ...createValidLiveProject(),
      liveUrl: undefined,
    };
    expect(PortfolioProjectSchema.safeParse(missingLiveUrl).success).toBe(
      false,
    );

    const missingTargetRelease: unknown = {
      ...createValidLiveProject(),
      status: "upcoming",
      liveUrl: undefined,
    };
    expect(PortfolioProjectSchema.safeParse(missingTargetRelease).success).toBe(
      false,
    );

    const invalidDomain: unknown = {
      ...createValidLiveProject(),
      domain: "UnknownDomain",
    };
    expect(PortfolioProjectSchema.safeParse(invalidDomain).success).toBe(false);

    const emptyHighlights: unknown = {
      ...createValidLiveProject(),
      architectureHighlights: [],
    };
    expect(PortfolioProjectSchema.safeParse(emptyHighlights).success).toBe(
      false,
    );
  });
});
