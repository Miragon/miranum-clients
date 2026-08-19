import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/generated/**"],
  },

  eslint.configs.recommended,

  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },

  {
    files: ["packages/*/scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
]
