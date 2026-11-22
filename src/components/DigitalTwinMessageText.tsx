import { Fragment, type ReactElement, type ReactNode } from "react";

const BULLET_PREFIX = /^(?:[-*•])\s+/;

function renderInlineBold(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(/\*\*([^*]+)\*\*/g)) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }
    const boldText = match[1];
    if (boldText) {
      nodes.push(
        <strong
          key={`b-${matchIndex}`}
          className="font-semibold text-[var(--ink-primary)]"
        >
          {boldText}
        </strong>,
      );
    }
    lastIndex = matchIndex + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

interface DigitalTwinMessageTextProps {
  readonly content: string;
}

export function DigitalTwinMessageText({
  content,
}: DigitalTwinMessageTextProps): ReactElement {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {blocks.map((block, blockIndex) => {
        const lines = block
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        const isBulletList =
          lines.length > 0 && lines.every((line) => BULLET_PREFIX.test(line));

        if (isBulletList) {
          return (
            <ul key={`list-${blockIndex}`} className="space-y-1.5">
              {lines.map((line, lineIndex) => (
                <li
                  key={`item-${blockIndex}-${lineIndex}`}
                  className="flex items-start gap-2.5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 bg-[var(--accent-ink)]"
                  />
                  <span>
                    {renderInlineBold(line.replace(BULLET_PREFIX, ""))}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${blockIndex}`}>
            {lines.map((line, lineIndex) => (
              <Fragment key={`l-${blockIndex}-${lineIndex}`}>
                {lineIndex > 0 ? <br /> : null}
                {renderInlineBold(line)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
