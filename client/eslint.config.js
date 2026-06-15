import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettier from "eslint-plugin-prettier";
import jest from "eslint-plugin-jest";
import security from "eslint-plugin-security"; // Added for security rules

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      "plugin:jsx-a11y/recommended",
      "plugin:react/recommended",
      "plugin:react-refresh/recommended",
      "plugin:prettier/recommended",
      "plugin:jest/recommended",
    ],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      env: {
        node: true, // Added for Node.js environment
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react: react,
      "jsx-a11y": jsxA11y,
      prettier: prettier,
      jest: jest,
      security: security, // Added security plugin
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-array-index-key": "warn",
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-imports": "warn", // Added to catch unused imports
      "@typescript-eslint/explicit-module-boundary-types": "warn", // Added for better type checking
      "react-hooks/rules-of-hooks": "error", // Added to ensure correct usage of hooks
      "react-hooks/exhaustive-deps": "warn", // Added to ensure hooks have correct dependencies
      "no-console": ["warn", { allow: ["warn", "error"] }], // Added to warn about console logs
      "no-debugger": "warn", // Added to warn about debugger statements
      "security/detect-eval-with-expression": "error", // Added for security
      "jsx-a11y/no-static-element-interactions": "warn", // Additional accessibility check
      "jsx-a11y/click-events-have-key-events": "warn", // Additional accessibility check
    },
  },
);
