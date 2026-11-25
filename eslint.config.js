import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
    },
    rules: {
      // `brands` replaces the plugin's default list, so list only the brands used in our UI text.
      "obsidianmd/ui/sentence-case": [
        "warn",
        { enforceCamelCaseLower: true, brands: ["Lichess"] },
      ],
    },
  },
]);
