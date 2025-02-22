<template>
  <div>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Chart } from "chart.js/auto";

export default {
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    chartOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(this.$refs.chartCanvas, {
        type: this.chartData.type || "bar",
        data: this.chartData.data,
        options: {
          ...this.chartOptions,
          onClick: this.handleChartClick, 
        },
      });
    },
    handleChartClick(event) {
      const elements = this.chart.getElementsAtEventForMode(
        event,
        'nearest', 
        { intersect: true },
        false
      );
      if (elements.length) {
        const datasetIndex = elements[0].datasetIndex; 
        const dataIndex = elements[0].index;

        // Извлекаем данные
        const subject = this.chart.data.labels[dataIndex];
        this.$emit("subject-click", { subject, dataIndex, datasetIndex });
      }
    },
  },
  watch: {
    chartData: {
      deep: true,
      handler() {
        this.renderChart();
      },
    },
  },
};
</script>


<style scoped>
canvas {
  max-width: 100%;
  height: auto;
}
</style>
