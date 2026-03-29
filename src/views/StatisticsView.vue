<template>
  <div class="statistics-section">
    <div v-if="isLoading" class="alert alert-info">Загрузка статистики оценок...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="statisticsData" class="row mb-4">
      <div class="col">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Статистика успеваемости</h5>
              <div class="d-flex gap-2 flex-wrap">
                <select class="form-select form-select-sm" v-model="filters.course">
                  <option value="">Все курсы</option>
                  <option v-for="course in filterOptions.courses" :key="course" :value="course">
                    {{ course }} курс
                  </option>
                </select>
                <select class="form-select form-select-sm" v-model="filters.semester">
                  <option value="">Все семестры</option>
                  <option v-for="sem in filterOptions.semesters" :key="sem.value" :value="sem.value">
                    {{ sem.name }}
                  </option>
                </select>
                <select class="form-select form-select-sm" v-model="filters.group">
                  <option value="">Все группы</option>
                  <option v-for="group in filterOptions.groups" :key="group" :value="group">
                    {{ group }}
                  </option>
                </select>
                <select class="form-select form-select-sm" v-model="filters.subject">
                  <option value="">Все предметы</option>
                  <option v-for="subject in filterOptions.subjects" :key="subject" :value="subject">
                    {{ subject }}
                  </option>
                </select>
                <button class="btn btn-outline-secondary btn-sm" @click="resetFilters">
                  Сбросить
                </button>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-body">
                    <h6 class="card-title">
                      Статистика баллов
                    </h6>
                    <ChartComponent
                      v-if="statisticsData?.summary"
                      :chartData="gradeSummaryChartData"
                      :chartOptions="chartOptions"
                    />
                    <div v-else>Нет данных для графика.</div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card h-100">
                  <div class="card-body">
                    <h6 class="card-title d-flex align-items-center">
                      Распределение оценок
                      <span class="ms-2 badge bg-light text-dark">
                        <i class="material-icons small">touch_app</i> Кликабельно
                      </span>
                    </h6>
                    <ChartComponent
                      v-if="statisticsData?.summary"
                      :chartData="gradeDistributionChartData"
                      :chartOptions="chartOptions"
                      @chart-click="handleGradeDistributionClick"
                    />
                     <div v-else>Нет данных для графика.</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col">
                <div class="table-responsive">
                  <table class="table table-bordered table-hover">
                    <thead class="table-light">
                      <tr><th>Показатель</th><th>Значение</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Всего студентов</td><td>{{ statisticsData.summary?.totalStudents ?? 'N/A' }}</td></tr>
                      <tr><td>Средний балл</td><td>{{ statisticsData.summary?.averageGrade?.toFixed(2) ?? 'N/A' }}</td></tr>
                      <tr><td>Отлично (5)</td><td>{{ statisticsData.summary?.countGrade5 ?? 0 }} ({{ calculatePercentage(statisticsData.summary, 5) }}%)</td></tr>
                      <tr><td>Хорошо (4)</td><td>{{ statisticsData.summary?.countGrade4 ?? 0 }} ({{ calculatePercentage(statisticsData.summary, 4) }}%)</td></tr>
                      <tr><td>Удовл (3)</td><td>{{ statisticsData.summary?.countGrade3 ?? 0 }} ({{ calculatePercentage(statisticsData.summary, 3) }}%)</td></tr>
                      <tr><td>Неуд (2)</td><td>{{ statisticsData.summary?.countGrade2 ?? 0 }} ({{ calculatePercentage(statisticsData.summary, 2) }}%)</td></tr>
                      <tr v-if="statisticsData.summary?.countZachet"><td>Зачет</td><td>{{ statisticsData.summary?.countZachet ?? 0 }} ({{ calculatePercentage(statisticsData.summary, 'зачет') }}%)</td></tr>
                      <tr v-if="statisticsData.summary?.countNezachet"><td>Незачет</td><td>{{ statisticsData.summary?.countNezachet ?? 0 }} ({{ calculatePercentage(statisticsData.summary, 'незачет') }}%)</td></tr>
                      <tr v-if="statisticsData.summary?.countNejavka"><td>Неявка</td><td>{{ statisticsData.summary?.countNejavka ?? 0 }} ({{ calculatePercentage(statisticsData.summary, 'неявка') }}%)</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                      <h6 class="mb-0 me-2">Список студентов и оценок ({{ totalStudents }})</h6>
                      <div v-if="temporaryGradeFilter" class="badge bg-info me-2">
                        Фильтр по оценке: {{ temporaryGradeFilter }}
                        <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close" @click="clearGradeFilter" style="font-size: 0.5rem;"></button>
                      </div>
                    </div>
                    <div class="input-group input-group-sm w-auto">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="searchInput" 
                        placeholder="Поиск по ID..."
                        @input="debouncedSearch"
                      >
                      <button 
                        class="btn btn-outline-secondary" 
                        type="button" 
                        @click="clearSearch"
                        v-if="searchInput || temporaryGradeFilter"
                      >
                        <i class="material-icons small">clear</i>
                      </button>
                    </div>
                  </div>
                  <div class="card-body">
                    <div class="table-responsive">
                      <table class="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th @click="sortBy('name')">
                              ID студента
                              <i v-if="sortKey === 'name'" :class="sortIcon">{{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</i>
                            </th>
                            <th @click="sortBy('group')">
                              Группа
                              <i v-if="sortKey === 'group'" :class="sortIcon">{{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</i>
                            </th>
                            <th @click="sortBy('subject')">
                              Предмет
                              <i v-if="sortKey === 'subject'" :class="sortIcon">{{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</i>
                            </th>
                            <th @click="sortBy('grade')">
                              Оценка
                              <i v-if="sortKey === 'grade'" :class="sortIcon">{{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</i>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="student in paginatedStudents" :key="student.id">
                            <td>{{ student.studentId || student.id || student.name || 'N/A' }}</td>
                            <td>{{ student.group }}</td>
                            <td>{{ student.subject }}</td>
                            <td :class="getGradeClass(student.grade)" class="grade-cell">{{ student.grade }}</td>
                          </tr>
                          <tr v-if="paginatedStudents.length === 0">
                            <td colspan="4" class="text-center">Нет данных для отображения</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row mt-4">
              <div class="col">
                <per-page-selector v-model="itemsPerPage" @change="resetPagination" />
                <pagination
                  :current-page="currentPage"
                  :total-pages="totalPages"
                  @page-change="onPageChange"
                />
                <div class="text-center text-muted mt-2">
                  Показано {{ paginatedStudents.length }} из {{ totalStudents }} записей
                </div>
              </div>
            </div>

            <!-- Аналитика по группам -->
            <div v-if="groupAnalyticsLoaded || groupAnalyticsLoading" class="row mt-4">
              <div class="col">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center" style="cursor: pointer" @click="groupAnalyticsExpanded = !groupAnalyticsExpanded">
                    <h6 class="mb-0">
                      <i class="material-icons small align-middle me-1">insights</i>
                      Аналитика по группам
                    </h6>
                    <div class="d-flex align-items-center">
                      <span v-if="groupAnalyticsLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      <i class="material-icons">{{ groupAnalyticsExpanded ? 'expand_less' : 'expand_more' }}</i>
                    </div>
                  </div>
                  <div v-if="groupAnalyticsExpanded" class="card-body">
                    <!-- Сводные карточки -->
                    <div class="row mb-3 g-2">
                      <div class="col-md-3 col-6">
                        <div class="card border-0 shadow-sm h-100 text-center">
                          <div class="card-body py-2 px-2">
                            <div class="text-muted small">Всего групп</div>
                            <div class="fw-bold fs-5">{{ groupFullData.length }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-3 col-6">
                        <div class="card border-0 shadow-sm h-100 text-center border-start border-success border-3">
                          <div class="card-body py-2 px-2">
                            <div class="text-success small">Лучшая группа</div>
                            <div class="fw-bold fs-6 text-success">{{ bestGroup?.group || '—' }}</div>
                            <div class="text-muted" style="font-size: 0.7rem">{{ bestGroup ? bestGroup.avgGrade.toFixed(2) + ' ср. балл' : '' }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-3 col-6">
                        <div class="card border-0 shadow-sm h-100 text-center border-start border-danger border-3">
                          <div class="card-body py-2 px-2">
                            <div class="text-danger small">Требуют внимания</div>
                            <div class="fw-bold fs-5 text-danger">{{ groupsAtRiskCount }}</div>
                            <div class="text-muted" style="font-size: 0.7rem">ср. балл &lt; 3.5 или посещ. &lt; 60%</div>
                          </div>
                        </div>
                      </div>
                      <div class="col-md-3 col-6">
                        <div class="card border-0 shadow-sm h-100 text-center border-start border-primary border-3">
                          <div class="card-body py-2 px-2">
                            <div class="text-primary small">Средний балл (все)</div>
                            <div class="fw-bold fs-5 text-primary">{{ overallAvgGrade }}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Текстовые инсайты -->
                    <div v-if="groupInsights.length" class="mb-3">
                      <div v-for="(insight, i) in groupInsights" :key="i" class="d-flex align-items-start mb-1">
                        <i class="material-icons small me-1" :class="insight.color" style="margin-top: 2px">{{ insight.icon }}</i>
                        <span class="small" v-html="insight.text"></span>
                      </div>
                    </div>

                    <!-- Единая таблица групп -->
                    <div class="table-responsive" style="max-height: 420px; overflow-y: auto;">
                      <table class="table table-sm table-hover mb-0 align-middle">
                        <thead class="table-light sticky-top">
                          <tr>
                            <th style="width: 40px">#</th>
                            <th>Группа</th>
                            <th style="width: 80px">Студ.</th>
                            <th style="min-width: 180px">Ср. балл</th>
                            <th style="min-width: 180px">Посещаемость</th>
                            <th style="width: 90px" class="text-center">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr
                            v-for="(g, i) in sortedGroupFull"
                            :key="g.group"
                            :class="{
                              'table-danger-subtle': g.atRisk,
                              'table-primary': selectedGroupName === g.group,
                              'group-row-clickable': true
                            }"
                            @click="selectGroup(g.group)"
                          >
                            <td class="text-muted">{{ i + 1 }}</td>
                            <td class="fw-semibold">{{ g.group }}</td>
                            <td>{{ g.studentsCount }}</td>
                            <td>
                              <div class="d-flex align-items-center gap-2">
                                <div class="progress flex-grow-1" style="height: 8px">
                                  <div class="progress-bar" :class="gradeBarClass(g.avgGrade)" :style="{ width: (g.avgGrade / 5 * 100) + '%' }" role="progressbar"></div>
                                </div>
                                <span class="badge" :class="gradeBarClass(g.avgGrade)" style="min-width: 44px">{{ g.avgGrade.toFixed(2) }}</span>
                              </div>
                            </td>
                            <td>
                              <div v-if="g.attendancePercent > 0 || !groupAnalyticsLoading" class="d-flex align-items-center gap-2">
                                <div class="progress flex-grow-1" style="height: 8px">
                                  <div class="progress-bar" :class="attendanceBarClass(g.attendancePercent)" :style="{ width: g.attendancePercent + '%' }" role="progressbar"></div>
                                </div>
                                <span class="small fw-semibold" style="min-width: 44px">{{ g.attendancePercent > 0 ? g.attendancePercent.toFixed(0) + '%' : '—' }}</span>
                              </div>
                              <div v-else class="d-flex align-items-center gap-2">
                                <span class="spinner-border spinner-border-sm text-muted" role="status"></span>
                                <span class="small text-muted">загрузка...</span>
                              </div>
                            </td>
                            <td class="text-center">
                              <span v-if="g.atRisk" class="badge bg-danger">Риск</span>
                              <span v-else-if="g.avgGrade >= 4.5 && g.attendancePercent >= 80" class="badge bg-success">Отлично</span>
                              <span v-else class="badge bg-secondary bg-opacity-25 text-dark">Норма</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div v-if="selectedGroupName" class="mt-4 border-top pt-3">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <h6 class="mb-0">
                          <i class="material-icons small align-middle me-1">groups</i>
                          Детализация группы {{ selectedGroupName }}
                        </h6>
                        <button class="btn btn-sm btn-outline-secondary" @click="selectedGroupName = null">
                          Скрыть
                        </button>
                      </div>

                      <div class="row g-2 mb-3">
                        <div class="col-md-3 col-6">
                          <div class="card border-0 shadow-sm h-100 text-center">
                            <div class="card-body py-2 px-2">
                              <div class="text-muted small">Студентов в выборке</div>
                              <div class="fw-bold fs-5">{{ selectedGroupStudents.length }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-3 col-6">
                          <div class="card border-0 shadow-sm h-100 text-center border-start border-primary border-3">
                            <div class="card-body py-2 px-2">
                              <div class="text-primary small">Ср. балл группы</div>
                              <div class="fw-bold fs-5 text-primary">{{ selectedGroupAvgGrade }}</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-3 col-6">
                          <div class="card border-0 shadow-sm h-100 text-center border-start border-danger border-3">
                            <div class="card-body py-2 px-2">
                              <div class="text-danger small">Рискованные оценки</div>
                              <div class="fw-bold fs-5 text-danger">{{ selectedGroupFailRate }}%</div>
                            </div>
                          </div>
                        </div>
                        <div class="col-md-3 col-6">
                          <div class="card border-0 shadow-sm h-100 text-center border-start border-success border-3">
                            <div class="card-body py-2 px-2">
                              <div class="text-success small">Критичных предметов</div>
                              <div class="fw-bold fs-5 text-success">{{ selectedGroupCriticalSubjects }}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="row g-3">
                        <div class="col-lg-6">
                          <div class="card h-100">
                            <div class="card-header">
                              <h6 class="mb-0">Студенты группы</h6>
                            </div>
                            <div class="card-body p-0">
                              <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
                                <table class="table table-sm table-hover mb-0">
                                  <thead class="table-light sticky-top">
                                    <tr>
                                      <th>ID</th>
                                      <th>Ср. балл</th>
                                      <th>Рисковые оценки</th>
                                      <th>Статус</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr v-for="student in selectedGroupStudents" :key="student.id">
                                      <td>{{ student.id }}</td>
                                      <td>{{ student.avgGrade }}</td>
                                      <td>{{ student.failCount }} / {{ student.totalGrades }}</td>
                                      <td>
                                        <span class="badge" :class="student.risk ? 'bg-danger' : 'bg-success'">
                                          {{ student.risk ? 'Риск' : 'Норма' }}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="col-lg-6">
                          <div class="card h-100">
                            <div class="card-header">
                              <h6 class="mb-0">Проблемные предметы группы</h6>
                            </div>
                            <div class="card-body p-0">
                              <div class="table-responsive" style="max-height: 320px; overflow-y: auto;">
                                <table class="table table-sm table-hover mb-0">
                                  <thead class="table-light sticky-top">
                                    <tr>
                                      <th>Предмет</th>
                                      <th>Ср. балл</th>
                                      <th>Риск несдачи</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr v-for="subject in selectedGroupSubjectIssues" :key="subject.subject">
                                      <td>{{ subject.subject }}</td>
                                      <td>{{ subject.avgGrade }}</td>
                                      <td>
                                        <span class="badge" :class="subject.failRate >= 30 ? 'bg-danger' : (subject.failRate >= 15 ? 'bg-warning text-dark' : 'bg-success')">
                                          {{ subject.failRate }}%
                                        </span>
                                      </td>
                                    </tr>
                                    <tr v-if="selectedGroupSubjectIssues.length === 0">
                                      <td colspan="3" class="text-center text-muted">Недостаточно данных</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
     <div v-else-if="!isLoading && !error && !statisticsData">
         Не удалось загрузить данные или данные отсутствуют.
     </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject } from 'vue';
import ChartComponent from '@/components/ChartComponent.vue';
import Pagination from '@/components/Pagination.vue';
import PerPageSelector from '@/components/PerPageSelector.vue';

const props = defineProps({
  filterOptions: {
    type: Object,
    required: true,
  },
  chartOptions: {
      type: Object,
      required: true
  }
});

const fetchData = inject('fetchData');
const API_BASE_URL = inject('API_BASE_URL');

const statisticsData = ref(null);
const isLoading = ref(false);
const error = ref(null);

const groupAnalyticsLoaded = ref(false);
const groupAnalyticsExpanded = ref(false);
const groupFullData = ref([]);
const groupAnalyticsLoading = ref(false);
const selectedGroupName = ref(null);

const parseGradeToNumeric = (grade) => {
  if (grade === null || grade === undefined) return null;
  const str = String(grade).toLowerCase();
  if (str === 'зачет' || str === 'зачёт') return 5;
  if (str === 'незачет' || str === 'незачёт') return 2;
  if (str === 'неявка') return 2;
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
};

const filters = reactive({
  course: '', semester: '', group: '', subject: '', search: ''
});

const currentPage = ref(1);
const itemsPerPage = ref(25);

let searchTimeout = null;

const searchInput = ref('');

const fetchStatisticsMarks = async () => {
    if (!fetchData) return;
    isLoading.value = true;
    error.value = null;
    const params = new URLSearchParams();
    if (filters.course) params.append('course', filters.course);
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.group) params.append('group', filters.group);
    if (filters.subject) params.append('subject', filters.subject);

    try {
        const data = await fetchData(`${API_BASE_URL}/statistics/marks/?${params.toString()}`);
        if (data !== null && data !== undefined) {
            statisticsData.value = data;
            if (data.students && Array.isArray(data.students)) {
                allStudentsData.value = processStudentData(data.students);
                sortBy(sortKey.value);
                buildGroupAnalyticsFromMarks();
            } else {
                allStudentsData.value = [];
            }
        } else {
            statisticsData.value = null;
            allStudentsData.value = [];
        }
    } catch (err) {
        error.value = err.message || 'Не удалось загрузить данные статистики.';
        statisticsData.value = null;
        allStudentsData.value = [];
    } finally {
        isLoading.value = false;
    }
};

const resetFilters = () => {
  filters.course = '';
  filters.semester = '';
  filters.group = '';
  filters.subject = '';
  filters.search = '';
  fetchStatisticsMarks();
};

const calculatePercentage = (summary, gradeValue) => {
   if (!summary) return '0.0';
   
   const gradeCounts = { 
       5: summary.countGrade5 ?? 0, 
       4: summary.countGrade4 ?? 0, 
       3: summary.countGrade3 ?? 0, 
       2: summary.countGrade2 ?? 0,
       'зачет': summary.countZachet ?? 0,
       'незачет': summary.countNezachet ?? 0,
       'неявка': summary.countNejavka ?? 0
   };
   
   const relevantTotal = Object.values(gradeCounts).reduce((s, c) => s + c, 0);
   if (!relevantTotal) return '0.0';
   const count = gradeCounts[gradeValue] ?? 0;
   return ((count / relevantTotal) * 100).toFixed(1);
};

const gradeMap = { '5': 'Отлично', '4': 'Хорошо', '3': 'Удовл.', '2': 'Неуд.' };
const getGradeText = (grade) => gradeMap[String(grade)] || grade;
const getGradeClass = (grade) => {
  const gradeStr = String(grade).toLowerCase();
  
  return {
    'grade-5': gradeStr === '5',
    'grade-4': gradeStr === '4',
    'grade-3': gradeStr === '3',
    'grade-2': gradeStr === '2',
    'grade-зачет': gradeStr === 'зачет' || gradeStr === 'зачёт',
    'grade-незачет': gradeStr === 'незачет' || gradeStr === 'незачёт',
    'grade-неявка': gradeStr === 'неявка'
  };
};

const emptyChartData = (type = 'bar') => ({ type, data: { labels: [], datasets: [] } });

const gradeSummaryChartData = computed(() => {
    const summary = statisticsData.value?.summary;
    if (!summary) return emptyChartData('bar');
    return { type: 'bar', data: { labels: ['Мин', 'Сред', 'Макс'], datasets: [{ label: 'Баллы', data: [summary.minGrade ?? 0, summary.averageGrade ?? 0, summary.maxGrade ?? 0], backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 205, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'], borderColor: ['rgb(255, 99, 132)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)'], borderWidth: 1, barPercentage: 0.5 }] } };
});

const gradeDistributionChartData = computed(() => {
    const summary = statisticsData.value?.summary;
    if (!summary) return emptyChartData('pie');
    
    const labels = [
        'Неуд (2)', 
        'Удовл (3)', 
        'Хорошо (4)', 
        'Отлично (5)', 
        'Зачет', 
        'Незачет', 
        'Неявка'
    ];
    
    const data = [
        summary.countGrade2 ?? 0, 
        summary.countGrade3 ?? 0, 
        summary.countGrade4 ?? 0, 
        summary.countGrade5 ?? 0,
        summary.countZachet ?? 0,
        summary.countNezachet ?? 0,
        summary.countNejavka ?? 0
    ];
    
    const bgColors = [
        'rgba(255, 99, 132, 0.6)',  // Красный (2)
        'rgba(255, 205, 86, 0.6)',  // Желтый (3)
        'rgba(54, 162, 235, 0.6)',  // Синий (4)
        'rgba(75, 192, 192, 0.6)',  // Зеленый (5)
        'rgba(153, 102, 255, 0.6)', // Фиолетовый (Зачет)
        'rgba(255, 159, 64, 0.6)',  // Оранжевый (Незачет)
        'rgba(201, 203, 207, 0.6)'  // Серый (Неявка)
    ];
    
    const borderColors = [
        'rgb(255, 99, 132)',
        'rgb(255, 205, 86)',
        'rgb(54, 162, 235)',
        'rgb(75, 192, 192)',
        'rgb(153, 102, 255)',
        'rgb(255, 159, 64)',
        'rgb(201, 203, 207)'
    ];
    
    const filteredLabels = [];
    const filteredData = [];
    const filteredBgColors = [];
    const filteredBorderColors = [];
    
    for (let i = 0; i < data.length; i++) {
        if (data[i] > 0) {
            filteredLabels.push(labels[i]);
            filteredData.push(data[i]);
            filteredBgColors.push(bgColors[i]);
            filteredBorderColors.push(borderColors[i]);
        }
    }
    
    return { 
        type: 'pie', 
        data: { 
            labels: filteredLabels, 
            datasets: [{ 
                data: filteredData, 
                backgroundColor: filteredBgColors, 
                borderColor: filteredBorderColors, 
                borderWidth: 1 
            }] 
        } 
    };
});

const allStudentsData = ref([]);

const sortKey = ref('name');
const sortDirection = ref('asc');
const sortIcon = computed(() => 'material-icons small text-muted ms-1');

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'asc';
  }
  
  allStudentsData.value.sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    
    if (key === 'grade') {
      const numA = !isNaN(parseInt(valA)) ? parseInt(valA) : 
                   valA === 'зачет' || valA === 'Зачет' || valA === 'Зачёт' ? 5 : 
                   valA === 'незачет' || valA === 'Незачет' || valA === 'Незачёт' ? 2 : 0;
      
      const numB = !isNaN(parseInt(valB)) ? parseInt(valB) : 
                   valB === 'зачет' || valB === 'Зачет' || valB === 'Зачёт' ? 5 : 
                   valB === 'незачет' || valB === 'Незачет' || valB === 'Незачёт' ? 2 : 0;
      
      return sortDirection.value === 'asc' ? numA - numB : numB - numA;
    }
    
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    
    if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
};

const temporaryGradeFilter = ref(null);

const handleGradeDistributionClick = (data) => {
  if (!data || !data.label) return;
  
  const label = data.label;
  
  let gradeFilter;
  
  if (label.includes('(5)') || label.includes('Отлично')) {
    gradeFilter = '5';
  } else if (label.includes('(4)') || label.includes('Хорошо')) {
    gradeFilter = '4';
  } else if (label.includes('(3)') || label.includes('Удовл')) {
    gradeFilter = '3';
  } else if (label.includes('(2)') || label.includes('Неуд')) {
    gradeFilter = '2';
  } else if (label.includes('Зачет')) {
    gradeFilter = 'зачет';
  } else if (label.includes('Незачет')) {
    gradeFilter = 'незачет';
  } else if (label.includes('Неявка')) {
    gradeFilter = 'неявка';
  }
  
  if (gradeFilter) {
    searchInput.value = '';
    filters.search = '';
    
    sortKey.value = 'grade';
    sortDirection.value = 'asc';
    
    temporaryGradeFilter.value = gradeFilter;
    
    currentPage.value = 1;
    
    scrollToTable();
  }
};

const filteredStudents = computed(() => {
  let result = Array.isArray(allStudentsData.value) ? allStudentsData.value : [];
  
  if (filters.search && filters.search.trim() !== '') {
    const searchTerm = filters.search.toLowerCase().trim();
    result = result.filter(student => {
      if (!student) return false;
      const studentId = String(student.studentId || student.id || student.name || '');
      return studentId.toLowerCase().includes(searchTerm) ||
             (student.group && student.group.toLowerCase().includes(searchTerm)) ||
             (student.subject && student.subject.toLowerCase().includes(searchTerm));
    });
  }
  
  if (temporaryGradeFilter.value) {
    result = result.filter(student => {
      if (!student) return false;
      return String(student.grade).toLowerCase() === temporaryGradeFilter.value.toLowerCase();
    });
  }
  
  return result;
});

const totalStudents = computed(() => {
  return Array.isArray(filteredStudents.value) ? filteredStudents.value.length : 0;
});

const totalPages = computed(() => {
  return Math.ceil(totalStudents.value / (itemsPerPage.value || 1)) || 1;
});

const paginatedStudents = computed(() => {
  if (!Array.isArray(filteredStudents.value)) return [];
  
  const start = (currentPage.value - 1) * (itemsPerPage.value || 25);
  const end = start + (itemsPerPage.value || 25);
  return filteredStudents.value.slice(start, end);
});

const scrollToTable = () => {
  setTimeout(() => {
    const tableElement = document.querySelector('.table-striped');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const clearGradeFilter = () => {
  temporaryGradeFilter.value = null;
  currentPage.value = 1;
};

const clearSearch = () => {
  searchInput.value = '';
  filters.search = '';
  temporaryGradeFilter.value = null;
  currentPage.value = 1;

  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
};

const onPageChange = (page) => {
  currentPage.value = page;
};

const resetPagination = () => {
  currentPage.value = 1;
};

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    filters.search = searchInput.value;
    currentPage.value = 1;
  }, 1000);
};

watch(
  () => ({
    course: filters.course,
    semester: filters.semester,
    group: filters.group,
    subject: filters.subject
  }),
  () => {
    fetchStatisticsMarks();
  },
  { deep: true, immediate: false }
);

const buildGroupAnalyticsFromMarks = () => {
  const students = statisticsData.value?.students;
  if (!students || !Array.isArray(students) || students.length === 0) {
    groupAnalyticsLoaded.value = false;
    return;
  }

  const groupMap = {};

  for (const student of students) {
    const groupName = student.group;
    if (!groupName) continue;

    if (!groupMap[groupName]) {
      groupMap[groupName] = {
        group: groupName,
        grades: [],
        studentsCount: 0,
      };
    }

    groupMap[groupName].studentsCount++;

    if (student.subjects && Array.isArray(student.subjects)) {
      for (const subj of student.subjects) {
        if (subj.grades && Array.isArray(subj.grades)) {
          for (const g of subj.grades) {
            const num = parseGradeToNumeric(g);
            if (num !== null && num >= 2 && num <= 5) {
              groupMap[groupName].grades.push(num);
            }
          }
        }
      }
    }
  }

  groupFullData.value = Object.values(groupMap).map(g => {
    const avgGrade = g.grades.length > 0
      ? +(g.grades.reduce((a, b) => a + b, 0) / g.grades.length).toFixed(2)
      : 0;
    return {
      group: g.group,
      studentsCount: g.studentsCount,
      avgGrade,
      attendancePercent: 0,
      atRisk: avgGrade < 3.5,
    };
  });

  if (groupFullData.value.length > 0) {
    groupAnalyticsLoaded.value = true;
    groupAnalyticsExpanded.value = true;
    fetchGroupAttendance();
  }
};

const fetchGroupAttendance = async () => {
  if (!fetchData) return;
  groupAnalyticsLoading.value = true;
  try {
    const params = new URLSearchParams();
    params.append('limit', '300');
    if (filters.course) params.append('course', filters.course);

    const data = await fetchData(`${API_BASE_URL}/student-rating/?${params.toString()}`);
    if (data && data.students && Array.isArray(data.students)) {
      const attendanceMap = {};

      for (const student of data.students) {
        const groupName = student.group;
        if (!groupName) continue;
        if (!attendanceMap[groupName]) {
          attendanceMap[groupName] = [];
        }
        if (typeof student.attendancePercent === 'number') {
          attendanceMap[groupName].push(student.attendancePercent);
        }
      }

      groupFullData.value = groupFullData.value.map(g => {
        const attendances = attendanceMap[g.group];
        const attendancePercent = attendances && attendances.length > 0
          ? +(attendances.reduce((a, b) => a + b, 0) / attendances.length).toFixed(1)
          : 0;
        return {
          ...g,
          attendancePercent,
          atRisk: g.avgGrade < 3.5 || attendancePercent < 60,
        };
      });
    }
  } catch {
    // attendance enrichment failed, keep grade-only data
  } finally {
    groupAnalyticsLoading.value = false;
  }
};

const sortedGroupFull = computed(() =>
  [...groupFullData.value].sort((a, b) => (b.avgGrade ?? 0) - (a.avgGrade ?? 0))
);

const isFailGrade = (grade) => {
  const str = String(grade).toLowerCase();
  return str === '2' || str === 'незачет' || str === 'незачёт' || str === 'неявка';
};

const selectGroup = (groupName) => {
  selectedGroupName.value = selectedGroupName.value === groupName ? null : groupName;
};

const selectedGroupStudentsRaw = computed(() => {
  const all = statisticsData.value?.students;
  if (!all || !Array.isArray(all) || !selectedGroupName.value) return [];
  return all.filter(s => s.group === selectedGroupName.value);
});

const selectedGroupStudents = computed(() => {
  return selectedGroupStudentsRaw.value.map(student => {
    let totalGrades = 0;
    let failCount = 0;
    const numeric = [];

    for (const subj of student.subjects || []) {
      for (const grade of subj.grades || []) {
        totalGrades += 1;
        if (isFailGrade(grade)) failCount += 1;
        const n = parseGradeToNumeric(grade);
        if (n !== null) numeric.push(n);
      }
    }

    const avgGrade = numeric.length ? (numeric.reduce((a, b) => a + b, 0) / numeric.length) : 0;
    const failRate = totalGrades ? (failCount / totalGrades) * 100 : 0;

    return {
      id: student.id,
      avgGrade: avgGrade.toFixed(2),
      failCount,
      totalGrades,
      risk: avgGrade < 3.5 || failRate >= 30,
    };
  }).sort((a, b) => Number(a.avgGrade) - Number(b.avgGrade));
});

const selectedGroupNumericGradeStats = computed(() => {
  const grades = [];
  for (const student of selectedGroupStudentsRaw.value) {
    for (const subj of student.subjects || []) {
      for (const grade of subj.grades || []) {
        const n = parseGradeToNumeric(grade);
        if (n !== null && n >= 2 && n <= 5) grades.push(n);
      }
    }
  }
  return grades;
});

const selectedGroupAvgGrade = computed(() => {
  if (!selectedGroupNumericGradeStats.value.length) return '—';
  const sum = selectedGroupNumericGradeStats.value.reduce((a, b) => a + b, 0);
  return (sum / selectedGroupNumericGradeStats.value.length).toFixed(2);
});

const selectedGroupFailRate = computed(() => {
  let fail = 0;
  let total = 0;
  for (const s of selectedGroupStudents.value) {
    fail += s.failCount;
    total += s.totalGrades;
  }
  if (!total) return 0;
  return ((fail / total) * 100).toFixed(1);
});

const selectedGroupSubjectIssues = computed(() => {
  const subjectMap = {};

  for (const student of selectedGroupStudentsRaw.value) {
    for (const subj of student.subjects || []) {
      const subjectName = subj.subject;
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = { numeric: [], fail: 0, total: 0 };
      }

      for (const grade of subj.grades || []) {
        subjectMap[subjectName].total += 1;
        if (isFailGrade(grade)) subjectMap[subjectName].fail += 1;
        const n = parseGradeToNumeric(grade);
        if (n !== null) subjectMap[subjectName].numeric.push(n);
      }
    }
  }

  return Object.entries(subjectMap)
    .map(([subject, stats]) => {
      const avgGrade = stats.numeric.length
        ? (stats.numeric.reduce((a, b) => a + b, 0) / stats.numeric.length)
        : 0;
      const failRate = stats.total ? (stats.fail / stats.total) * 100 : 0;
      return {
        subject,
        avgGrade: avgGrade.toFixed(2),
        failRate: Number(failRate.toFixed(1)),
      };
    })
    .sort((a, b) => b.failRate - a.failRate)
    .slice(0, 10);
});

const selectedGroupCriticalSubjects = computed(() =>
  selectedGroupSubjectIssues.value.filter(s => s.failRate >= 30).length
);

const bestGroup = computed(() => sortedGroupFull.value[0] ?? null);

const groupsAtRiskCount = computed(() =>
  groupFullData.value.filter(g => g.atRisk).length
);

const overallAvgGrade = computed(() => {
  if (!groupFullData.value.length) return '—';
  const sum = groupFullData.value.reduce((acc, g) => acc + g.avgGrade, 0);
  return (sum / groupFullData.value.length).toFixed(2);
});

const groupInsights = computed(() => {
  const insights = [];
  const sorted = sortedGroupFull.value;
  if (!sorted.length) return insights;

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const riskGroups = groupFullData.value.filter(g => g.atRisk);
  const excellentGroups = groupFullData.value.filter(g => g.avgGrade >= 4.5 && g.attendancePercent >= 80);

  insights.push({
    icon: 'emoji_events',
    color: 'text-success',
    text: `<strong>${best.group}</strong> лидирует с баллом <strong>${best.avgGrade.toFixed(2)}</strong> и посещаемостью <strong>${best.attendancePercent.toFixed(0)}%</strong>`,
  });

  if (worst.group !== best.group && worst.avgGrade < 3.5) {
    insights.push({
      icon: 'warning',
      color: 'text-danger',
      text: `<strong>${worst.group}</strong> — самый низкий средний балл (<strong>${worst.avgGrade.toFixed(2)}</strong>), стоит обратить внимание`,
    });
  }

  if (riskGroups.length > 0) {
    insights.push({
      icon: 'error_outline',
      color: 'text-danger',
      text: `<strong>${riskGroups.length}</strong> из ${sorted.length} групп ниже порога (балл &lt; 3.5 или посещ. &lt; 60%)`,
    });
  }

  if (excellentGroups.length > 0) {
    insights.push({
      icon: 'star',
      color: 'text-success',
      text: `<strong>${excellentGroups.length}</strong> ${excellentGroups.length === 1 ? 'группа показывает' : 'групп показывают'} отличный результат (балл ≥ 4.5 и посещ. ≥ 80%)`,
    });
  }

  const bestAttGroup = [...groupFullData.value].sort((a, b) => b.attendancePercent - a.attendancePercent)[0];
  if (bestAttGroup && bestAttGroup.group !== best.group) {
    insights.push({
      icon: 'directions_run',
      color: 'text-primary',
      text: `Лучшая посещаемость у <strong>${bestAttGroup.group}</strong> — <strong>${bestAttGroup.attendancePercent.toFixed(0)}%</strong>`,
    });
  }

  return insights;
});

const gradeBarClass = (grade) => {
  if (grade >= 4.5) return 'bg-success';
  if (grade >= 3.5) return 'bg-warning';
  return 'bg-danger';
};

const attendanceBarClass = (pct) => {
  if (pct >= 80) return 'bg-success';
  if (pct >= 60) return 'bg-warning';
  return 'bg-danger';
};

onMounted(() => {
  fetchStatisticsMarks();
});

const processStudentData = (students) => {
  if (!students || !Array.isArray(students)) return [];

  const expandedRecords = [];
  
  students.forEach(student => {
    if (!student) return;
 
    // Сохраняем оригинальный ID студента
    const studentId = student.id || student.name || 'N/A';
    
    if (!student.subjects || !Array.isArray(student.subjects) || student.subjects.length === 0) {
      expandedRecords.push({
        id: `${student.id || 'unknown'}-empty`,
        studentId: studentId,  // Оригинальный ID студента
        name: studentId,
        group: student.group || '-',
        subject: 'Нет данных',
        grade: '-'
      });
      return;
    }
    
    student.subjects.forEach((subjectData, subjectIndex) => {
      if (!subjectData) return;
      
      const subject = subjectData.subject || 'Неизвестный предмет';
      const grades = Array.isArray(subjectData.grades) ? subjectData.grades : [];
      
      if (grades.length === 0) {
        expandedRecords.push({
          id: `${student.id || 'unknown'}-${subjectIndex}-empty`,
          studentId: studentId,  // Оригинальный ID студента
          name: studentId,
          group: student.group || '-',
          subject: subject,
          grade: '-'
        });
      } else {
        grades.forEach((grade, gradeIndex) => {
          let normalizedGrade = grade;
          
          if (typeof grade === 'string') {
            const lowerGrade = grade.toLowerCase();
            if (lowerGrade === 'зачет' || lowerGrade === 'зачёт') {
              normalizedGrade = 'зачет';
            } else if (lowerGrade === 'незачет' || lowerGrade === 'незачёт') {
              normalizedGrade = 'незачет';
            } else if (lowerGrade === 'неявка') {
              normalizedGrade = 'неявка';
            }
          }
          
          expandedRecords.push({
            id: `${student.id || 'unknown'}-${subjectIndex}-${gradeIndex}`,
            studentId: studentId,  // Оригинальный ID студента
            name: studentId,
            group: student.group || '-',
            subject: subject,
            grade: normalizedGrade !== undefined && normalizedGrade !== null ? normalizedGrade : '-'
          });
        });
      }
    });
  });
  
  return expandedRecords;
};
</script>

<style scoped>
.d-flex.gap-2 {
    flex-wrap: wrap;
}
.table-danger-subtle {
    background-color: rgba(220, 53, 69, 0.05);
}
.group-row-clickable {
    cursor: pointer;
}
.group-row-clickable:hover {
    background-color: rgba(13, 110, 253, 0.06);
}
</style>