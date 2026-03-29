import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubjectStatsView from '../views/SubjectStatsView.vue';

// Мокаем зависимости
vi.mock('@/components/ChartComponent.vue', () => ({
  default: {
    template: '<div class="mock-chart"></div>',
    props: ['chartData', 'chartOptions']
  }
}));

vi.mock('bootstrap', () => ({
  Dropdown: vi.fn().mockImplementation(() => ({
    show: vi.fn(),
    hide: vi.fn()
  }))
}));

describe('SubjectStatsView.vue', () => {
  const mockFilterOptions = {
    courses: [1, 2, 3, 4],
    semesters: [
      { value: 1, name: 'Осенний' },
      { value: 2, name: 'Весенний' }
    ],
    subjects: ['Математика', 'Физика', 'Программирование', 'Базы данных'],
    groups: ['ИСТб-21-1', 'ИСТб-21-2', 'ИСТб-21-3', 'ИВТб-21-1']
  };

  const mockChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  const mockSubjectStatsData = {
    subjectStats: {
      minGrade: 3,
      avgGrade: 4.2,
      maxGrade: 5
    },
    gradeDistributionBar: {
      '2': 5,
      '3': 15,
      '4': 40,
      '5': 40
    },
    bestSubjects: [
      { subject: 'Математика', avg: 4.5, max: 5, count: 100 },
      { subject: 'Физика', avg: 4.3, max: 5, count: 85 },
      { subject: 'Программирование', avg: 4.7, max: 5, count: 120 },
      { subject: 'Базы данных', avg: 4.1, max: 5, count: 90 }
    ],
    students: [
      { id: '1', name: 'Студент 1', grade: 5 },
      { id: '2', name: 'Студент 2', grade: 4 },
      { id: '3', name: 'Студент 3', grade: 5 }
    ]
  };

  const mockFetchData = vi.fn().mockResolvedValue(mockSubjectStatsData);

  let wrapper;

  beforeEach(() => {
    wrapper = mount(SubjectStatsView, {
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
          'ChartComponent': true
        }
      }
    });
  });

  it('рендерит компонент', () => {
    expect(wrapper.find('.subject-stats-section').exists()).toBe(true);
  });

  it('загружает данные при монтировании', () => {
    expect(mockFetchData).toHaveBeenCalled();
  });

  describe('фильтры', () => {
    it('обновляет фильтр курса', () => {
      wrapper.vm.filters.course = 3;
      expect(wrapper.vm.filters.course).toBe(3);
    });

    it('обновляет фильтр семестра', () => {
      wrapper.vm.filters.semester = 1;
      expect(wrapper.vm.filters.semester).toBe(1);
    });

    it('обновляет фильтр предмета', () => {
      wrapper.vm.filters.subject = 'Математика';
      expect(wrapper.vm.filters.subject).toBe('Математика');
    });

    it('обновляет фильтр групп', () => {
      wrapper.vm.filters.groups = ['ИСТб-21-1', 'ИСТб-21-2'];
      expect(wrapper.vm.filters.groups.length).toBe(2);
    });

    it('обновляет сортировку для лучших предметов', () => {
      wrapper.vm.filters.sortBy = 'max';
      expect(wrapper.vm.filters.sortBy).toBe('max');
    });

    it('обновляет лимит для лучших предметов', () => {
      wrapper.vm.filters.limit = '10';
      expect(wrapper.vm.filters.limit).toBe('10');
    });

    it('сбрасывает фильтры', () => {
      wrapper.vm.filters.course = 3;
      wrapper.vm.filters.semester = 1;
      wrapper.vm.filters.subject = 'Математика';
      wrapper.vm.filters.groups = ['ИСТб-21-1'];
      wrapper.vm.filters.sortBy = 'max';
      wrapper.vm.filters.limit = '10';
      
      wrapper.vm.resetFilters();
      
      expect(wrapper.vm.filters.course).toBe('');
      expect(wrapper.vm.filters.semester).toBe('');
      expect(wrapper.vm.filters.subject).toBe('');
      expect(wrapper.vm.filters.groups).toEqual([]);
      expect(wrapper.vm.filters.sortBy).toBe('avg');
      expect(wrapper.vm.filters.limit).toBe('5');
    });
  });

  describe('выбор групп', () => {
    it('выбирает все группы', () => {
      wrapper.vm.selectAllGroups();
      expect(wrapper.vm.filters.groups).toEqual(mockFilterOptions.groups);
    });

    it('очищает выбранные группы', () => {
      wrapper.vm.filters.groups = ['ИСТб-21-1', 'ИСТб-21-2'];
      wrapper.vm.filters.groups = [];
      expect(wrapper.vm.filters.groups).toEqual([]);
    });
  });

  describe('вычисляемые данные для графиков', () => {
    it('формирует данные для графика распределения оценок', () => {
      wrapper.vm.subjectStatsData = mockSubjectStatsData;
      const chartData = wrapper.vm.gradeDistributionBarData;
      
      expect(chartData.type).toBe('bar');
      expect(chartData.data.labels).toEqual(['2', '3', '4', '5']);
      expect(chartData.data.datasets[0].data).toEqual([5, 15, 40, 40]);
    });

    it('формирует данные для графика лучших предметов', () => {
      wrapper.vm.subjectStatsData = mockSubjectStatsData;
      
      let chartData = wrapper.vm.bestSubjectsChartData;
      expect(chartData.type).toBe('bar');
      expect(chartData.data.labels).toEqual(['Математика', 'Физика', 'Программирование', 'Базы данных']);
      
      wrapper.vm.filters.sortBy = 'max';
      chartData = wrapper.vm.bestSubjectsChartData;
      expect(chartData.data.datasets[0].label).toBe('Максимальный балл');
      
      wrapper.vm.filters.sortBy = 'count';
      chartData = wrapper.vm.bestSubjectsChartData;
      expect(chartData.data.datasets[0].label).toBe('Количество оценок');
    });

    it('возвращает пустые данные при отсутствии данных', () => {
      wrapper.vm.subjectStatsData = null;
      
      const chartData = wrapper.vm.gradeDistributionBarData;
      expect(chartData.data.labels).toEqual([]);
      
      const bestSubjectsData = wrapper.vm.bestSubjectsChartData;
      expect(bestSubjectsData.data.labels).toEqual([]);
    });
  });

  describe('вспомогательные функции', () => {
    it('получает название семестра по значению', () => {
      expect(wrapper.vm.getSemesterName(1)).toBe('Осенний');
      expect(wrapper.vm.getSemesterName(2)).toBe('Весенний');
      expect(wrapper.vm.getSemesterName(999)).toBe('');
    });

    it('возвращает правильный лейбл для сортировки', () => {
      expect(wrapper.vm.getSortByLabel('avg')).toBe('по среднему баллу');
      expect(wrapper.vm.getSortByLabel('max')).toBe('по максимальному баллу');
      expect(wrapper.vm.getSortByLabel('count')).toBe('по количеству оценок');
      expect(wrapper.vm.getSortByLabel('unknown')).toBe('по среднему баллу');
    });
  });

  describe('отображение данных', () => {
    beforeEach(() => {
      wrapper.vm.subjectStatsData = mockSubjectStatsData;
    });

    it('отображает средний балл', () => {
      expect(wrapper.vm.subjectStatsData.subjectStats.avgGrade).toBe(4.2);
    });

    it('отображает максимальный балл', () => {
      expect(wrapper.vm.subjectStatsData.subjectStats.maxGrade).toBe(5);
    });

    it('отображает таблицу со статистикой', () => {
      expect(wrapper.vm.subjectStatsData.subjectStats.minGrade).toBe(3);
    });
  });

  describe('пагинация', () => {
    beforeEach(() => {
      wrapper.vm.subjectStatsData = mockSubjectStatsData;
    });

    it('правильно вычисляет общее количество страниц', () => {
      wrapper.vm.itemsPerPage = 2;
      expect(wrapper.vm.totalPages).toBe(2);
    });

    it('правильно пагинирует студентов', () => {
      wrapper.vm.currentPage = 1;
      wrapper.vm.itemsPerPage = 2;
      
      expect(wrapper.vm.paginatedStudents.length).toBe(2);
      
      wrapper.vm.currentPage = 2;
      expect(wrapper.vm.paginatedStudents.length).toBe(1);
    });

    it('обрабатывает изменение страницы', () => {
      const scrollSpy = vi.spyOn(window, 'scrollTo');
      wrapper.vm.onPageChange(2);
      
      expect(wrapper.vm.currentPage).toBe(2);
      expect(scrollSpy).toHaveBeenCalled();
    });

    it('сбрасывает пагинацию при изменении данных', () => {
      wrapper.vm.currentPage = 2;
      wrapper.vm.resetPagination();
      
      expect(wrapper.vm.currentPage).toBe(1);
    });
  });

  describe('обработка загрузки и ошибок', () => {
    it('отображает индикатор загрузки', async () => {
      wrapper.vm.isLoading = true;
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.alert-info').exists()).toBe(true);
      expect(wrapper.find('.alert-info').text()).toContain('Загрузка');
    });

    it('отображает сообщение об ошибке', async () => {
      wrapper.vm.error = 'Ошибка загрузки';
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('.alert-danger').exists()).toBe(true);
      expect(wrapper.find('.alert-danger').text()).toContain('Ошибка загрузки');
    });

    it('отображает сообщение при отсутствии данных', () => {
      wrapper.vm.subjectStatsData = null;
      wrapper.vm.isLoading = false;
      wrapper.vm.error = null;
      
      wrapper.vm.$forceUpdate();
      
      // Проверяем, что не отображаются индикаторы загрузки и ошибки
      expect(wrapper.find('.alert-info').exists()).toBe(false);
      expect(wrapper.find('.alert-danger').exists()).toBe(false);
    });
  });

  describe('интеграция с API', () => {
    it('формирует правильные параметры запроса', async () => {
      mockFetchData.mockClear();
      
      wrapper.vm.filters.course = 3;
      wrapper.vm.filters.semester = 1;
      wrapper.vm.filters.subject = 'Математика';
      wrapper.vm.filters.groups = ['ИСТб-21-1', 'ИСТб-21-2'];
      wrapper.vm.filters.sortBy = 'avg';
      wrapper.vm.filters.limit = '10';
      
      // Ждем срабатывания watch
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockFetchData).toHaveBeenCalled();
      const lastCall = decodeURIComponent(mockFetchData.mock.calls[mockFetchData.mock.calls.length - 1][0]);
      expect(lastCall).toContain('course=3');
      expect(lastCall).toContain('semester=1');
      expect(lastCall).toContain('subject=Математика');
      expect(lastCall).toContain('groups=ИСТб-21-1,ИСТб-21-2');
      expect(lastCall).toContain('sortBy=avg');
      expect(lastCall).toContain('limit=10');
    });
  });
});