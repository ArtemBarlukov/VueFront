<template>
  <div class="student-rating-section">
    <div v-if="isLoading" class="alert alert-info">Загрузка рейтинга студентов...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Аналитические инсайты -->
    <div v-if="analyticsLoaded && USE_MOCK_ANALYTICS" class="alert alert-warning py-2 px-3 mb-2 d-flex align-items-center small">
      <i class="material-icons small me-2">science</i>
      <span><strong>Демо-режим:</strong> статусы студентов сгенерированы случайно для демонстрации. Реальные данные появятся после подключения модуля аналитики.</span>
    </div>
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
             <input type="radio" class="btn-check" name="rs" id="sp" v-model="filters.sortBy" value="avgGrade"><label class="btn btn-outline-primary btn-sm" for="sp">Успев.</label>
             <input type="radio" class="btn-check" name="rs" id="sa" v-model="filters.sortBy" value="attendancePercent"><label class="btn btn-outline-primary btn-sm" for="sa">Посещ.</label>
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
             <thead><tr><th>ID студента</th><th>Группа</th><th>Курс</th><th>Ср.балл</th><th>Актив.</th><th>Посещ.</th><th>Риск отч.</th><th>Рейтинг</th><th v-if="analyticsLoaded">Статус</th></tr></thead>
             <tbody>
              <tr v-for="(student, index) in paginatedStudents" :key="`${student.id}-${index}`">
                <td>{{ student.id || student.name || 'N/A' }}</td>
                <td>{{ student.group }}</td>
                <td>{{ student.course }}</td>
                <td>{{ student.avgGrade?.toFixed(2) ?? 'N/A' }}</td>
                <td>{{ student.activity?.toFixed(0) ?? 'N/A' }}</td>
                <td>{{ formatRatingAttendance(student.attendancePercent) }}</td>
                <td><span :class="getDropoutRiskClass(student.dropoutRisk)">{{ formatDropoutRisk(student.dropoutRisk) }}</span></td>
                <td>{{ student.rating?.toFixed(2) ?? 'N/A' }}</td>
                <td v-if="analyticsLoaded">
                  <span v-if="getStudentStatus(student.id)" class="badge" :class="getStudentStatusClass(student.id)">{{ getStudentStatus(student.id) }}</span>
                </td>
              </tr>
              <tr v-if="!paginatedStudents.length"><td :colspan="analyticsLoaded ? 9 : 8" class="text-center text-muted">Студенты не найдены</td></tr>
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
const error = ref(null);

const filters = reactive({
  course: '', group: '', subject: '', sortBy: 'rating', limit: 5
});

const currentPage = ref(1);
const itemsPerPage = ref(25); 

const chartData = ref([]); 
const allStudentsData = ref([]); 

const USE_MOCK_ANALYTICS = true;

const analyticsData = ref(null);
const analyticsLoaded = ref(false);
const statusFilter = ref('');

const topStudentIds = ref(new Set());
const lowAttendanceIds = ref(new Set());
const goodAttendanceIds = ref(new Set());

const applyAnalyticsData = (data) => {
  analyticsData.value = data;
  analyticsLoaded.value = true;
  topStudentIds.value = new Set((data.topStudents || []).map(s => String(s.id)));
  lowAttendanceIds.value = new Set((data.lowAttendance || []).map(s => String(s.id)));
  goodAttendanceIds.value = new Set((data.goodAttendance || []).map(s => String(s.id)));
};

const generateMockAnalytics = () => {
  const students = allStudentsData.value;
  if (!students || students.length === 0) return;

  const ids = students.map(s => String(s.id));
  const shuffled = [...ids].sort(() => Math.random() - 0.5);

  const topCount = Math.max(1, Math.floor(ids.length * 0.08));
  const riskCount = Math.max(1, Math.floor(ids.length * 0.12));
  const goodCount = Math.max(1, Math.floor(ids.length * 0.20));

  let offset = 0;
  const topIds = shuffled.slice(offset, offset + topCount);
  offset += topCount;
  const riskIds = shuffled.slice(offset, offset + riskCount);
  offset += riskCount;
  const goodIds = shuffled.slice(offset, offset + goodCount);

  applyAnalyticsData({
    summary: { totalStudents: ids.length },
    topStudents: topIds.map(id => ({ id })),
    lowAttendance: riskIds.map(id => ({ id })),
    goodAttendance: goodIds.map(id => ({ id })),
  });
};

const fetchAnalytics = async () => {
  if (USE_MOCK_ANALYTICS) return;
  try {
    const data = await fetchData(`${API_BASE_URL}/clustering/`);
    if (data) applyAnalyticsData(data);
  } catch {
    analyticsLoaded.value = false;
  }
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
  if (lowAttendanceIds.value.has(id)) return 'Зона риска';
  if (goodAttendanceIds.value.has(id)) return 'Хор. посещ.';
  return '';
};

const getStudentStatusClass = (studentId) => {
  const id = String(studentId);
  if (topStudentIds.value.has(id)) return 'bg-success';
  if (lowAttendanceIds.value.has(id)) return 'bg-danger';
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

const fetchStudentRating = async () => {
    isLoading.value = true;
    error.value = null;
    const params = new URLSearchParams();
    
    if (filters.course) params.append('course', filters.course);
    if (filters.group) params.append('group', filters.group);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    params.append('limit', filters.limit);
    try {

        const chartResponse = await fetchData(`${API_BASE_URL}/student-rating/?${params.toString()}`);
        if (chartResponse) {
            chartData.value = chartResponse.chartData || [];
            studentRatingData.value = { chartData: chartData.value };
        }

        const tableParams = new URLSearchParams(params);
        tableParams.set('limit', '10000');  // Большое число, чтобы получить всех студентов
        
        const tableResponse = await fetchData(`${API_BASE_URL}/student-rating/?${tableParams.toString()}`);
        if (tableResponse) {
            allStudentsData.value = tableResponse.students || [];
            studentRatingData.value = { 
                ...studentRatingData.value,
                students: allStudentsData.value 
            };
        }

        if (USE_MOCK_ANALYTICS) generateMockAnalytics();
    } catch (err) {
        error.value = err.message || 'Не удалось загрузить данные рейтинга.';
        chartData.value = [];
        allStudentsData.value = [];
        studentRatingData.value = null;
    } finally {
        isLoading.value = false;
    }
};

const resetFilters = () => {
  filters.course = '';
  filters.group = '';
  filters.subject = '';
  filters.sortBy = 'rating';
  filters.limit = 5;
  fetchStudentRating();
};

const formatRatingAttendance = (p) => (typeof p === 'number' ? `${p.toFixed(1)}%` : 'N/A');
const formatDropoutRisk = (r) => (typeof r === 'number' ? `${(r * 100).toFixed(1)}%` : 'N/A');
const getDropoutRiskClass = (r) => { if (typeof r !== 'number') return {'badge': true, 'bg-secondary': true }; const normR = Math.max(0, Math.min(1, r)); return {'badge': true,'bg-success': normR < 0.3,'bg-warning': normR >= 0.3 && normR < 0.6,'bg-danger': normR >= 0.6 }; };

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
                case 'risk': return lowAttendanceIds.value.has(id);
                case 'good': return goodAttendanceIds.value.has(id);
                default: return true;
            }
        });
    }

    return result;
});

const totalStudents = computed(() => allStudentsData.value?.length ?? 0);

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

watch(filters, fetchStudentRating, { deep: true, immediate: false });

onMounted(() => {
  fetchStudentRating();
  fetchAnalytics();
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