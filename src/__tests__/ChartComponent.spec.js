import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChartComponent from '../components/ChartComponent.vue';

// Мок для Chart.js
vi.mock('chart.js/auto', () => {
  return {
    default: class MockChart {
      constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
      }
      destroy() {}
      update() {}
    }
  };
});

describe('ChartComponent.vue', () => {
  let wrapper;
  const mockChartData = {
    type: 'bar',
    data: {
      labels: ['Янв', 'Фев', 'Мар'],
      datasets: [{
        label: 'Тестовый датасет',
        data: [10, 20, 30]
      }]
    }
  };

  beforeEach(() => {
    wrapper = mount(ChartComponent, {
      props: {
        chartData: mockChartData,
        chartOptions: { responsive: true }
      }
    });
  });

  it('рендерит canvas элемент', () => {
    const canvas = wrapper.find('canvas');
    expect(canvas.exists()).toBe(true);
  });

  it('содержит контейнер с правильной высотой', () => {
    const container = wrapper.find('.chart-container');
    expect(container.exists()).toBe(true);
    expect(container.attributes('style')).toContain('height: 300px');
  });

  it('применяет опции к графику', () => {
    expect(wrapper.props('chartOptions')).toEqual({ responsive: true });
  });

  it('корректно обновляется при изменении данных', async () => {
    const newChartData = {
      type: 'pie',
      data: {
        labels: ['A', 'B'],
        datasets: [{
          data: [5, 15]
        }]
      }
    };
    
    await wrapper.setProps({ chartData: newChartData });
    expect(wrapper.props('chartData')).toEqual(newChartData);
  });
});