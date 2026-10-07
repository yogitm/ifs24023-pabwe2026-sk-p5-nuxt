import tailwindcss from "@tailwindcss/vite";

const customPort = Number(process.env.APP_PORT || process.env.PORT) || 3000;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: false },
  telemetry: false,

  // Disable SSR for SPA mode (client-side routing and storage)
  ssr: false,

  // Let Nuxt look into src/ for application source files
  srcDir: "src/",

  // Enable vue-router; routes are supplied by src/router.options.ts
  pages: true,

  css: ["~/index.css"],

  modules: ["@pinia/nuxt"],

  vite: {
    plugins: [tailwindcss()],
    define: {
      DELCOM_BASEURL: JSON.stringify(
        process.env.VITE_DELCOM_BASEURL || "https://open-api.delcom.org/api/v1"
      ),
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("sweetalert2")) {
                return "sweetalert2";
              }
              if (id.includes("lucide-vue-next")) {
                return "icons";
              }
              if (id.includes("vue") || id.includes("pinia")) {
                return "vue-core";
              }
              return "vendor";
            }
          },
        },
      },
    },
  },

  devServer: {
    port: customPort,
  },

  nitro: {
    devPort: customPort,
    externals: {
      inline: ["@vue/shared"],
    },
    routeRules: {
      "/**": {
        headers: {
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      },
      "/_nuxt/**": {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      },
    },
  },

  app: {
    head: {
      title: "Delcom Cash Flow - Manajemen Arus Kas",
      htmlAttrs: {
        lang: "id",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },
        {
          name: "description",
          content:
            "Delcom Cash Flow - Aplikasi pencatatan dan pengelolaan arus kas transaksi pemasukan dan pengeluaran secara mudah, cepat, dan transparan.",
        },
        {
          name: "keywords",
          content:
            "cash flow, arus kas, keuangan, pencatatan transaksi, delcom cash flow, pabwe, institut teknologi del",
        },
        { name: "author", content: "Delcom Cash Flow Team" },
        { name: "robots", content: "index, follow" },
        { name: "theme-color", content: "#0d9488" },
        {
          property: "og:type",
          content: "website",
        },
        {
          property: "og:title",
          content: "Delcom Cash Flow - Manajemen Arus Kas",
        },
        {
          property: "og:description",
          content:
            "Aplikasi pencatatan dan pengelolaan arus kas transaksi pemasukan dan pengeluaran secara mudah, cepat, dan transparan.",
        },
        {
          property: "og:image",
          content: "/logo.svg",
        },
        {
          name: "twitter:card",
          content: "summary",
        },
        {
          name: "twitter:title",
          content: "Delcom Cash Flow - Manajemen Arus Kas",
        },
        {
          name: "twitter:description",
          content:
            "Aplikasi pencatatan dan pengelolaan arus kas transaksi pemasukan dan pengeluaran secara mudah, cepat, dan transparan.",
        },
        {
          name: "twitter:image",
          content: "/logo.svg",
        },
      ],
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/logo.svg" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "preload",
          as: "style",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap",
          media: "print",
          onload: "this.media='all'",
        },
      ],
      noscript: [
        {
          innerHTML:
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap">',
        },
      ],
      bodyAttrs: {
        class: "bg-slate-50 text-slate-900 font-sans antialiased min-h-screen",
      },
    },
  },
});
