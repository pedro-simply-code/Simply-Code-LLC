import eslintConfigNext from "eslint-config-next/core-web-vitals";
import eslintConfigNextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  { ignores: ["backups/**"] },
  ...eslintConfigNext,
  ...eslintConfigNextTypescript,
];

export default config;
