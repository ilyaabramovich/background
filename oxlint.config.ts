import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "react", "jsx-a11y", "oxc"],
  rules: {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { allowConstantExport: true }],
  },
});
