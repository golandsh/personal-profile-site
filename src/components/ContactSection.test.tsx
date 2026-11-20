import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ContactSection } from "@/components/ContactSection";
import { PROFILE } from "@/data/profile";

describe("ContactSection", () => {
  let originalClipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalClipboardDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      "clipboard",
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalClipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", originalClipboardDescriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("copies email to clipboard and announces confirmation in live region", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ContactSection />);

    expect(screen.getByRole("status")).toHaveTextContent("");

    const copyButton = screen.getByRole("button", { name: /Copy Email/i });
    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith(PROFILE.email);
    expect(screen.getByRole("button", { name: /Copied/i })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      `Email ${PROFILE.email} copied to clipboard.`,
    );
  });

  it("auto-resets copied state after 2800ms, resets timer on rapid double-click, and cleans up on unmount", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(window, "clearTimeout");
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockResolvedValue();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const { unmount } = render(<ContactSection />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy Email/i }));
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: /Copied/i })).toBeInTheDocument();

    // Advance partway, then click again to ensure prior timer is cleared and extended
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: /Copied/i })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copied/i }));
      await Promise.resolve();
    });
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);

    // 1000ms after second click should still remain "Copied"
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("button", { name: /Copied/i })).toBeInTheDocument();

    // Full 2800ms after second click resets back to idle
    act(() => {
      vi.advanceTimersByTime(1800);
    });
    expect(
      screen.getByRole("button", { name: /Copy Email/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("");

    // Click again then unmount before timer fires to confirm cleanup
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Copy Email/i }));
      await Promise.resolve();
    });
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(2);
    clearTimeoutSpy.mockRestore();
  });

  it("handles missing navigator.clipboard gracefully", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      configurable: true,
    });

    render(<ContactSection />);

    await user.click(screen.getByRole("button", { name: /Copy Email/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      `Copy unavailable—email directly at ${PROFILE.email}.`,
    );
  });

  it("handles clipboard rejection gracefully without crashing", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .fn<(text: string) => Promise<void>>()
      .mockRejectedValue(new Error("Permission denied"));

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ContactSection />);

    await user.click(screen.getByRole("button", { name: /Copy Email/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      `Copy unavailable—email directly at ${PROFILE.email}.`,
    );
  });

  it("renders LinkedIn link with target=_blank and rel=noopener noreferrer", () => {
    render(<ContactSection />);

    const linkedinLink = screen.getByRole("link", { name: /LinkedIn/i });
    expect(linkedinLink).toHaveAttribute("href", PROFILE.linkedinUrl);
    expect(linkedinLink).toHaveAttribute("target", "_blank");
    expect(linkedinLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
