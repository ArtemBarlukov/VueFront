<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import { Chart } from 'chart.js/auto'

export default {
  name: 'ChartComponent',
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null,
      defaultOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                let value = context.raw || 0;
                
                // проценты
                if (context.chart.config.type === 'pie') {
                  let total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                  let percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
                
                // стобчатые - тупо значение
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    }
  },
  watch: {
    chartData: {
      handler() {
        this.$nextTick(() => {
          if (this.chart) {
            this.chart.destroy()
          }
          this.createChart()
        })
      },
      deep: true
    }
  },
  methods: {
    createChart() {
      if (!this.$refs.chart) return

      const ctx = this.$refs.chart.getContext('2d')
      
      const config = {
        type: this.chartData.type || 'bar',
        data: this.chartData.data || { datasets: [] },
        options: {
          ...this.defaultOptions,
          ...this.chartOptions
        }
      }

      this.chart = new Chart(ctx, config)
    }
  },
  mounted() {
    this.createChart()
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy()
      this.chart = null
    }
  }
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>
