import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AcademicLeaveView from '../views/AcademicLeaveView.vue';

// Мокаем зависимости
vi.mock('@/components/ChartComponent.vue', () => ({
  default: {
    template: '<div class="mock-chart" @click="$emit(\'chart-click\', $event)"></div>',
    props: ['chartData', 'chartOptions']
  }
}));

vi.mock('@/components/Pagination.vue', () => ({
  default: {
    template: '<div class="mock-pagination"></div>',
    props: ['currentPage', 'totalPages']
  }
}));

vi.mock('@/components/PerPageSelector.vue', () => ({
  default: {
    template: '<select class="mock-per-page" v-model="localValue" @change="$emit(\'update:modelValue\', +$event.target.value)"><option>10</option><option>25</option></select>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'change']
  }
}));

vi.mock('bootstrap', () => ({
  Dropdown: vi.fn().mockImplementation(() => ({
    show: vi.fn(),
    hide: vi.fn()
  }))
}));

describe('AcademicLeaveView.vue', () => {
  const mockFilterOptions = {
    groups: ['ИСТб-21-1', 'ИСТб-21-2', 'ИСТб-21-3']
  };

  const mockChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  const mockPerformanceData = {
    debtsDistribution: {
      '0': 10,
      '1': 5,
      '2': 3,
      '3plus': 2
    },
    groupAverages: [
      { group: 'ИСТб-21-1', avgDebts: 0.5 },
      { group: 'ИСТб-21-2', avgDebts: 1.2 }
    ],
    students: [
      { id: 'Студент 1', group: 'ИСТб-21-1', debts: 0 },
      { id: 'Студент 2', group: 'ИСТб-21-1', debts: 1 },
      { id: 'Студент 3', group: 'ИСТб-21-2', debts: 2 }
    ]
  };

  const mockFetchData = vi.fn().mockResolvedValue(mockPerformanceData);

  let wrapper;

  beforeEach(() => {
    wrapper = mount(AcademicLeaveView, {
      props: {
        filterOptions: mockFilterOptions,
        chartOptions: mockChartOptions
      },
      global: {
        provide: {
          fetchData: mockFetchData,
          API_BASE_URL: '/api'
        },
        stubs: {
          'ChartComponent': true,
          'Pagination': true,
          'PerPageSelector': true
        }
      }
    });
  });

  it('рендерит навигационные вкладки', () => {
    const tabs = wrapper.findAll('.nav-link');
    expect(tabs.length).toBe(2);
    expect(tabs[0].text()).toBe('Успеваемость');
    expect(tabs[1].text()).toBe('Даты возврата');
  });

  it('переключается между вкладками', async () => {
    const tabs = wrapper.findAll('.nav-link');
    
    expect(wrapper.vm.academicSubTab).toBe('performance');
    
    await tabs[1].trigger('click');
    expect(wrapper.vm.academicSubTab).toBe('returns');
  });

  it('загружает данные при монтировании', () => {
    expect(mockFetchData).toHaveBeenCalled();
  });

  it('отображает индикатор загрузки', async () => {
    wrapper.vm.isLoadingPerformance = true;
    await wrapper.vm.$nextTick();
    
    const alert = wrapper.find('.alert-info');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain('Загрузка');
  });

  describe('сортировка таблицы', () => {
    it('сортирует по имени при клике на заголовок', async () => {
      wrapper.vm.sortTable('name');
      expect(wrapper.vm.sortConfig.key).toBe('name');
      expect(wrapper.vm.sortConfig.direction).toBe('asc');
      
      wrapper.vm.sortTable('name');
      expect(wrapper.vm.sortConfig.direction).toBe('desc');
    });

    it('отображает правильные иконки сортировки', () => {
      expect(wrapper.vm.getSortIcon('name')).toBe('↕');
      
      wrapper.vm.sortTable('name');
      expect(wrapper.vm.getSortIcon('name')).toBe('↑');
      
      wrapper.vm.sortTable('name');
      expect(wrapper.vm.getSortIcon('name')).toBe('↓');
    });
  });

  describe('фильтрация по долгам', () => {
    it('фильтрует студентов по количеству долгов', () => {
      wrapper.vm.performanceData = mockPerformanceData;
      
      wrapper.vm.temporaryFilter = 'no_debts';
      const filtered = wrapper.vm.sortedPerformanceStudents;
      expect(filtered.every(s => s.debts === 0)).toBe(true);
      
      wrapper.vm.temporaryFilter = 'many_debts';
      const filteredMany = wrapper.vm.sortedPerformanceStudents;
      expect(filteredMany.every(s => s.debts >= 3)).toBe(true);
    });

    it('обрабатывает клик по графику распределения долгов', () => {
      wrapper.vm.performanceData = mockPerformanceData;
      
      const mockData = { label: 'Нет долгов' };
      wrapper.vm.handlePerformanceChartClick(mockData);
      
      expect(wrapper.vm.temporaryFilter).toBe('no_debts');
      expect(wrapper.vm.sortConfig.key).toBe('debts');
    });
  });

  describe('фильтрация по группам', () => {
    it('фильтрует студентов по группе', async () => {
      mockFetchData.mockClear();
      
      wrapper.vm.filtersPerformance.group = 'ИСТб-21-1';
      
      // Ждем debounce
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(mockFetchData).toHaveBeenCalled();
      const lastCall = decodeURIComponent(mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1][0]);
      expect(lastCall).toContain('group=ИСТб-21-1');
    });

    it('обрабатывает клик по графику распределения по группам', () => {
      wrapper.vm.performanceData = mockPerformanceData;
      
      const mockData = { label: 'ИСТб-21-1' };
      wrapper.vm.handleGroupDistributionClick(mockData);
      
      expect(wrapper.vm.temporaryFilter).toBe('group:ИСТб-21-1');
      expect(wrapper.vm.filtersPerformance.group).toBe('ИСТб-21-1');
    });
  });

  describe('поиск', () => {
    it('обновляет поисковый запрос с debounce', async () => {
      vi.useFakeTimers();
      
      wrapper.vm.searchInput = 'Студент';
      wrapper.vm.debouncedSearch();
      
      expect(wrapper.vm.filtersPerformance.search).toBe('');
      
      vi.advanceTimersByTime(1000);
      expect(wrapper.vm.filtersPerformance.search).toBe('Студент');
      
      vi.useRealTimers();
    });

    it('очищает поиск', () => {
      wrapper.vm.searchInput = 'Студент';
      wrapper.vm.filtersPerformance.search = 'Студент';
      wrapper.vm.temporaryFilter = 'no_debts';
      
      wrapper.vm.clearSearch();
      
      expect(wrapper.vm.searchInput).toBe('');
      expect(wrapper.vm.filtersPerformance.search).toBe('');
      expect(wrapper.vm.temporaryFilter).toBe(null);
    });
  });

  describe('пагинация', () => {
    it('правильно вычисляет общее количество страниц', () => {
      wrapper.vm.performanceData = mockPerformanceData;
      wrapper.vm.itemsPerPage = 2;
      
      expect(wrapper.vm.totalPages).toBe(2);
    });

    it('сбрасывает пагинацию при изменении данных', () => {
      wrapper.vm.currentPage = 2;
      wrapper.vm.resetPagination();
      expect(wrapper.vm.currentPage).toBe(1);
    });
  });

  describe('вычисляемые данные для графиков', () => {
    it('правильно формирует данные для графика долгов', () => {
      wrapper.vm.performanceData = mockPerformanceData;
      const chartData = wrapper.vm.debtsChartData;
      
      expect(chartData.type).toBe('pie');
      expect(chartData.data.labels).toEqual(['Нет долгов', '1 долг', '2 долга', '3+ долга']);
      expect(chartData.data.datasets[0].data).toEqual([10, 5, 3, 2]);
    });

    it('правильно формирует данные для графика средних по группам', () => {
      wrapper.vm.performanceData = mockPerformanceData;
      const chartData = wrapper.vm.groupAverageDebtsChartData;
      
      expect(chartData.type).toBe('bar');
      expect(chartData.data.labels).toEqual(['ИСТб-21-1', 'ИСТб-21-2']);
      expect(chartData.data.datasets[0].data).toEqual(['0.5', '1.2']);
    });
  });

  describe('статусы и классы', () => {
    it('возвращает правильный класс для бейджа долгов', () => {
      expect(wrapper.vm.getDebtBadgeClass(0)).toContain('bg-success');
      expect(wrapper.vm.getDebtBadgeClass(1)).toContain('bg-warning');
      expect(wrapper.vm.getDebtBadgeClass(5)).toContain('bg-danger');
    });

    it('правильно форматирует даты', () => {
      const date = '2024-01-15';
      const formatted = wrapper.vm.formatDate(date);
      expect(formatted).toBeDefined();
    });
  });
});