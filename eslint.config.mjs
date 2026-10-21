import eslintConfigNext from "eslint-config-next/core-web-vitals";
import eslintConfigNextTypescript from "eslint-config-next/typescript";

/** @type {import("eslint").Linter.Config[]} */
const config = [...eslintConfigNext, ...eslintConfigNextTypescript];

export default config;
