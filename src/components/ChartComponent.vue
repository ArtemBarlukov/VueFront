<template>
  <div class="chart-container" style="position: relative; height: 300px;">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Chart from 'chart.js/auto';

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  chartOptions: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['chartClick']);

const chartRef = ref(null);
let chartInstance = null;

const createOrUpdateChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (!chartRef.value) return;

  const ctx = chartRef.value.getContext('2d');
  
  const options = {
    ...props.chartOptions,
    onClick: (event, elements) => {
      if (!elements || elements.length === 0) return;
      
      const clickedElement = elements[0];
      const dataIndex = clickedElement.index;
      const datasetIndex = clickedElement.datasetIndex;
      
      const dataset = props.chartData.data.datasets[datasetIndex];
      const label = props.chartData.data.labels[dataIndex];
      const value = dataset.data[dataIndex];
      
      emit('chartClick', {
        dataIndex,
        datasetIndex,
        label,
        value,
        chartType: props.chartData.type
      });
    }
  };
  
  chartInstance = new Chart(ctx, {
    type: props.chartData.type,
    data: props.chartData.data,
    options: options
  });
};

onMounted(() => {
  createOrUpdateChart();
});

watch(() => props.chartData, () => {
  createOrUpdateChart();
}, { deep: true });

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
</script>

<style scoped>
.chart-container {
  cursor: pointer;
}
</style>