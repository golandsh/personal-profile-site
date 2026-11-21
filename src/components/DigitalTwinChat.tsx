"use client";

import {
  AlertCircle,
  ArrowUp,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { DigitalTwinMessageText } from "@/components/DigitalTwinMessageText";
import { OPEN_DIGITAL_TWIN_EVENT } from "@/components/OpenDigitalTwinButton";
import {
  MAX_CONVERSATION_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_TOTAL_CONVERSATION_CHARS,
  SUGGESTED_PROMPTS,
  isDigitalTwinError,
  isDigitalTwinSuccess,
  trimConversationHistory,
  type ChatMessageInput,
} from "@/lib/digital-twin-types";

interface ChatMessage extends ChatMessageInput {
  readonly id: string;
}

export interface DigitalTwinChatProps {
  readonly monogram: string;
  readonly name: string;
}

let messageCounter = 0;

function createMessageId(prefix: "user" | "assistant"): string {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

export function DigitalTwinChat({
  monogram,
  name,
}: DigitalTwinChatProps): ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<readonly ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const panelId = useId();
  const titleId = useId();
  const inputId = useId();

  const launcherRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const wasOpenRef = useRef<boolean>(false);
  const wasLoadingRef = useRef<boolean>(false);

  const closePanel = useCallback((): void => {
    setIsOpen(false);
  }, []);

  const openPanel = useCallback((): void => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handleExternalOpen = (): void => {
      setIsOpen(true);
    };

    window.addEventListener(OPEN_DIGITAL_TWIN_EVENT, handleExternalOpen);
    return () => {
      window.removeEventListener(OPEN_DIGITAL_TWIN_EVENT, handleExternalOpen);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      textareaRef.current?.focus();
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      launcherRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading && isOpen) {
      textareaRef.current?.focus();
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (
      isOpen &&
      typeof transcriptEndRef.current?.scrollIntoView === "function"
    ) {
      transcriptEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [isOpen, messages, isLoading]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (rawText: string): Promise<void> => {
      const trimmed = rawText.trim();
      if (trimmed.length === 0 || isLoading) {
        return;
      }

      if (trimmed.length > MAX_MESSAGE_LENGTH) {
        setErrorMessage(
          `Questions are limited to ${MAX_MESSAGE_LENGTH} characters.`,
        );
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const userMessage: ChatMessage = {
        id: createMessageId("user"),
        role: "user",
        content: trimmed,
      };

      const nextMessages = [...messages, userMessage];
      const payloadMessages = trimConversationHistory(
        nextMessages,
        MAX_CONVERSATION_MESSAGES,
        MAX_TOTAL_CONVERSATION_CHARS,
      );

      setMessages(nextMessages);
      setInputValue("");
      setErrorMessage(null);
      setLastFailedPrompt(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/digital-twin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: payloadMessages }),
          signal: controller.signal,
        });

        const rawJson: unknown = await response.json().catch(() => null);
        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok) {
          setErrorMessage(
            isDigitalTwinError(rawJson)
              ? rawJson.error
              : "The Digital Twin could not answer right now. Please try again.",
          );
          setLastFailedPrompt(trimmed);
          setInputValue(trimmed);
          setMessages(messages);
          return;
        }

        if (!isDigitalTwinSuccess(rawJson)) {
          setErrorMessage(
            "Received an unexpected response from the Digital Twin. Please try again.",
          );
          setLastFailedPrompt(trimmed);
          setInputValue(trimmed);
          setMessages(messages);
          return;
        }

        const assistantMessage: ChatMessage = {
          id: createMessageId("assistant"),
          role: "assistant",
          content: rawJson.reply,
        };

        setMessages([...nextMessages, assistantMessage]);
      } catch (error: unknown) {
        if (
          controller.signal.aborted ||
          (error instanceof Error && error.name === "AbortError")
        ) {
          return;
        }
        setErrorMessage(
          "Network error reaching the Digital Twin. Please try again.",
        );
        setLastFailedPrompt(trimmed);
        setInputValue(trimmed);
        setMessages(messages);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [isLoading, messages],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void sendMessage(inputValue);
  };

  const handleTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      // IME-safe guard MUST run before preventDefault so Enter still commits IME candidates
      if (event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229) {
        return;
      }
      event.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleReset = (): void => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
    setMessages([]);
    setErrorMessage(null);
    setLastFailedPrompt(null);
    textareaRef.current?.focus();
  };

  const remainingChars = MAX_MESSAGE_LENGTH - inputValue.length;
  const showCharCounter = inputValue.length >= MAX_MESSAGE_LENGTH - 180;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <button
        ref={launcherRef}
        type="button"
        hidden={isOpen}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={isOpen ? closePanel : openPanel}
        className={`twin-launcher corner-accent min-h-13 items-center gap-3 border border-cyan-400/55 bg-[#0c131f]/95 px-4 py-2.5 text-left text-slate-100 shadow-[0_18px_50px_-14px_rgba(0,0,0,0.9)] backdrop-blur-md transition-colors hover:border-cyan-300 hover:bg-[#111b2c] ${
          isOpen ? "hidden" : "inline-flex"
        }`}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center border border-cyan-400/45 bg-cyan-400/15 font-mono text-xs font-semibold text-cyan-200">
          {monogram}
        </span>
        <span className="flex flex-col">
          <span className="flex items-center gap-2 font-display text-sm font-semibold tracking-[-0.01em] text-slate-50">
            <span>Ask Digital Twin</span>
            <span className="status-dot" aria-hidden="true" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300/90">
            AI Career Concierge
          </span>
        </span>
      </button>

      <section
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        hidden={!isOpen}
        className="twin-panel flex h-[min(39rem,calc(100dvh-2rem))] w-[min(27.5rem,calc(100dvw-2rem))] flex-col overflow-hidden border border-cyan-400/40 bg-[#090e17]/98 shadow-[0_28px_80px_-16px_rgba(0,0,0,0.92)] backdrop-blur-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-800/90 bg-[#0d1421] px-4 py-3.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-10 items-center justify-center border border-cyan-400/50 bg-cyan-400/15 font-mono text-xs font-semibold text-cyan-200">
              {monogram}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id={titleId}
                  className="font-display text-sm font-bold tracking-[-0.01em] text-slate-50"
                >
                  {name} · Digital Twin
                </h2>
                <span className="status-dot" aria-hidden="true" />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-400">
                AI Concierge · Verified Career Dossier
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 ? (
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset conversation"
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-800 bg-slate-950/80 text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={closePanel}
              aria-label="Close Digital Twin chat"
              className="inline-flex min-h-11 min-w-11 items-center justify-center border border-slate-800 bg-slate-950/80 text-slate-300 transition-colors hover:border-cyan-400/60 hover:text-cyan-200"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          role="log"
          aria-label="Digital Twin conversation"
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          <div className="border border-slate-800/90 bg-slate-950/75 p-4">
            <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              <Sparkles
                className="h-3.5 w-3.5 text-[#b8ff3b]"
                aria-hidden="true"
              />
              <span>Briefing Online</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-200">
              Hi—I&apos;m {name}&apos;s AI Digital Twin. Ask me anything about my
              20-year engineering career, Recurly payments, AWS serverless
              migrations, scaling the Kyiv division, or AI-assisted workflows.
            </p>
            <p className="mt-2.5 border-t border-slate-800/80 pt-2 font-mono text-[11px] leading-relaxed text-slate-400">
              Powered by a local AI model — replies may take up to ~30 seconds.
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
                Suggested Questions
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      void sendMessage(prompt);
                    }}
                    className="min-h-11 border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-left text-xs leading-snug text-slate-200 transition-colors hover:border-cyan-400/60 hover:bg-cyan-400/10 hover:text-cyan-100 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => {
            const isUser = message.role === "user";
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] border px-3.5 py-3 ${
                    isUser
                      ? "border-cyan-400/45 bg-cyan-400/14 text-slate-50"
                      : "border-slate-800 bg-[#0f1726] text-slate-200"
                  }`}
                >
                  <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    {isUser ? "You" : `${monogram} Digital Twin`}
                  </div>
                  <DigitalTwinMessageText content={message.content} />
                </div>
              </div>
            );
          })}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-3 border border-slate-800 bg-[#0f1726] px-3.5 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300">
                  Thinking
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Local model (~up to 30s)
                </span>
                <span
                  className="inline-flex items-center gap-1"
                  aria-hidden="true"
                >
                  <span className="twin-typing-bar" />
                  <span className="twin-typing-bar [animation-delay:140ms]" />
                  <span className="twin-typing-bar [animation-delay:280ms]" />
                </span>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div
              role="alert"
              className="flex flex-col gap-2 border border-rose-500/45 bg-rose-950/40 p-3 text-xs text-rose-100"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-300"
                  aria-hidden="true"
                />
                <span>{errorMessage}</span>
              </div>
              {lastFailedPrompt ? (
                <button
                  type="button"
                  onClick={() => {
                    void sendMessage(lastFailedPrompt);
                  }}
                  className="self-start border border-rose-400/50 bg-rose-500/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-rose-100 transition-colors hover:bg-rose-500/25"
                >
                  Retry Question
                </button>
              ) : null}
            </div>
          ) : null}

          <div ref={transcriptEndRef} />
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="border-t border-slate-800/90 bg-[#0b111d] p-3"
        >
          <label htmlFor={inputId} className="visually-hidden">
            Ask {name}&apos;s Digital Twin a question
          </label>
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              id={inputId}
              rows={1}
              maxLength={MAX_MESSAGE_LENGTH}
              value={inputValue}
              disabled={isLoading}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask about roles, payments, AWS, leadership..."
              className="twin-textarea resize-none border border-slate-700/90 bg-slate-950/90 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || inputValue.trim().length === 0}
              aria-label="Send message"
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center bg-cyan-300 text-slate-950 transition-colors hover:bg-[#b8ff3b] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-400"
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-slate-400">
            <span>Enter to send · Shift+Enter for newline</span>
            {showCharCounter ? (
              <span
                className={
                  remainingChars < 50 ? "text-amber-300" : "text-slate-300"
                }
              >
                {remainingChars} left
              </span>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}
