<template>
  <div class="student-rating-section">
    <div v-if="isLoading" class="alert alert-info">Загрузка рейтинга студентов...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Аналитические инсайты -->
    <div v-if="analyticsLoaded" class="row mb-3 g-2">
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm h-100" :class="{ 'ring-active': !statusFilter }" style="cursor:pointer" @click="setStatusFilter('')">
          <div class="card-body py-2 px-3 text-center">
            <i class="material-icons text-muted mb-1" style="font-size: 1.3rem">people</i>
            <div class="text-muted small">Проанализировано</div>
            <div class="fw-bold fs-5">{{ analyticsSummary.total }}</div>
            <div class="text-muted" style="font-size: 0.7rem">студентов</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm h-100 border-start border-success border-3" :class="{ 'ring-active': statusFilter === 'excellent' }" style="cursor:pointer" @click="setStatusFilter('excellent')">
          <div class="card-body py-2 px-3 text-center">
            <i class="material-icons text-success mb-1" style="font-size: 1.3rem">emoji_events</i>
            <div class="text-success small">Активные отличники</div>
            <div class="fw-bold fs-5 text-success">{{ analyticsSummary.topCount }}</div>
            <div class="text-muted" style="font-size: 0.7rem">{{ analyticsSummary.topPercent }}% от общего</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm h-100 border-start border-danger border-3" :class="{ 'ring-active': statusFilter === 'risk' }" style="cursor:pointer" @click="setStatusFilter('risk')">
          <div class="card-body py-2 px-3 text-center">
            <i class="material-icons text-danger mb-1" style="font-size: 1.3rem">warning</i>
            <div class="text-danger small">Зона риска</div>
            <div class="fw-bold fs-5 text-danger">{{ analyticsSummary.riskCount }}</div>
            <div class="text-muted" style="font-size: 0.7rem">{{ analyticsSummary.riskPercent }}% от общего</div>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="card border-0 shadow-sm h-100 border-start border-info border-3" :class="{ 'ring-active': statusFilter === 'good' }" style="cursor:pointer" @click="setStatusFilter('good')">
          <div class="card-body py-2 px-3 text-center">
            <i class="material-icons text-info mb-1" style="font-size: 1.3rem">check_circle</i>
            <div class="text-info small">Хорошая посещаемость</div>
            <div class="fw-bold fs-5 text-info">{{ analyticsSummary.goodCount }}</div>
            <div class="text-muted" style="font-size: 0.7rem">{{ analyticsSummary.goodPercent }}% от общего</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="chartData.length > 0 || allStudentsData.length > 0" class="card">
       <div class="card-header">
         <h5 class="text-center mb-3">Рейтинг студентов</h5>
         <div class="d-flex justify-content-end gap-3 mb-3 flex-wrap">
           <select class="form-select w-auto" v-model="filters.course"><option value="">Все курсы</option><option v-for="c in filterOptions.courses" :key="c" :value="c">{{c}} курс</option></select>
           <select class="form-select w-auto" v-model="filters.group"><option value="">Все группы</option><option v-for="g in filterOptions.groups" :key="g" :value="g">{{g}}</option></select>
           <select class="form-select w-auto" v-model="filters.subject"><option value="">Все предметы</option><option v-for="s in filterOptions.subjects" :key="s" :value="s">{{s}}</option></select>
           <button class="btn btn-outline-secondary btn-sm" @click="resetFilters">Сбросить</button>
           <div class="btn-group">
             <input type="radio" class="btn-check" name="rs" id="sr" v-model="filters.sortBy" value="rating"><label class="btn btn-outline-primary btn-sm" for="sr">Рейтинг</label>
             <input type="radio" class="btn-check" name="rs" id="sp" v-model="filters.sortBy" value="performance"><label class="btn btn-outline-primary btn-sm" for="sp">Успев.</label>
             <input type="radio" class="btn-check" name="rs" id="sa" v-model="filters.sortBy" value="attendance"><label class="btn btn-outline-primary btn-sm" for="sa">Посещ.</label>
             <input type="radio" class="btn-check" name="rs" id="sac" v-model="filters.sortBy" value="activity"><label class="btn btn-outline-primary btn-sm" for="sac">Актив.</label>
           </div>
           <div class="dropdown">
             <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
               Показать на диаграмме: {{ filters.limit }}
             </button>
             <ul class="dropdown-menu">
               <li><a class="dropdown-item" @click="filters.limit = 5">Топ 5</a></li>
               <li><a class="dropdown-item" @click="filters.limit = 10">Топ 10</a></li>
               <li><a class="dropdown-item" @click="filters.limit = 20">Топ 20</a></li>
             </ul>
           </div>
         </div>
         <div v-if="statusFilter" class="d-flex justify-content-center mb-2">
           <span class="badge" :class="statusFilterBadgeClass">
             {{ statusFilterLabel }}
             <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close" @click="statusFilter = ''" style="font-size: 0.5rem;"></button>
           </span>
         </div>
       </div>
       <div class="card-body">
         <div class="row mb-4">
           <div class="col-12">
             <div class="card">
               <div class="card-header d-flex justify-content-between align-items-center">
                 <h6 class="mb-0">Рейтинг студентов</h6>
               </div>
               <div class="card-body">
                 <ChartComponent
                   v-if="!isLoading && chartData.length > 0"
                   :chartData="ratingChartData"
                   :chartOptions="ratingChartOptions"
                 />
                 <div v-else-if="isLoading" class="text-center py-5">
                   <div class="spinner-border text-primary" role="status">
                     <span class="visually-hidden">Загрузка...</span>
                   </div>
                 </div>
                 <div v-else class="text-center py-5 text-muted">
                   Нет данных для отображения
                 </div>
               </div>
             </div>
           </div>
         </div>
         <div class="table-responsive">
           <table class="table table-striped table-hover">
             <thead><tr><th>ID студента</th><th>Группа</th><th>Курс</th><th>Ср.балл</th><th>Актив.</th><th>Посещ.</th><th>Долги</th><th>Риск отч.</th><th>Рейтинг</th><th v-if="analyticsLoaded">Статус</th></tr></thead>
             <tbody>
              <tr v-for="(student, index) in paginatedStudents" :key="`${student.id}-${index}`" :class="{'table-danger-subtle': student.riskLevel === 'высокий'}">
                <td>{{ student.id || student.name || 'N/A' }}</td>
                <td>{{ student.group }}</td>
                <td>{{ student.course }}</td>
                <td>{{ student.avgGrade?.toFixed(2) ?? 'N/A' }}</td>
                <td>{{ student.activity?.toFixed(2) ?? 'N/A' }}</td>
                <td>{{ formatRatingAttendance(student.attendancePercent) }}</td>
                <td>
                  <span v-if="student.debtCount > 0" class="badge bg-danger" :title="formatDebtsTooltip(student.debtsDetails)" style="cursor: help">
                    {{ student.debtCount }}
                  </span>
                  <span v-else class="badge bg-success">0</span>
                </td>
                <td>
                  <span :class="getDropoutRiskClass(student.dropoutRisk)">{{ formatDropoutRisk(student.dropoutRisk) }}</span>
                  <div class="small text-muted" v-if="student.riskLevel">{{ student.riskLevel }}</div>
                </td>
                <td>{{ student.rating?.toFixed(2) ?? 'N/A' }}</td>
                <td v-if="analyticsLoaded">
                  <span v-if="getStudentStatus(student.id)" class="badge" :class="getStudentStatusClass(student.id)">{{ getStudentStatus(student.id) }}</span>
                </td>
              </tr>
              <tr v-if="!paginatedStudents.length"><td :colspan="analyticsLoaded ? 10 : 9" class="text-center text-muted">Студенты не найдены</td></tr>
             </tbody>
           </table>
         </div>
         <div class="d-flex justify-content-between align-items-center mt-3">
           <per-page-selector v-model="itemsPerPage" @change="resetPagination" />
           <pagination
             :current-page="currentPage"
             :total-pages="totalPages"
             @page-change="onPageChange"
           />
         </div>
         <div class="text-center text-muted mt-2">
           Показано {{ paginatedStudents.length }} из {{ totalStudents }} записей
         </div>
        <div v-if="isLoadingMore || totalAvailable > loadedStudentsCount" class="text-center text-muted small mt-1">
          <span v-if="isLoadingMore" class="spinner-border spinner-border-sm me-2" role="status"></span>
          Догрузка студентов: {{ loadedStudentsCount }} из {{ totalAvailable || '...' }}
        </div>
       </div>
     </div>
    <div v-else-if="!isLoading && !error && !(chartData.length > 0 || allStudentsData.length > 0)">
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
  filterOptions: { type: Object, required: true },
  ratingChartOptions: { type: Object, required: true } 
});

const fetchData = inject('fetchData');
const API_BASE_URL = inject('API_BASE_URL');

const studentRatingData = ref(null);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const error = ref(null);

const filters = reactive({
  course: '', group: '', subject: '', sortBy: 'rating', limit: 5
});

const currentPage = ref(1);
const itemsPerPage = ref(25); 

const allChartEntries = ref([]);
const allStudentsData = ref([]);
const totalAvailable = ref(0);
const loadedStudentsCount = computed(() => allStudentsData.value.length);

const chartData = computed(() => allChartEntries.value.slice(0, filters.limit)); 

const analyticsData = ref(null);
const analyticsLoaded = ref(false);
const statusFilter = ref('');
let activeLoadToken = 0;

const topStudentIds = ref(new Set());
const riskStudentIds = ref(new Set());
const goodAttendanceIds = ref(new Set());

const deriveAnalyticsFromStudents = () => {
  const students = allStudentsData.value;
  if (!students || students.length === 0) {
    topStudentIds.value = new Set();
    riskStudentIds.value = new Set();
    goodAttendanceIds.value = new Set();
    analyticsData.value = {
      summary: { totalStudents: 0 },
      topStudents: [],
      lowAttendance: [],
      goodAttendance: [],
    };
    analyticsLoaded.value = true;
    return;
  }

  const topIds = [];
  const riskIds = [];
  const goodIds = [];

  for (const student of students) {
    const id = String(student.id);
    const avgGrade = student.avgGrade ?? 0;
    const riskLevel = student.riskLevel ?? '';
    const attendancePercent = student.attendancePercent ?? 0;

    if (avgGrade >= 4.5 && riskLevel === 'низкий') {
      topIds.push(id);
    } else if (riskLevel === 'высокий') {
      riskIds.push(id);
    } else if (attendancePercent >= 80 && riskLevel !== 'высокий') {
      goodIds.push(id);
    }
  }

  topStudentIds.value = new Set(topIds);
  riskStudentIds.value = new Set(riskIds);
  goodAttendanceIds.value = new Set(goodIds);

  analyticsData.value = {
    summary: { totalStudents: students.length },
    topStudents: topIds.map(id => ({ id })),
    lowAttendance: riskIds.map(id => ({ id })),
    goodAttendance: goodIds.map(id => ({ id })),
  };
  analyticsLoaded.value = true;
};

const analyticsSummary = computed(() => {
  const total = analyticsData.value?.summary?.totalStudents ?? analyticsData.value?.students?.length ?? 0;
  const topCount = analyticsData.value?.topStudents?.length ?? 0;
  const riskCount = analyticsData.value?.lowAttendance?.length ?? 0;
  const goodCount = analyticsData.value?.goodAttendance?.length ?? 0;
  const pct = (n) => total > 0 ? ((n / total) * 100).toFixed(1) : '0.0';
  return {
    total, topCount, riskCount, goodCount,
    topPercent: pct(topCount),
    riskPercent: pct(riskCount),
    goodPercent: pct(goodCount),
  };
});

const getStudentStatus = (studentId) => {
  const id = String(studentId);
  if (topStudentIds.value.has(id)) return 'Отличник';
  if (riskStudentIds.value.has(id)) return 'Зона риска';
  if (goodAttendanceIds.value.has(id)) return 'Хор. посещ.';
  return '';
};

const getStudentStatusClass = (studentId) => {
  const id = String(studentId);
  if (topStudentIds.value.has(id)) return 'bg-success';
  if (riskStudentIds.value.has(id)) return 'bg-danger';
  if (goodAttendanceIds.value.has(id)) return 'bg-info';
  return 'bg-secondary';
};

const setStatusFilter = (status) => {
  statusFilter.value = statusFilter.value === status ? '' : status;
  currentPage.value = 1;
};

const statusFilterLabel = computed(() => {
  switch (statusFilter.value) {
    case 'excellent': return 'Активные отличники';
    case 'risk': return 'Зона риска';
    case 'good': return 'Хорошая посещаемость';
    default: return '';
  }
});

const statusFilterBadgeClass = computed(() => {
  switch (statusFilter.value) {
    case 'excellent': return 'bg-success';
    case 'risk': return 'bg-danger';
    case 'good': return 'bg-info';
    default: return 'bg-secondary';
  }
});

const BATCH_SIZE = 200;

const buildBaseParams = () => {
  const params = new URLSearchParams();
  if (filters.course) params.append('course', filters.course);
  if (filters.group) params.append('group', filters.group);
  if (filters.subject) params.append('subject', filters.subject);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  return params;
};

const fetchRatingBatch = async (baseParams, offset, limit) => {
  const params = new URLSearchParams(baseParams);
  params.set('offset', String(offset));
  params.set('limit', String(limit));
  return fetchData(`${API_BASE_URL}/student-rating/?${params.toString()}`);
};

const loadRemainingBatches = async (baseParams, token, initialOffset, total) => {
  let offset = initialOffset;
  let hasMore = offset < total;
  isLoadingMore.value = hasMore;

  while (hasMore && token === activeLoadToken) {
    const response = await fetchRatingBatch(baseParams, offset, BATCH_SIZE);
    if (token !== activeLoadToken) return;

    const batchStudents = response?.students || [];
    const batchChart = response?.chartData || [];
    const pagination = response?.pagination || {};

    allStudentsData.value = [...allStudentsData.value, ...batchStudents];
    allChartEntries.value = [...allChartEntries.value, ...batchChart];
    totalAvailable.value = pagination.total ?? totalAvailable.value;

    deriveAnalyticsFromStudents();
    offset += batchStudents.length;
    hasMore = Boolean(pagination.hasMore) && batchStudents.length > 0;
  }

  if (token === activeLoadToken) {
    isLoadingMore.value = false;
  }
};

const fetchStudentRating = async () => {
    const token = ++activeLoadToken;
    isLoading.value = true;
    isLoadingMore.value = false;
    error.value = null;
    allChartEntries.value = [];
    allStudentsData.value = [];
    totalAvailable.value = 0;

    const baseParams = buildBaseParams();
    try {
        const firstBatch = await fetchRatingBatch(baseParams, 0, BATCH_SIZE);
        if (token !== activeLoadToken) return;

        if (firstBatch) {
            allChartEntries.value = firstBatch.chartData || [];
            allStudentsData.value = firstBatch.students || [];
            const pagination = firstBatch.pagination || {};
            totalAvailable.value = pagination.total ?? allStudentsData.value.length;
            studentRatingData.value = {
                chartData: chartData.value,
                students: allStudentsData.value
            };
            deriveAnalyticsFromStudents();

            isLoading.value = false;

            const nextOffset = allStudentsData.value.length;
            if (pagination.hasMore) {
              await loadRemainingBatches(baseParams, token, nextOffset, totalAvailable.value);
            }
        }
    } catch (err) {
        if (token !== activeLoadToken) return;
        error.value = err.message || 'Не удалось загрузить данные рейтинга.';
        allChartEntries.value = [];
        allStudentsData.value = [];
        totalAvailable.value = 0;
        studentRatingData.value = null;
    } finally {
        if (token === activeLoadToken) {
          isLoading.value = false;
          isLoadingMore.value = false;
        }
    }
};

const resetFilters = () => {
  filters.course = '';
  filters.group = '';
  filters.subject = '';
  filters.sortBy = 'rating';
  filters.limit = 5;
  statusFilter.value = '';
  fetchStudentRating();
};

const formatRatingAttendance = (p) => (typeof p === 'number' ? `${p.toFixed(1)}%` : 'N/A');
const formatDropoutRisk = (r) => (typeof r === 'number' ? `${(r * 100).toFixed(1)}%` : 'N/A');
const getDropoutRiskClass = (r) => { if (typeof r !== 'number') return {'badge': true, 'bg-secondary': true }; const normR = Math.max(0, Math.min(1, r)); return {'badge': true,'bg-success': normR < 0.3,'bg-warning': normR >= 0.3 && normR < 0.6,'bg-danger': normR >= 0.6 }; };

const formatDebtsTooltip = (debtsDetails) => {
  if (!debtsDetails || !Array.isArray(debtsDetails) || debtsDetails.length === 0) return '';
  return debtsDetails.map(d => `${d.discipline}: ${d.grade}`).join('\n');
};

const emptyChartData = (type = 'bar') => ({ type, data: { labels: [], datasets: [] } });

const ratingChartData = computed(() => {
    if (!chartData.value || chartData.value.length === 0) {
        return { type: 'bar', data: { labels: [], datasets: [] } };
    }
    
    const labels = chartData.value.map(s => s.name);
    
    const maxAvgGrade = Math.max(...chartData.value.map(s => s.avgGrade || 0));
    const maxActivity = Math.max(...chartData.value.map(s => s.activity || 0));
    const maxAttendance = Math.max(...chartData.value.map(s => s.attendancePercent || 0));
    
    const normalizeValue = (value, max) => {
        if (!value || !max) return 0;
        return Math.min(100, (value / max) * 100);
    };
    
    const datasets = [
        {
            label: 'Успеваемость',
            data: chartData.value.map(s => s.avgGrade ? normalizeValue(s.avgGrade, 5) : 0),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 1,
            stack: 'Stack 0'
        },
        {
            label: 'Активность',
            data: chartData.value.map(s => s.activity ? normalizeValue(s.activity, 5) : 0),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1,
            stack: 'Stack 0'
        },
        {
            label: 'Посещаемость',
            data: chartData.value.map(s => s.attendancePercent ? normalizeValue(s.attendancePercent, 1) : 0), 
            backgroundColor: 'rgba(255, 205, 86, 0.6)',
            borderColor: 'rgb(255, 205, 86)',
            borderWidth: 1,
            stack: 'Stack 0'
        }
    ];
    
    return { type: 'bar', data: { labels, datasets } };
});


const filteredStudents = computed(() => {
    if (!allStudentsData.value) return [];
    let result = allStudentsData.value;

    if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase().trim();
        result = result.filter(student => {
            const studentId = String(student.id || student.name || '');
            return studentId.toLowerCase().includes(searchTerm) ||
                   (student.group && student.group.toLowerCase().includes(searchTerm));
        });
    }

    if (statusFilter.value && analyticsLoaded.value) {
        result = result.filter(student => {
            const id = String(student.id);
            switch (statusFilter.value) {
                case 'excellent': return topStudentIds.value.has(id);
                case 'risk': return riskStudentIds.value.has(id);
                case 'good': return goodAttendanceIds.value.has(id);
                default: return true;
            }
        });
    }

    return result;
});

const totalStudents = computed(() => filteredStudents.value?.length ?? 0);

const totalPages = computed(() => {
  return Math.ceil(totalStudents.value / itemsPerPage.value) || 1;
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredStudents.value.slice(start, end) ?? [];
});

const onPageChange = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetPagination = () => {
  currentPage.value = 1;
};

watch(
  () => ({ course: filters.course, group: filters.group, subject: filters.subject, sortBy: filters.sortBy }),
  fetchStudentRating,
  { deep: true, immediate: false }
);

onMounted(() => {
  fetchStudentRating();
});
</script>

<style scoped>
.d-flex.gap-3 {
    flex-wrap: wrap;
}
.ring-active {
    box-shadow: 0 0 0 2px var(--bs-primary) !important;
}
.table-danger-subtle {
    background-color: rgba(220, 53, 69, 0.05);
}
</style>