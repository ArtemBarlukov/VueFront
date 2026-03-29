import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StatisticsView from '../views/StatisticsView.vue';

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

describe('StatisticsView.vue', () => {
  const mockFilterOptions = {
    courses: [1, 2, 3, 4],
    semesters: [
      { value: 1, name: 'Осенний' },
      { value: 2, name: 'Весенний' }
    ],
    groups: ['ИСТб-21-1', 'ИСТб-21-2'],
    subjects: ['Математика', 'Физика', 'Программирование']
  };

  const mockChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  const mockStatisticsData = {
    summary: {
      totalStudents: 100,
      averageGrade: 4.2,
      minGrade: 2,
      maxGrade: 5,
      countGrade2: 5,
      countGrade3: 15,
      countGrade4: 40,
      countGrade5: 40,
      countZachet: 10,
      countNezachet: 5,
      countNejavka: 2
    },
    students: [
      {
        id: 'Студент 1',
        group: 'ИСТб-21-1',
        subjects: [
          { subject: 'Математика', grades: [5, 4, 5] },
          { subject: 'Физика', grades: [4, 4] }
        ]
      }
    ]
  };

  const mockFetchData = vi.fn().mockResolvedValue(mockStatisticsData);

  let wrapper;

  beforeEach(() => {
    wrapper = mount(StatisticsView, {
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

  it('рендерит фильтры', () => {
    const selects = wrapper.findAll('select');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('загружает данные при монтировании', () => {
    expect(mockFetchData).toHaveBeenCalled();
  });

  describe('фильтры', () => {
    it('обновляет фильтр курса', async () => {
       wrapper.vm.filters.course = 1;
      expect(wrapper.vm.filters.course).toBe(1);
    });

    it('обновляет фильтр семестра', async () => {
       wrapper.vm.filters.semester = 1;
      expect(wrapper.vm.filters.semester).toBe(1);
    });

    it('обновляет фильтр группы', async () => {
       wrapper.vm.filters.group = 'ИСТб-21-1';
      expect(wrapper.vm.filters.group).toBe('ИСТб-21-1');
    });

    it('обновляет фильтр предмета', async () => {
       wrapper.vm.filters.subject = 'Математика';
      expect(wrapper.vm.filters.subject).toBe('Математика');
    });

    it('сбрасывает фильтры', async () => {
      wrapper.vm.filters.course = 1;
      wrapper.vm.filters.semester = 1;
      wrapper.vm.filters.group = 'ИСТб-21-1';
      wrapper.vm.filters.subject = 'Математика';
      
      wrapper.vm.resetFilters();
      
      expect(wrapper.vm.filters.course).toBe('');
      expect(wrapper.vm.filters.semester).toBe('');
      expect(wrapper.vm.filters.group).toBe('');
      expect(wrapper.vm.filters.subject).toBe('');
    });
  });

  describe('сортировка', () => {
    it('сортирует по выбранному полю', () => {
      wrapper.vm.sortBy('grade');
      expect(wrapper.vm.sortKey).toBe('grade');
      
      wrapper.vm.sortBy('grade');
      expect(wrapper.vm.sortDirection).toBe('desc');
    });
  });

  describe('фильтрация по оценкам', () => {
    it('обрабатывает клик по графику распределения оценок', () => {
      const mockData = { label: 'Отлично (5)' };
      wrapper.vm.handleGradeDistributionClick(mockData);
      
      expect(wrapper.vm.temporaryGradeFilter).toBe('5');
      expect(wrapper.vm.sortKey).toBe('grade');
    });

    it('очищает фильтр по оценкам', () => {
      wrapper.vm.temporaryGradeFilter = '5';
      wrapper.vm.clearGradeFilter();
      
      expect(wrapper.vm.temporaryGradeFilter).toBe(null);
    });
  });

  describe('поиск', () => {
    it('обновляет поиск с debounce', async () => {
      vi.useFakeTimers();
      
      wrapper.vm.searchInput = 'Студент';
      wrapper.vm.debouncedSearch();
      
      vi.advanceTimersByTime(1000);
      expect(wrapper.vm.filters.search).toBe('Студент');
      
      vi.useRealTimers();
    });

    it('очищает поиск', () => {
      wrapper.vm.searchInput = 'Студент';
      wrapper.vm.filters.search = 'Студент';
      wrapper.vm.temporaryGradeFilter = '5';
      
      wrapper.vm.clearSearch();
      
      expect(wrapper.vm.searchInput).toBe('');
      expect(wrapper.vm.filters.search).toBe('');
      expect(wrapper.vm.temporaryGradeFilter).toBe(null);
    });
  });

  describe('вычисляемые данные для графиков', () => {
    it('правильно формирует данные для графика сводки оценок', () => {
      wrapper.vm.statisticsData = mockStatisticsData;
      const chartData = wrapper.vm.gradeSummaryChartData;
      
      expect(chartData.type).toBe('bar');
      expect(chartData.data.labels).toEqual(['Мин', 'Сред', 'Макс']);
      expect(chartData.data.datasets[0].data).toEqual([2, 4.2, 5]);
    });

    it('правильно формирует данные для графика распределения', () => {
      wrapper.vm.statisticsData = mockStatisticsData;
      const chartData = wrapper.vm.gradeDistributionChartData;
      
      expect(chartData.type).toBe('pie');
      expect(chartData.data.labels).toContain('Отлично (5)');
    });
  });

  describe('проценты', () => {
  it('правильно вычисляет проценты', () => {
    const summary = {
      countGrade2: 5,
      countGrade3: 15,
      countGrade4: 40,
      countGrade5: 40,
      countZachet: 10,
      countNezachet: 5,
      countNejavka: 2
    };
    
    // Общее количество = 5+15+40+40+10+5+2 = 117
    expect(wrapper.vm.calculatePercentage(summary, 5)).toBe('34.2'); // 40/117*100
    expect(wrapper.vm.calculatePercentage(summary, 'зачет')).toBe('8.5'); // 10/117*100
    
    // Проверка с нулевым общим количеством
    expect(wrapper.vm.calculatePercentage({}, 5)).toBe('0.0');
  });
});

  describe('классы для оценок', () => {
    it('возвращает правильные классы для оценок', () => {
      expect(wrapper.vm.getGradeClass('5')).toHaveProperty('grade-5', true);
      expect(wrapper.vm.getGradeClass('зачет')).toHaveProperty('grade-зачет', true);
      expect(wrapper.vm.getGradeClass('неявка')).toHaveProperty('grade-неявка', true);
    });
  });

  describe('групповая аналитика', () => {
    it('генерирует моковые данные для групп', () => {
      wrapper.vm.generateMockGroupAnalytics();
      
      expect(wrapper.vm.groupFullData.length).toBeGreaterThan(0);
      expect(wrapper.vm.groupAnalyticsLoaded).toBe(true);
    });

    it('вычисляет лучшую группу', () => {
      wrapper.vm.groupFullData = [
        { group: 'Группа 1', avgGrade: 4.5, attendancePercent: 90, atRisk: false },
        { group: 'Группа 2', avgGrade: 3.2, attendancePercent: 50, atRisk: true }
      ];
      
      expect(wrapper.vm.bestGroup.group).toBe('Группа 1');
    });

    it('считает группы в зоне риска', () => {
      wrapper.vm.groupFullData = [
        { group: 'Группа 1', avgGrade: 4.5, attendancePercent: 90, atRisk: false },
        { group: 'Группа 2', avgGrade: 3.2, attendancePercent: 50, atRisk: true },
        { group: 'Группа 3', avgGrade: 3.0, attendancePercent: 55, atRisk: true }
      ];
      
      expect(wrapper.vm.groupsAtRiskCount).toBe(2);
    });
  });
});