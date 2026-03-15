import { createApp } from 'vue'
import App from './app.vue'

import { Chart } from 'chart.js/auto'
Chart.defaults.responsive = true
Chart.defaults.maintainAspectRatio = false

const app = createApp(App)
app.mount('#app')
