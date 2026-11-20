import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  type MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { DigitalTwinChat } from "@/components/DigitalTwinChat";
import { OpenDigitalTwinButton } from "@/components/OpenDigitalTwinButton";
import { trimConversationHistory } from "@/lib/digital-twin-types";

describe("DigitalTwinChat", () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens via launcher or external trigger button, focuses textarea, and closes via Escape or Close button returning focus", async () => {
    const user = userEvent.setup();
    render(
      <>
        <OpenDigitalTwinButton />
        <DigitalTwinChat monogram="SG_" name="Shlomi Goland" />
      </>,
    );

    const launcher = screen.getByRole("button", { name: /Ask Digital Twin/i });
    expect(launcher).toHaveAttribute("aria-expanded", "false");

    await user.click(
      screen.getByRole("button", { name: "Ask My Digital Twin" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Shlomi Goland · Digital Twin",
    });
    expect(dialog).toBeVisible();
    expect(launcher).toHaveAttribute("hidden");

    const textarea = within(dialog).getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );
    expect(textarea).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(dialog).toHaveAttribute("hidden");
    expect(launcher).toHaveFocus();

    // Open via launcher and close via Close button
    await user.click(launcher);
    expect(dialog).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Close Digital Twin chat" }),
    );
    expect(dialog).toHaveAttribute("hidden");
    expect(launcher).toHaveFocus();
  });

  it("blocks empty/whitespace submissions and sends formatted safe replies without HTML injection", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          reply:
            "Line one\nLine two with **WiseStamp**\n\n- Built **Recurly** billing\n- <script>alert(1)</script> safe text",
          model: "google/gemma-4-26b-a4b-it:free",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const user = userEvent.setup();
    render(<DigitalTwinChat monogram="SG_" name="Shlomi Goland" />);

    await user.click(screen.getByRole("button", { name: /Ask Digital Twin/i }));

    const textarea = screen.getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );
    const sendButton = screen.getByRole("button", { name: "Send message" });
    expect(sendButton).toBeDisabled();

    await user.type(textarea, "   ");
    expect(sendButton).toBeDisabled();
    await user.keyboard("{Enter}");
    expect(fetchSpy).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", {
        name: "Summarize Shlomi's 20-year career",
      }),
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/digital-twin",
      expect.objectContaining({ method: "POST" }),
    );

    expect(await screen.findByText("Recurly")).toBeInTheDocument();
    expect(screen.getByText(/Line one/)).toBeInTheDocument();
    expect(
      screen.getByText(/<script>alert\(1\)<\/script> safe text/),
    ).toBeInTheDocument();
    expect(document.querySelector("script")).toBeNull();
  });

  it("shows Thinking indicator, disables controls during in-flight request, and aborts on unmount or Reset", async () => {
    let capturedSignal: AbortSignal | undefined;
    fetchSpy.mockImplementation(
      (_input: RequestInfo | URL, init?: RequestInit) => {
        capturedSignal = init?.signal ?? undefined;
        return new Promise<Response>(() => {
          // Intentionally pending to test in-flight state and abort cleanup
        });
      },
    );

    const user = userEvent.setup();
    const { unmount } = render(
      <DigitalTwinChat monogram="SG_" name="Shlomi Goland" />,
    );

    await user.click(screen.getByRole("button", { name: /Ask Digital Twin/i }));
    const textarea = screen.getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );
    await user.type(textarea, "Tell me about Pilat Media");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Thinking")).toBeInTheDocument();
    expect(textarea).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(capturedSignal?.aborted).toBe(false);

    // Reset while loading aborts the active fetch and exits loading state
    await user.click(
      screen.getByRole("button", { name: "Reset conversation" }),
    );
    expect(capturedSignal?.aborted).toBe(true);
    expect(screen.queryByText("Thinking")).not.toBeInTheDocument();
    expect(textarea).not.toBeDisabled();

    // Start another pending request and unmount to verify cleanup abort
    await user.type(textarea, "Another question");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it("supports Enter submit, Shift+Enter newline, and blocks IME-composing Enter (including Safari keyCode 229)", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          reply: "I migrated Pango microservices to AWS Lambda and SQS.",
          model: "google/gemma-4-26b-a4b-it:free",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const user = userEvent.setup();
    render(<DigitalTwinChat monogram="SG_" name="Shlomi Goland" />);
    await user.click(screen.getByRole("button", { name: /Ask Digital Twin/i }));

    const textarea = screen.getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );

    await user.type(textarea, "Tell me about AWS");

    // IME composing (isComposing: true) must NOT submit or call preventDefault
    const imeEventNotCancelled = fireEvent.keyDown(textarea, {
      key: "Enter",
      isComposing: true,
    });
    expect(imeEventNotCancelled).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();

    // Safari IME fallback (keyCode: 229) must NOT submit or call preventDefault
    const safariImeNotCancelled = fireEvent.keyDown(textarea, {
      key: "Enter",
      keyCode: 229,
    });
    expect(safariImeNotCancelled).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();

    // Shift+Enter must NOT submit
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(fetchSpy).not.toHaveBeenCalled();

    // Plain Enter submits
    await user.keyboard("{Enter}");
    expect(
      await screen.findByText(
        "I migrated Pango microservices to AWS Lambda and SQS.",
      ),
    ).toBeInTheDocument();
  });

  it("handles HTTP errors, malformed 200 payloads, and network errors with rollback, input restore, and Retry recovery", async () => {
    fetchSpy
      .mockRejectedValueOnce(new TypeError("Network offline"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ unexpected: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ error: "The AI model is currently busy." }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            reply: "Recovered answer about Taldor.",
            model: "google/gemma-4-26b-a4b-it:free",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    const user = userEvent.setup();
    render(<DigitalTwinChat monogram="SG_" name="Shlomi Goland" />);
    await user.click(screen.getByRole("button", { name: /Ask Digital Twin/i }));

    const textarea = screen.getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );
    await user.type(textarea, "What did you do at Taldor?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    // 1. Network error rolls back user bubble and restores textarea text
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Network error reaching the Digital Twin. Please try again.",
    );
    expect(textarea).toHaveValue("What did you do at Taldor?");

    // 2. Malformed 200 JSON triggers unexpected response alert
    await user.click(screen.getByRole("button", { name: "Retry Question" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Received an unexpected response from the Digital Twin. Please try again.",
    );

    // 3. HTTP 429 surfaces structured server error
    await user.click(screen.getByRole("button", { name: "Retry Question" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The AI model is currently busy.",
    );

    // 4. Retry succeeds cleanly
    await user.click(screen.getByRole("button", { name: "Retry Question" }));
    expect(
      await screen.findByText("Recovered answer about Taldor."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("trims older conversation history when total characters exceed budget while keeping latest user prompt", () => {
    const trimmed = trimConversationHistory(
      [
        { role: "user", content: "First question" },
        { role: "assistant", content: "A".repeat(800) },
        { role: "user", content: "Follow-up question" },
      ],
      16,
      500,
    );

    expect(trimmed).toEqual([
      { role: "user", content: "Follow-up question" },
    ]);
  });
});
