import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { loadSiteSettings } from './data/site.js'

createApp(App).use(router).mount('#app')
loadSiteSettings().catch(() => {})
