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

function getChatPostCalls(spy: MockInstance<typeof fetch>): unknown[][] {
  return spy.mock.calls.filter(
    ([url]) => String(url) === "/api/digital-twin",
  );
}

describe("DigitalTwinChat", () => {
  let fetchSpy: MockInstance<typeof fetch>;

  beforeEach(() => {
    fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation((input: RequestInfo | URL) => {
        if (String(input) === "/api/digital-twin/health") {
          return Promise.resolve(
            new Response(JSON.stringify({ available: true }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }),
          );
        }
        return Promise.resolve(
          new Response(JSON.stringify({ error: "Unmocked fetch" }), {
            status: 500,
          }),
        );
      });
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

    await user.click(launcher);
    expect(dialog).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Close Digital Twin chat" }),
    );
    expect(dialog).toHaveAttribute("hidden");
    expect(launcher).toHaveFocus();
  });

  it("blocks empty/whitespace submissions and sends formatted safe replies without HTML injection", async () => {
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === "/api/digital-twin/health") {
        return Promise.resolve(
          new Response(JSON.stringify({ available: true }), { status: 200 }),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            reply:
              "Line one\nLine two with **WiseStamp**\n\n- Built **Recurly** billing\n- <script>alert(1)</script> safe text",
            model: "ollama-n8n",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    });

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
    expect(getChatPostCalls(fetchSpy)).toHaveLength(0);

    await user.click(
      screen.getByRole("button", {
        name: "Summarize Shlomi's 20-year career",
      }),
    );

    expect(getChatPostCalls(fetchSpy)).toHaveLength(1);

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
      (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) === "/api/digital-twin/health") {
          return Promise.resolve(
            new Response(JSON.stringify({ available: true }), { status: 200 }),
          );
        }
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
    expect(getChatPostCalls(fetchSpy)).toHaveLength(1);
    expect(capturedSignal?.aborted).toBe(false);

    await user.click(
      screen.getByRole("button", { name: "Reset conversation" }),
    );
    expect(capturedSignal?.aborted).toBe(true);
    expect(screen.queryByText("Thinking")).not.toBeInTheDocument();
    expect(textarea).not.toBeDisabled();

    await user.type(textarea, "Another question");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(capturedSignal?.aborted).toBe(false);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });

  it("supports Enter submit, Shift+Enter newline, and blocks IME-composing Enter (including Safari keyCode 229)", async () => {
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === "/api/digital-twin/health") {
        return Promise.resolve(
          new Response(JSON.stringify({ available: true }), { status: 200 }),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            reply: "I migrated Pango microservices to AWS Lambda and SQS.",
            model: "ollama-n8n",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    });

    const user = userEvent.setup();
    render(<DigitalTwinChat monogram="SG_" name="Shlomi Goland" />);
    await user.click(screen.getByRole("button", { name: /Ask Digital Twin/i }));

    const textarea = screen.getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );

    await user.type(textarea, "Tell me about AWS");

    const imeEventNotCancelled = fireEvent.keyDown(textarea, {
      key: "Enter",
      isComposing: true,
    });
    expect(imeEventNotCancelled).toBe(true);
    expect(getChatPostCalls(fetchSpy)).toHaveLength(0);

    const safariImeNotCancelled = fireEvent.keyDown(textarea, {
      key: "Enter",
      keyCode: 229,
    });
    expect(safariImeNotCancelled).toBe(true);
    expect(getChatPostCalls(fetchSpy)).toHaveLength(0);

    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(getChatPostCalls(fetchSpy)).toHaveLength(0);

    await user.keyboard("{Enter}");
    expect(
      await screen.findByText(
        "I migrated Pango microservices to AWS Lambda and SQS.",
      ),
    ).toBeInTheDocument();
  });

  it("handles HTTP 429, malformed 200 payloads, and network errors with rollback, input restore, and Retry recovery", async () => {
    let postAttempt = 0;
    fetchSpy.mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === "/api/digital-twin/health") {
        return Promise.resolve(
          new Response(JSON.stringify({ available: true }), { status: 200 }),
        );
      }
      postAttempt += 1;
      if (postAttempt === 1) {
        return Promise.reject(new TypeError("Network offline"));
      }
      if (postAttempt === 2) {
        return Promise.resolve(
          new Response(JSON.stringify({ unexpected: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      if (postAttempt === 3) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ error: "The AI model is currently busy." }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          ),
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            reply: "Recovered answer about Taldor.",
            model: "ollama-n8n",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    });

    const user = userEvent.setup();
    render(<DigitalTwinChat monogram="SG_" name="Shlomi Goland" />);
    await user.click(screen.getByRole("button", { name: /Ask Digital Twin/i }));

    const textarea = screen.getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );
    await user.type(textarea, "What did you do at Taldor?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Network error reaching the Digital Twin. Please try again.",
    );
    expect(textarea).toHaveValue("What did you do at Taldor?");

    await user.click(screen.getByRole("button", { name: "Retry Question" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Received an unexpected response from the Digital Twin. Please try again.",
    );

    await user.click(screen.getByRole("button", { name: "Retry Question" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The AI model is currently busy.",
    );

    await user.click(screen.getByRole("button", { name: "Retry Question" }));
    expect(
      await screen.findByText("Recovered answer about Taldor."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("hides Digital Twin launcher and Hero button when health check reports unavailable", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ available: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    render(
      <>
        <OpenDigitalTwinButton />
        <DigitalTwinChat monogram="SG_" name="Shlomi Goland" />
      </>,
    );

    await vi.waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Ask Digital Twin/i }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Ask My Digital Twin" }),
    ).not.toBeInTheDocument();
  });

  it("hides Digital Twin gracefully if POST /api/digital-twin returns 502", async () => {
    fetchSpy
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ available: true }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "Unavailable" }), { status: 502 }),
      );

    const user = userEvent.setup();
    render(
      <>
        <OpenDigitalTwinButton />
        <DigitalTwinChat monogram="SG_" name="Shlomi Goland" />
      </>,
    );

    await user.click(screen.getByRole("button", { name: /Ask Digital Twin/i }));
    const textarea = screen.getByLabelText(
      "Ask Shlomi Goland's Digital Twin a question",
    );
    await user.type(textarea, "Hello?");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await vi.waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /Ask Digital Twin/i }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole("button", { name: "Ask My Digital Twin" }),
    ).not.toBeInTheDocument();
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
