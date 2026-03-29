import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Глобальные моки
vi.stubGlobal('inject', vi.fn());

// Мок для ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Мок для Chart.js
vi.mock('chart.js/auto', () => ({
  default: class MockChart {
    constructor(ctx, config) {
      this.ctx = ctx;
      this.config = config;
    }
    destroy() {}
    update() {}
  }
}));

// Регистрируем глобальные компоненты для тестов с правильными путями
config.global.components = {
  'MyInput': {
    name: 'MyInput',
    template: '<input class="my-input" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder']
  },
  'MyButton': {
    name: 'MyButton',
    template: '<button class="my-button" @click="$emit(\'click\')"><slot /></button>',
    emits: ['click']
  },
  'MySelect': {
    name: 'MySelect',
    template: '<select class="my-select" :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
    props: ['modelValue']
  }
};