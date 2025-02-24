import { createApp } from 'vue'
import App from './app.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// Определяем флаги для Vue
const app = createApp(App, {
  compilerOptions: {
    isCustomElement: tag => tag.startsWith('x-')
  },
  __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true
})

// Глобальные настройки для Chart.js
import { Chart } from 'chart.js/auto'
Chart.defaults.responsive = true
Chart.defaults.maintainAspectRatio = false

// Монтируем приложение
app.mount('#app')