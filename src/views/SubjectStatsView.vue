<template>
  <div class="subject-stats-section">
    <div v-if="isLoading" class="alert alert-info">Загрузка статистики по предмету...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="subjectStatsData" class="card">
       <div class="card-header">
         <h5 class="text-center mb-3">
           Сводная статистика
           {{ filters.subject ? `по предмету "${filters.subject}"` : '' }}
           {{ filters.semester ? `за ${getSemesterName(filters.semester)} семестр` : '' }}
           {{ filters.course ? `${filters.course} курса` : '' }}
         </h5>
         <div class="d-flex justify-content-center gap-3 mb-3 flex-wrap">
           <select class="form-select w-auto" v-model="filters.course"><option value="">Все курсы</option><option v-for="c in filterOptions.courses" :key="c" :value="c">{{c}} курс</option></select>
           <select class="form-select w-auto" v-model="filters.semester"><option value="">Все семестры</option><option v-for="s in filterOptions.semesters" :key="s.value" :value="s.value">{{s.name}}</option></select>
           <select class="form-select w-auto" v-model="filters.subject"><option value="">Все предметы</option><option v-for="sub in filterOptions.subjects" :key="sub" :value="sub">{{sub}}</option></select>
           <button class="btn btn-outline-secondary" @click="resetFilters">Сбросить</button>
         </div>
       </div>
       <div class="card-body">
         <div class="row">
           <div class="col-md-3">
             <div class="dropdown">
               <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                 Группы ({{ filters.groups.length }})
               </button>
               <ul class="dropdown-menu w-100" ref="dropdownMenuSubjectRef">
                <li class="px-3 pb-2 border-bottom"><div class="d-flex justify-content-between align-items-center"><small class="text-muted">Выбрано: {{ filters.groups.length }}</small><div class="d-flex gap-2"><button class="btn btn-link btn-sm p-0" @click="selectAllGroups" v-if="filters.groups.length !== filterOptions.groups.length">Выбрать все</button><button v-if="filters.groups.length" class="btn btn-link btn-sm p-0" @click="filters.groups = []">Очистить</button></div></div></li>
                <li v-for="group in filterOptions.groups" :key="group"><label class="dropdown-item d-flex align-items-center gap-2 m-0"><input type="checkbox" class="form-check-input" v-model="filters.groups" :value="group">{{ group }}</label></li>
                <li v-if="!filterOptions.groups.length" class="dropdown-item disabled">Нет групп</li>
               </ul>
             </div>
           </div>
           <div class="col-md-9">
             <div class="row mb-4">
               <div class="col-md-6"><div class="card"><div class="card-body text-center"><h6 class="text-muted mb-2">Средний балл</h6><h2 class="text-warning mb-0">{{ subjectStatsData.subjectStats?.avgGrade?.toFixed(2) ?? 'N/A' }}</h2></div></div></div>
               <div class="col-md-6"><div class="card"><div class="card-body text-center"><h6 class="text-muted mb-2">Максимальный балл</h6><h2 class="text-success mb-0">{{ subjectStatsData.subjectStats?.maxGrade ?? 'N/A' }}</h2></div></div></div>
             </div>
             <div class="row mb-4">
               <div class="col-md-6">
                 <div class="card h-100">
                   <div class="card-body">
                      <h6 class="card-title text-center">Распределение оценок</h6>
                     <ChartComponent
                       v-if="subjectStatsData?.gradeDistributionBar"
                       :chartData="gradeDistributionBarData"
                       :chartOptions="chartOptions"
                     />
                     <div v-else>Нет данных для графика.</div>
                   </div>
                 </div>
               </div>
               <div class="col-md-6">
                 <div class="card h-100">
                   <div class="card-header d-flex justify-content-between align-items-center">
                     <h6 class="mb-0">Лучшие предметы</h6>
                     <div class="d-flex gap-2 align-items-center">
                       <select class="form-select form-select-sm" v-model="filters.sortBy"><option value="avg">По ср. баллу</option><option value="max">По макс. баллу</option><option value="count">По кол-ву</option></select>
                       <select class="form-select form-select-sm" v-model="filters.limit"><option value="3">Топ 3</option><option value="5">Топ 5</option><option value="10">Топ 10</option><option value="">Все</option></select>
                     </div>
                   </div>
                   <div class="card-body">
                     <ChartComponent
                       v-if="subjectStatsData?.bestSubjects?.length"
                       :chartData="bestSubjectsChartData"
                       :chartOptions="chartOptions"
                     />
                     <div v-else>Нет данных для отображения.</div>
                   </div>
                 </div>
               </div>
             </div>
             <div class="table-responsive">
               <table class="table table-striped table-hover">
                 <thead class="table-light"><tr><th>Показатель</th><th>Значение</th></tr></thead>
                 <tbody>
                   <tr><td>Мин балл</td><td>{{ subjectStatsData.subjectStats?.minGrade ?? 'N/A' }}</td></tr>
                   <tr><td>Сред балл</td><td>{{ subjectStatsData.subjectStats?.avgGrade?.toFixed(2) ?? 'N/A' }}</td></tr>
                   <tr><td>Макс балл</td><td>{{ subjectStatsData.subjectStats?.maxGrade ?? 'N/A' }}</td></tr>
                 </tbody>
               </table>
             </div>
           </div>
         </div>
       </div>
     </div>
      <div v-else-if="!isLoading && !error && !subjectStatsData">
          Не удалось загрузить данные или данные отсутствуют.
      </div>

    
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, inject, nextTick } from 'vue';
import ChartComponent from '@/components/ChartComponent.vue';
import { Dropdown } from 'bootstrap';
import Pagination from '@/components/Pagination.vue';
import PerPageSelector from '@/components/PerPageSelector.vue';

const props = defineProps({
  filterOptions: { type: Object, required: true },
  chartOptions: { type: Object, required: true }
});

const fetchData = inject('fetchData');
const API_BASE_URL = inject('API_BASE_URL');

const subjectStatsData = ref(null);
const isLoading = ref(false);
const error = ref(null);
const dropdownMenuSubjectRef = ref(null);

const filters = reactive({
  course: '', semester: '', subject: '', groups: [], sortBy: 'avg', limit: '5'
});

const fetchSubjectStats = async () => {
    if (!fetchData) return;
    isLoading.value = true;
    error.value = null;
    const params = new URLSearchParams();
    if (filters.course) params.append('course', filters.course);
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.groups.length) params.append('groups', filters.groups.join(','));
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.limit) params.append('limit', filters.limit); 
    else params.append('limit', '1000');

    try {
        const data = await fetchData(`${API_BASE_URL}/statistics/subject/?${params.toString()}`);
        if (data !== null) subjectStatsData.value = data;
    } catch (err) {
        error.value = err.message || 'Не удалось загрузить статистику по предмету.';
        subjectStatsData.value = null;
    } finally {
        isLoading.value = false;
    }
};

const resetFilters = () => {
  filters.course = '';
  filters.semester = '';
  filters.subject = '';
  filters.groups = [];
  filters.sortBy = 'avg';
  filters.limit = '5';
  fetchSubjectStats();
};

const selectAllGroups = () => {
  filters.groups = [...props.filterOptions.groups];
};

const getSemesterName = (value) => props.filterOptions.semesters.find(s => String(s.value) === String(value))?.name || '';

const emptyChartData = (type = 'bar') => ({ type, data: { labels: [], datasets: [] } });

const gradeDistributionBarData = computed(() => {
    const dist = subjectStatsData.value?.gradeDistributionBar;
    if (!dist) return emptyChartData('bar');
    return { type: 'bar', data: { labels: ['2', '3', '4', '5'], datasets: [{ label: 'Кол-во оценок', data: [dist['2'] ?? 0, dist['3'] ?? 0, dist['4'] ?? 0, dist['5'] ?? 0], backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 205, 86, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'], borderColor: ['rgb(255, 99, 132)', 'rgb(255, 205, 86)', 'rgb(54, 162, 235)', 'rgb(75, 192, 192)'], borderWidth: 1 }] }, options: { plugins: { title: { display: true, text: 'Распределение оценок' } }, scales: { y: { title: { display: true, text: 'Кол-во оценок' } }, x: { title: { display: true, text: 'Оценка' } } } } };
});

const bestSubjectsChartData = computed(() => {
  if (!subjectStatsData.value?.bestSubjects) return emptyChartData('bar');
  
  const bestSubjects = subjectStatsData.value.bestSubjects;
  
  let dataField, chartTitle, colorScheme;
  
  switch (filters.sortBy) {
    case 'avg_grade':
      dataField = 'avg';
      chartTitle = 'Средний балл';
      colorScheme = {
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)'
      };
      break;
    case 'max_grade':
      dataField = 'max';
      chartTitle = 'Максимальный балл';
      colorScheme = {
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)'
      };
      break;
    case 'count':
      dataField = 'count';
      chartTitle = 'Количество оценок';
      colorScheme = {
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgb(255, 159, 64)'
      };
      break;
    case 'attendance':
      dataField = 'avgAttendance';
      chartTitle = 'Средняя посещаемость';
      colorScheme = {
        backgroundColor: 'rgba(255, 205, 86, 0.6)',
        borderColor: 'rgb(255, 205, 86)'
      };
      break;
    case 'activity':
      dataField = 'avgActivity';
      chartTitle = 'Средняя активность';
      colorScheme = {
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgb(153, 102, 255)'
      };
      break;
    default:
      dataField = 'avg';
      chartTitle = 'Средний балл';
      colorScheme = {
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)'
      };
  }
  
  const labels = bestSubjects.map(s => s.subject);
  const data = bestSubjects.map(s => {
    return s[dataField] !== null && s[dataField] !== undefined ? s[dataField] : 0;
  });
  
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: chartTitle,
        data,
        backgroundColor: colorScheme.backgroundColor,
        borderColor: colorScheme.borderColor,
        borderWidth: 1
      }]
    }
  };
});

const getSortByLabel = (sortBy) => {
  switch (sortBy) {
    case 'avg_grade': return 'по среднему баллу';
    case 'max_grade': return 'по максимальному баллу';
    case 'count': return 'по количеству оценок';
    case 'attendance': return 'по посещаемости';
    case 'activity': return 'по активности';
    default: return 'по среднему баллу';
  }
};

watch(filters, fetchSubjectStats, { deep: true, immediate: false });

onMounted(() => {
  console.log('SubjectStatsView mounted');
  fetchSubjectStats();
  nextTick(() => {
      if (dropdownMenuSubjectRef.value) {
           const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
           [...dropdownElementList].map(el => new Dropdown(el));
      }
  });
});

const currentPage = ref(1);
const itemsPerPage = ref(25);
const allStudents = computed(() => {
  return subjectStatsData.value?.students || [];
});

const totalStudents = computed(() => allStudents.value.length);

const totalPages = computed(() => {
  return Math.ceil(totalStudents.value / itemsPerPage.value) || 1;
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return allStudents.value.slice(start, end);
});

const onPageChange = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetPagination = () => {
  currentPage.value = 1;
};

watch([], resetPagination);
</script>

<style scoped>
.d-flex.gap-3 {
    flex-wrap: wrap;
}
</style>