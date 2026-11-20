import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  PortfolioArchive,
  filterPortfolioProjects,
} from "@/components/PortfolioArchive";
import { PORTFOLIO_PROJECTS } from "@/data/portfolio";
import type { PortfolioProject } from "@/types/profile";

function createLiveProject(
  overrides: Partial<Extract<PortfolioProject, { status: "live" }>> = {},
): Extract<PortfolioProject, { status: "live" }> {
  return {
    id: "live-demo",
    code: "PRJ-LIVE",
    title: "Live Telemetry Engine",
    domain: "Architecture",
    organization: "Shlomi Goland",
    year: "2026",
    summary: "Production reference architecture.",
    impact: "Zero-downtime deployment pipeline.",
    architectureHighlights: [
      "Strict TypeScript contracts across API boundaries.",
      "Zero-downtime blue/green rollout strategy.",
    ],
    stack: ["Next.js", "TypeScript"],
    status: "live",
    liveUrl: "https://example.com/telemetry",
    repoUrl: "https://github.com/example/telemetry",
    ...overrides,
  };
}

function createUpcomingProject(
  overrides: Partial<Extract<PortfolioProject, { status: "upcoming" }>> = {},
): Extract<PortfolioProject, { status: "upcoming" }> {
  return {
    id: "upcoming-demo",
    code: "PRJ-NEXT",
    title: "Upcoming Payments Architecture",
    domain: "Payments",
    organization: "WiseStamp",
    year: "2026",
    summary: "Subscription billing modernization.",
    impact: "Automated invoice reconciliation.",
    architectureHighlights: ["Idempotent billing event processing."],
    stack: ["Node.js", "TypeScript"],
    status: "upcoming",
    targetRelease: "Case Study Queued",
    ...overrides,
  };
}

describe("PortfolioArchive", () => {
  it("filters portfolio projects by domain", () => {
    expect(filterPortfolioProjects(PORTFOLIO_PROJECTS, "All")).toHaveLength(
      PORTFOLIO_PROJECTS.length,
    );

    const payments = filterPortfolioProjects(PORTFOLIO_PROJECTS, "Payments");
    expect(payments).toHaveLength(1);
    expect(payments[0]?.id).toBe("recurly-revenue-platform");
  });

  it("updates visible projects, aria-pressed states, and restores All filter", async () => {
    const user = userEvent.setup();
    render(<PortfolioArchive projects={PORTFOLIO_PROJECTS} />);

    const allButton = screen.getByRole("button", { name: /All\s*4/i });
    const aiButton = screen.getByRole("button", { name: /AI Workflows\s*1/i });
    expect(allButton).toHaveAttribute("aria-pressed", "true");

    await user.click(aiButton);
    expect(allButton).toHaveAttribute("aria-pressed", "false");
    expect(aiButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "AI-Native Engineering Workflow Playbook",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        level: 3,
        name: "Drag-and-Drop Visual Editor Engine",
      }),
    ).not.toBeInTheDocument();

    await user.click(allButton);
    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Drag-and-Drop Visual Editor Engine",
      }),
    ).toBeInTheDocument();
  });

  it("renders empty state when no projects match", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PortfolioArchive projects={[]} />);

    expect(
      screen.getByText("No portfolio items in this category yet."),
    ).toBeInTheDocument();

    rerender(<PortfolioArchive projects={[createUpcomingProject()]} />);
    await user.click(screen.getByRole("button", { name: /AI Workflows\s*0/i }));
    expect(
      screen.getByText("No portfolio items in this category yet."),
    ).toBeInTheDocument();
  });

  it("renders secure external links for live projects with and without repoUrl and inside the brief dialog", async () => {
    const user = userEvent.setup();
    const liveWithRepo = createLiveProject();
    const liveWithoutRepo = createLiveProject({
      id: "live-no-repo",
      title: "Closed-Source Platform",
      repoUrl: undefined,
    });

    render(<PortfolioArchive projects={[liveWithRepo, liveWithoutRepo]} />);

    const launchLink = screen.getByRole("link", {
      name: /Launch Live Live Telemetry Engine/i,
    });
    expect(launchLink).toHaveAttribute("href", "https://example.com/telemetry");
    expect(launchLink).toHaveAttribute("target", "_blank");
    expect(launchLink).toHaveAttribute("rel", "noopener noreferrer");

    const sourceLink = screen.getByRole("link", {
      name: /Source for Live Telemetry Engine/i,
    });
    expect(sourceLink).toHaveAttribute(
      "href",
      "https://github.com/example/telemetry",
    );
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");

    expect(
      screen.queryByRole("link", {
        name: /Source for Closed-Source Platform/i,
      }),
    ).not.toBeInTheDocument();

    // Open brief dialog on live project and verify verified external links inside dialog
    await user.click(
      screen.getByRole("button", {
        name: /Brief for Live Telemetry Engine/i,
      }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Live Telemetry Engine",
    });
    expect(dialog).toHaveAttribute("open");
    const modalLiveLink = within(dialog).getByRole("link", {
      name: "Open Live Deployment",
    });
    expect(modalLiveLink).toHaveAttribute(
      "href",
      "https://example.com/telemetry",
    );
    expect(modalLiveLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(
      within(dialog).getByRole("link", { name: "Inspect Repository" }),
    ).toHaveAttribute("href", "https://github.com/example/telemetry");
  });

  it("supports native showModal/close with double-open guard and backdrop-only dismissal", async () => {
    const user = userEvent.setup();
    render(<PortfolioArchive projects={[createUpcomingProject()]} />);

    const openButton = screen.getByRole("button", {
      name: /Architecture Brief for Upcoming Payments Architecture/i,
    });

    const dialogElement = document.querySelector("dialog");
    expect(dialogElement).not.toBeNull();
    if (!dialogElement) {
      throw new Error("Expected dialog element");
    }

    const showModalSpy = vi.fn<() => void>(() => {
      dialogElement.setAttribute("open", "");
    });
    const closeSpy = vi.fn<() => void>(() => {
      dialogElement.removeAttribute("open");
    });
    Object.defineProperty(dialogElement, "showModal", {
      value: showModalSpy,
      configurable: true,
    });
    Object.defineProperty(dialogElement, "close", {
      value: closeSpy,
      configurable: true,
    });
    vi.spyOn(dialogElement, "getBoundingClientRect").mockReturnValue({
      top: 100,
      left: 100,
      right: 500,
      bottom: 400,
      width: 400,
      height: 300,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    await user.click(openButton);
    expect(showModalSpy).toHaveBeenCalledTimes(1);
    expect(dialogElement).toHaveAttribute("open");

    // Clicking inside dialog content must NOT close it
    fireEvent.click(
      within(dialogElement).getByText("Architectural Highlights"),
    );
    expect(closeSpy).not.toHaveBeenCalled();

    // Clicking on the dialog backdrop outside its bounding rect closes it
    fireEvent.click(dialogElement, { clientX: 20, clientY: 20 });
    expect(closeSpy).toHaveBeenCalledTimes(1);
    expect(dialogElement).not.toHaveAttribute("open");
  });
});
