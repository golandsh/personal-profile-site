import "server-only";
import { z } from "zod";
import {
  MAX_ASSISTANT_MESSAGE_LENGTH,
  MAX_CONVERSATION_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_TOTAL_CONVERSATION_CHARS,
} from "@/lib/digital-twin-types";

export {
  MAX_ASSISTANT_MESSAGE_LENGTH,
  MAX_CONVERSATION_MESSAGES,
  MAX_MESSAGE_LENGTH,
  MAX_REQUEST_BODY_BYTES,
  MAX_TOTAL_CONVERSATION_CHARS,
  SUGGESTED_PROMPTS,
  isDigitalTwinError,
  isDigitalTwinSuccess,
  type ChatMessageInput,
  type ChatRole,
  type DigitalTwinError,
  type DigitalTwinSuccess,
} from "@/lib/digital-twin-types";

export const ChatRoleSchema = z.enum(["user", "assistant"]);

export const ChatMessageInputSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("user"),
    content: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(
        MAX_MESSAGE_LENGTH,
        `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
      ),
  }),
  z.object({
    role: z.literal("assistant"),
    content: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(
        MAX_ASSISTANT_MESSAGE_LENGTH,
        `Assistant message cannot exceed ${MAX_ASSISTANT_MESSAGE_LENGTH} characters`,
      ),
  }),
]);

export const DigitalTwinRequestSchema = z
  .object({
    messages: z
      .array(ChatMessageInputSchema)
      .min(1, "At least one message is required")
      .max(
        MAX_CONVERSATION_MESSAGES,
        `Conversation history is limited to ${MAX_CONVERSATION_MESSAGES} messages`,
      ),
  })
  .refine(
    (payload) => payload.messages[payload.messages.length - 1]?.role === "user",
    { message: "The latest message must be from the user" },
  )
  .refine(
    (payload) => {
      const totalChars = payload.messages.reduce(
        (sum, message) => sum + message.content.length,
        0,
      );
      return totalChars <= MAX_TOTAL_CONVERSATION_CHARS;
    },
    {
      message: `Conversation exceeds ${MAX_TOTAL_CONVERSATION_CHARS} total characters`,
    },
  );

export type DigitalTwinRequest = Readonly<
  z.infer<typeof DigitalTwinRequestSchema>
>;
