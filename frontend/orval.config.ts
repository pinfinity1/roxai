import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "http://127.0.0.1:8000/openapi.json",
    output: {
      mode: "tags-split",
      target: "src/lib/api",
      schemas: "src/lib/api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/lib/api/custom-instance.ts",
          name: "customInstance",
        },
      },
    },
  },
});
