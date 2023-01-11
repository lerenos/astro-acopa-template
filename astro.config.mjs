import { defineConfig } from 'astro/config';

import vue from "@astrojs/vue";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://acopa.com.br",
  integrations: [vue(), tailwind(), sitemap(), mdx()]
});