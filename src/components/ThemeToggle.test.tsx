import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "@/components/ThemeToggle";

describe("ThemeToggle", () => {
  let metaElement: HTMLMetaElement;
  let originalMatchMedia: typeof window.matchMedia | undefined;

  beforeEach(() => {
    window.localStorage.clear();
    metaElement = document.createElement("meta");
    metaElement.name = "color-scheme";
    metaElement.content = "light dark";
    document.head.appendChild(metaElement);
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    metaElement.remove();
    window.localStorage.clear();
    if (originalMatchMedia) {
      Object.defineProperty(window, "matchMedia", {
        value: originalMatchMedia,
        configurable: true,
      });
    }
    vi.restoreAllMocks();
  });

  it("toggles between dark system default, explicit light override, and back to system default", async () => {
    Object.defineProperty(window, "matchMedia", {
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
      configurable: true,
    });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggleButton = screen.getByRole("button", {
      name: "Switch to light mode",
    });

    // Click 1: dark system -> store literal "light"
    await user.click(toggleButton);
    expect(window.localStorage.getItem("color-scheme")).toBe("light");
    expect(metaElement.content).toBe("light");
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeInTheDocument();

    // Click 2: matches dark system -> remove override (revert to "light dark")
    await user.click(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    );
    expect(window.localStorage.getItem("color-scheme")).toBeNull();
    expect(metaElement.content).toBe("light dark");
  });
});
