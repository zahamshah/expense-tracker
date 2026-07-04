import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".next-build/**",
      "node_modules/**",
      "src/generated/prisma/**",
      "src/prisma-client/**",
    ],
  },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
