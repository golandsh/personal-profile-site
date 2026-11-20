import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader, type SiteHeaderProps } from "@/components/SiteHeader";

const mockUsePathname = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: (): string => mockUsePathname(),
}));

function createHeaderProps(
  overrides: Partial<SiteHeaderProps> = {},
): SiteHeaderProps {
  return {
    monogram: "SG_",
    name: "Shlomi Goland",
    linkedinUrl: "https://www.linkedin.com/in/shlomi-goland-37659346",
    ...overrides,
  };
}

describe("SiteHeader", () => {
  beforeEach(() => {
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/");
  });

  it("marks brand link with aria-current=page on / and Portfolio link on /portfolio", () => {
    const { rerender } = render(<SiteHeader {...createHeaderProps()} />);

    const brandLink = screen.getByRole("link", { name: /SG_\s*Shlomi Goland/i });
    expect(brandLink).toHaveAttribute("aria-current", "page");

    mockUsePathname.mockReturnValue("/portfolio");
    rerender(<SiteHeader {...createHeaderProps()} />);

    expect(brandLink).not.toHaveAttribute("aria-current");
    const portfolioLink = screen.getByRole("link", { name: "Portfolio" });
    expect(portfolioLink).toHaveAttribute("aria-current", "page");
  });

  it("opens, ignores non-Escape keys, closes via Escape and restores focus to menu toggle", async () => {
    const user = userEvent.setup();
    render(<SiteHeader {...createHeaderProps()} />);

    const menuButton = screen.getByRole("button", { name: /Menu/i });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(menuButton);
    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();

    // Non-Escape key keeps mobile menu open
    await user.keyboard("{Tab}");
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();

    // Escape closes mobile menu and returns focus to toggle button
    await user.keyboard("{Escape}");
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
    expect(menuButton).toHaveFocus();
  });

  it("closes mobile menu via Close button, mobile nav link click, and shows Active badge on /portfolio", async () => {
    mockUsePathname.mockReturnValue("/portfolio");
    const user = userEvent.setup();
    render(<SiteHeader {...createHeaderProps()} />);

    await user.click(screen.getByRole("button", { name: /Menu/i }));
    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    expect(within(mobileNav).getByText("Active")).toBeInTheDocument();

    // Close via toggle button
    await user.click(screen.getByRole("button", { name: /Close/i }));
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();

    // Reopen and close via clicking mobile nav link
    await user.click(screen.getByRole("button", { name: /Menu/i }));
    const reopenedNav = screen.getByRole("navigation", { name: "Mobile" });
    await user.click(within(reopenedNav).getByRole("link", { name: "About" }));
    expect(
      screen.queryByRole("navigation", { name: "Mobile" }),
    ).not.toBeInTheDocument();
  });

  it("removes window keydown listener when unmounted while open", async () => {
    const removeListenerSpy = vi.spyOn(window, "removeEventListener");
    const user = userEvent.setup();
    const { unmount } = render(<SiteHeader {...createHeaderProps()} />);

    await user.click(screen.getByRole("button", { name: /Menu/i }));
    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    removeListenerSpy.mockRestore();
  });
});
