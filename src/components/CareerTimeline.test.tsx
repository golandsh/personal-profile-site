import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  CareerTimeline,
  filterCareerRoles,
} from "@/components/CareerTimeline";
import { PROFILE } from "@/data/profile";
import type { CareerRole } from "@/types/profile";

function createMockCareerRole(
  overrides: Partial<CareerRole> = {},
): CareerRole {
  return {
    id: "mock-role",
    company: "Acme Systems",
    role: "Principal Engineer",
    period: "Jan 2024 — Present",
    duration: "2 yrs",
    location: "Tel Aviv, Israel",
    featured: false,
    focusAreas: ["cloud-payments"],
    summary: "Owned distributed billing infrastructure.",
    highlights: ["Shipped zero-downtime payment migration."],
    technologies: ["TypeScript", "AWS"],
    ...overrides,
  };
}

describe("CareerTimeline", () => {
  it("filters roles accurately across all focus categories", () => {
    expect(filterCareerRoles(PROFILE.career, "all")).toHaveLength(7);

    expect(
      filterCareerRoles(PROFILE.career, "leadership").map((r) => r.company),
    ).toEqual(["WiseStamp", "Taldor", "Pilat Media"]);

    expect(
      filterCareerRoles(PROFILE.career, "cloud-payments").map((r) => r.company),
    ).toEqual(["WiseStamp", "Pango Pay & Go", "Taldor", "Pilat Media", "Advantech"]);

    expect(
      filterCareerRoles(PROFILE.career, "frontend-product").map((r) => r.company),
    ).toEqual(["WiseStamp", "Agmatix", "Pango Pay & Go", "Advantech", "Team"]);
  });

  it("filters interactively, toggles aria-pressed states, and restores All Roles", async () => {
    const user = userEvent.setup();
    render(<CareerTimeline roles={PROFILE.career} />);

    const allButton = screen.getByRole("button", { name: /All Roles\s*7/i });
    const leadershipButton = screen.getByRole("button", {
      name: /Leadership & Scale\s*3/i,
    });
    const cloudButton = screen.getByRole("button", {
      name: /Cloud & Payments\s*5/i,
    });

    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(leadershipButton).toHaveAttribute("aria-pressed", "false");

    await user.click(leadershipButton);
    expect(allButton).toHaveAttribute("aria-pressed", "false");
    expect(leadershipButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { level: 3, name: "Pilat Media" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 3, name: "Team" }),
    ).not.toBeInTheDocument();

    await user.click(cloudButton);
    expect(cloudButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { level: 3, name: "Pango Pay & Go" }),
    ).toBeInTheDocument();

    await user.click(allButton);
    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { level: 3, name: "Team" }),
    ).toBeInTheDocument();
  });

  it("handles featured badge, empty technologies footer omission, and empty roles list", () => {
    const featuredRole = createMockCareerRole({
      id: "featured-role",
      company: "Featured Corp",
      featured: true,
      technologies: ["TypeScript"],
    });
    const plainRole = createMockCareerRole({
      id: "plain-role",
      company: "Minimal Corp",
      featured: false,
      technologies: [],
    });

    const { rerender } = render(
      <CareerTimeline roles={[featuredRole, plainRole]} />,
    );

    expect(screen.getAllByText("Flagship Tenure")).toHaveLength(1);
    expect(
      screen.getByRole("list", { name: "Technologies used at Featured Corp" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Technologies used at Minimal Corp" }),
    ).not.toBeInTheDocument();

    rerender(<CareerTimeline roles={[]} />);
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
