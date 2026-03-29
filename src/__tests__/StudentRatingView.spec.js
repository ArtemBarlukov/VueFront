import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudentRatingView from '../views/StudentRatingView.vue';

// Мокаем зависимости
vi.mock('@/components/ChartComponent.vue', () => ({
  default: {
    template: '<div class="mock-chart"></div>',
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
    template: '<select class="mock-per-page" v-model="localValue" @change="$emit(\'update:modelValue\', +$event.target.value)"></select>',
    props: ['modelValue'],
    emits: ['update:modelValue', 'change']
  }
}));

describe('StudentRatingView.vue', () => {
  const mockFilterOptions = {
    courses: [1, 2, 3, 4],
    groups: ['ИСТб-21-1', 'ИСТб-21-2', 'ИСТб-21-3'],
    subjects: ['Математика', 'Физика', 'Программирование']
  };

  const mockRatingChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  const mockStudentRatingData = {
    chartData: [
      { name: 'Студент 1', avgGrade: 4.5, activity: 4.2, attendancePercent: 85 },
      { name: 'Студент 2', avgGrade: 3.8, activity: 3.5, attendancePercent: 75 },
      { name: 'Студент 3', avgGrade: 4.2, activity: 4.0, attendancePercent: 90 }
    ],
    students: [
      { id: '1', name: 'Студент 1', group: 'ИСТб-21-1', course: 3, avgGrade: 4.5, activity: 4.2, attendancePercent: 85, dropoutRisk: 0.2, rating: 95.5 },
      { id: '2', name: 'Студент 2', group: 'ИСТб-21-1', course: 3, avgGrade: 3.8, activity: 3.5, attendancePercent: 75, dropoutRisk: 0.5, rating: 78.3 },
      { id: '3', name: 'Студент 3', group: 'ИСТб-21-2', course: 3, avgGrade: 4.2, activity: 4.0, attendancePercent: 90, dropoutRisk: 0.1, rating: 88.7 },
      { id: '4', name: 'Студент 4', group: 'ИСТб-21-2', course: 3, avgGrade: 3.2, activity: 2.8, attendancePercent: 45, dropoutRisk: 0.8, rating: 65.2 }
    ]
  };

  const mockFetchData = vi.fn().mockResolvedValue(mockStudentRatingData);

  let wrapper;

  beforeEach(() => {
    wrapper = mount(StudentRatingView, {
      props: {
        filterOptions: mockFilterOptions,
        ratingChartOptions: mockRatingChartOptions
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

  it('рендерит компонент', () => {
    expect(wrapper.find('.student-rating-section').exists()).toBe(true);
  });

  it('загружает данные при монтировании', () => {
    expect(mockFetchData).toHaveBeenCalled();
  });

  describe('фильтры', () => {
    it('обновляет фильтр курса', () => {
      wrapper.vm.filters.course = 3;
      expect(wrapper.vm.filters.course).toBe(3);
    });

    it('обновляет фильтр группы', () => {
      wrapper.vm.filters.group = 'ИСТб-21-1';
      expect(wrapper.vm.filters.group).toBe('ИСТб-21-1');
    });

    it('обновляет фильтр предмета', () => {
      wrapper.vm.filters.subject = 'Математика';
      expect(wrapper.vm.filters.subject).toBe('Математика');
    });

    it('обновляет сортировку', () => {
      wrapper.vm.filters.sortBy = 'avgGrade';
      expect(wrapper.vm.filters.sortBy).toBe('avgGrade');
    });

    it('обновляет лимит для графика', () => {
      wrapper.vm.filters.limit = 10;
      expect(wrapper.vm.filters.limit).toBe(10);
    });

    it('сбрасывает фильтры', () => {
      wrapper.vm.filters.course = 3;
      wrapper.vm.filters.group = 'ИСТб-21-1';
      wrapper.vm.filters.sortBy = 'avgGrade';
      wrapper.vm.filters.limit = 10;
      
      wrapper.vm.resetFilters();
      
      expect(wrapper.vm.filters.course).toBe('');
      expect(wrapper.vm.filters.group).toBe('');
      expect(wrapper.vm.filters.sortBy).toBe('rating');
      expect(wrapper.vm.filters.limit).toBe(5);
    });
  });

  describe('аналитические карточки', () => {
    it('генерирует моковые аналитические данные', () => {
      wrapper.vm.allStudentsData = [
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
      ];
      
      wrapper.vm.generateMockAnalytics();
      
      expect(wrapper.vm.analyticsLoaded).toBe(true);
      // Проверяем, что множества существуют (они могут быть обычными объектами, не ref)
      expect(wrapper.vm.topStudentIds).toBeDefined();
      expect(wrapper.vm.lowAttendanceIds).toBeDefined();
      expect(wrapper.vm.goodAttendanceIds).toBeDefined();
    });

    it('вычисляет сводную аналитику', () => {
      wrapper.vm.applyAnalyticsData({
        summary: { totalStudents: 4 },
        topStudents: [{ id: '1' }, { id: '3' }],
        lowAttendance: [{ id: '4' }],
        goodAttendance: [{ id: '1' }, { id: '2' }, { id: '3' }]
      });
      
      const summary = wrapper.vm.analyticsSummary;
      expect(summary.total).toBe(4);
      expect(summary.topCount).toBe(2);
      expect(summary.riskCount).toBe(1);
      expect(summary.goodCount).toBe(3);
    });

    it('возвращает правильный статус студента', () => {
      wrapper.vm.applyAnalyticsData({
        topStudents: [{ id: '1' }, { id: '3' }],
        lowAttendance: [{ id: '4' }],
        goodAttendance: [{ id: '1' }, { id: '2' }, { id: '3' }]
      });
      
      expect(wrapper.vm.getStudentStatus('1')).toBe('Отличник');
      expect(wrapper.vm.getStudentStatus('4')).toBe('Зона риска');
      expect(wrapper.vm.getStudentStatus('2')).toBe('Хор. посещ.');
      expect(wrapper.vm.getStudentStatus('5')).toBe('');
    });

    it('устанавливает фильтр по статусу', () => {
      wrapper.vm.setStatusFilter('excellent');
      expect(wrapper.vm.statusFilter).toBe('excellent');
      
      wrapper.vm.setStatusFilter('excellent');
      expect(wrapper.vm.statusFilter).toBe('');
    });

    it('вычисляет правильные лейблы для фильтра статуса', () => {
      wrapper.vm.statusFilter = 'excellent';
      expect(wrapper.vm.statusFilterLabel).toBe('Активные отличники');
      expect(wrapper.vm.statusFilterBadgeClass).toBe('bg-success');
      
      wrapper.vm.statusFilter = 'risk';
      expect(wrapper.vm.statusFilterLabel).toBe('Зона риска');
      expect(wrapper.vm.statusFilterBadgeClass).toBe('bg-danger');
      
      wrapper.vm.statusFilter = 'good';
      expect(wrapper.vm.statusFilterLabel).toBe('Хорошая посещаемость');
      expect(wrapper.vm.statusFilterBadgeClass).toBe('bg-info');
    });
  });

  describe('фильтрация студентов', () => {
    beforeEach(() => {
      wrapper.vm.allStudentsData = [
        { id: '1', name: 'Студент 1', group: 'ИСТб-21-1' },
        { id: '2', name: 'Студент 2', group: 'ИСТб-21-1' },
        { id: '3', name: 'Студент 3', group: 'ИСТб-21-2' },
        { id: '4', name: 'Студент 4', group: 'ИСТб-21-2' }
      ];
      
      wrapper.vm.applyAnalyticsData({
        topStudents: [{ id: '1' }, { id: '3' }],
        lowAttendance: [{ id: '4' }],
        goodAttendance: [{ id: '1' }, { id: '2' }, { id: '3' }]
      });
    });

    it('фильтрует по статусу отличников', () => {
      wrapper.vm.statusFilter = 'excellent';
      const filtered = wrapper.vm.filteredStudents;
      expect(filtered.length).toBe(2);
      expect(filtered.map(s => s.id).sort()).toEqual(['1', '3']);
    });

    it('фильтрует по статусу зоны риска', () => {
      wrapper.vm.statusFilter = 'risk';
      const filtered = wrapper.vm.filteredStudents;
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('4');
    });

    
  });

  describe('форматирование данных', () => {
    it('форматирует посещаемость', () => {
      const formatFn = wrapper.vm.formatRatingAttendance;
      
      // Проверяем реальную реализацию из компонента
      // В компоненте attendancePercent может быть числом (например, 85)
      expect(formatFn(85)).toBe('85.0%');
      expect(formatFn(85.5)).toBe('85.5%');
      expect(formatFn(null)).toBe('N/A');
      expect(formatFn(undefined)).toBe('N/A');
    });

    it('форматирует риск отчисления', () => {
      expect(wrapper.vm.formatDropoutRisk(0.25)).toBe('25.0%');
      expect(wrapper.vm.formatDropoutRisk(null)).toBe('N/A');
    });

    it('возвращает правильный класс для риска отчисления', () => {
      const riskClass = wrapper.vm.getDropoutRiskClass(0.2);
      expect(riskClass['bg-success']).toBe(true);
      
      const riskClass2 = wrapper.vm.getDropoutRiskClass(0.5);
      expect(riskClass2['bg-warning']).toBe(true);
      
      const riskClass3 = wrapper.vm.getDropoutRiskClass(0.8);
      expect(riskClass3['bg-danger']).toBe(true);
    });
  });

  describe('график рейтинга', () => {
    it('формирует данные для графика', () => {
      wrapper.vm.chartData = mockStudentRatingData.chartData;
      const chartData = wrapper.vm.ratingChartData;
      
      expect(chartData.type).toBe('bar');
      expect(chartData.data.labels).toEqual(['Студент 1', 'Студент 2', 'Студент 3']);
      expect(chartData.data.datasets.length).toBe(3);
    });

    it('возвращает пустые данные при отсутствии данных', () => {
      wrapper.vm.chartData = [];
      const chartData = wrapper.vm.ratingChartData;
      
      expect(chartData.data.labels).toEqual([]);
      expect(chartData.data.datasets).toEqual([]);
    });
  });

  describe('пагинация', () => {
    beforeEach(() => {
      wrapper.vm.allStudentsData = mockStudentRatingData.students;
      wrapper.vm.itemsPerPage = 2;
    });

    it('правильно вычисляет общее количество страниц', () => {
      expect(wrapper.vm.totalPages).toBe(2);
    });

    it('правильно пагинирует студентов', () => {
      wrapper.vm.currentPage = 1;
      expect(wrapper.vm.paginatedStudents.length).toBe(2);
      
      wrapper.vm.currentPage = 2;
      expect(wrapper.vm.paginatedStudents.length).toBe(2);
    });

    it('обрабатывает изменение страницы', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo');
      wrapper.vm.onPageChange(2);
      
      expect(wrapper.vm.currentPage).toBe(2);
      expect(scrollSpy).toHaveBeenCalled();
    });

    it('сбрасывает пагинацию', () => {
      wrapper.vm.currentPage = 2;
      wrapper.vm.resetPagination();
      
      expect(wrapper.vm.currentPage).toBe(1);
    });
  });
});