<template>
  <div class="chart-container" style="position: relative; height: 300px;">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
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

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

const createOrUpdateChart = () => {
  destroyChart();

  if (!chartRef.value || !props.chartData?.data) return;

  const ctx = chartRef.value.getContext('2d');
  
  const options = {
    ...props.chartOptions,
    onClick: (event, elements) => {
      if (!elements || elements.length === 0) return;
      
      const clickedElement = elements[0];
      const dataIndex = clickedElement.index;
      const datasetIndex = clickedElement.datasetIndex;
      
      const dataset = props.chartData.data.datasets?.[datasetIndex];
      if (!dataset) return;
      
      const label = props.chartData.data.labels?.[dataIndex];
      const value = dataset.data?.[dataIndex];
      
      emit('chartClick', {
        dataIndex,
        datasetIndex,
        label,
        value,
        chartType: props.chartData.type
      });
    }
  };
  
  try {
    chartInstance = new Chart(ctx, {
      type: props.chartData.type,
      data: JSON.parse(JSON.stringify(props.chartData.data)),
      options: options
    });
  } catch {
    destroyChart();
  }
};

onMounted(() => {
  nextTick(createOrUpdateChart);
});

watch(() => props.chartData, () => {
  nextTick(createOrUpdateChart);
}, { deep: true });

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped>
.chart-container {
  cursor: pointer;
}
</style>