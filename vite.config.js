import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      presets: ["@babel/preset-react"],
    }),
  ],
  server: {
    proxy: {
      // Forward dev requests to Wix function
      "/api/getQuestions": {
        //target: "https://matejfrantik.wixsite.com",
        target: "https://www.uniwellsity.com",
        changeOrigin: true,
        secure: true,
        //rewrite: (path) => "/well-being-form/_functions/getQuestions",
        rewrite: (path) => "/_functions/getQuestions",
      },
      // Proxy universities API in development
      "/api/getUniversities": {
        target: "http://universities.hipolabs.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace("/api/getUniversities", "/search"),
      },
      // Forward submit requests to Wix function
      "/api/submitResponse": {
        //target: "https://matejfrantik.wixsite.com",
        target: "https://www.uniwellsity.com",
        changeOrigin: true,
        secure: true,
        //rewrite: (path) => "/well-being-form/_functions/submitResponse",
        rewrite: (path) => "/_functions/submitResponse",
      },
    },
  },
});
