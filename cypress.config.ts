import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://www.epidemicsound.com/music/genres",
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
  viewportHeight: 2000,
  viewportWidth: 1600,
});
