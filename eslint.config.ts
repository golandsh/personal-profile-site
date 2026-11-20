import type { ESLint, Linter } from "eslint";
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactHooksPlugin from "eslint-plugin-react-hooks";

type RuleSeverity = "off" | "warn" | "error" | 0 | 1 | 2;

function isRuleSeverity(value: unknown): value is RuleSeverity {
  return (
    value === "off" ||
    value === "warn" ||
    value === "error" ||
    value === 0 ||
    value === 1 ||
    value === 2
  );
}

function isEslintPlugin(value: unknown): value is ESLint.Plugin {
  return (
    typeof value === "object" &&
    value !== null &&
    "rules" in value &&
    typeof value.rules === "object" &&
    value.rules !== null
  );
}

function requireEslintPlugin(plugin: unknown, name: string): ESLint.Plugin {
  if (!isEslintPlugin(plugin)) {
    throw new Error(`Invalid ESLint plugin: ${name}`);
  }
  return plugin;
}

function normalizeNextRules(
  rawRules: Record<string, string | number | readonly unknown[]>,
): Linter.RulesRecord {
  const normalized: Linter.RulesRecord = {};
  for (const [ruleName, ruleValue] of Object.entries(rawRules)) {
    if (isRuleSeverity(ruleValue)) {
      normalized[ruleName] = ruleValue;
    } else if (Array.isArray(ruleValue) && isRuleSeverity(ruleValue[0])) {
      normalized[ruleName] = [ruleValue[0], ...ruleValue.slice(1)];
    }
  }
  return normalized;
}

const config: Linter.Config[] = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": requireEslintPlugin(tsPlugin, "@typescript-eslint"),
      "@next/next": requireEslintPlugin(nextPlugin, "@next/next"),
      "react-hooks": requireEslintPlugin(reactHooksPlugin, "react-hooks"),
    },
    rules: {
      ...normalizeNextRules(nextPlugin.configs.recommended.rules),
      ...normalizeNextRules(nextPlugin.configs["core-web-vitals"].rules),
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-nocheck": true,
          "ts-expect-error": "allow-with-description",
        },
      ],
    },
  },
];

export default config;
