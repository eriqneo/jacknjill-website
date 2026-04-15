import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about-us.html'),
        academics: resolve(__dirname, 'academics.html'),
        alumni: resolve(__dirname, 'alumni.html'),
        contact: resolve(__dirname, 'contact.html'),
        gallery: resolve(__dirname, 'gallery.html'),
        governance: resolve(__dirname, 'governance.html'),
        information: resolve(__dirname, 'information.html'),
        partners: resolve(__dirname, 'partners.html'),
        faqs: resolve(__dirname, 'faqs.html')
      }
    }
  }
});
