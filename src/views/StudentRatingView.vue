<template>
  <div class="student-rating-section">
    <div v-if="isLoading" class="alert alert-info">Загрузка рейтинга студентов...</div>
    <div v-if="error" class="alert alert-danger">{{ error }}</div>
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
             <thead><tr><th>ID студента</th><th>Группа</th><th>Курс</th><th>Ср.балл</th><th>Актив.</th><th>Посещ.</th><th>Риск отч.</th><th>Рейтинг</th></tr></thead>
             <tbody>
               <tr v-for="student in paginatedStudents" :key="student.id + '-' + Math.random()"><td>{{ student.id || student.name || 'N/A' }}</td><td>{{ student.group }}</td><td>{{ student.course }}</td><td>{{ student.avgGrade?.toFixed(2) ?? 'N/A' }}</td><td>{{ student.activity?.toFixed(0) ?? 'N/A' }}</td><td>{{ formatRatingAttendance(student.attendancePercent) }}</td><td><span :class="getDropoutRiskClass(student.dropoutRisk)">{{ formatDropoutRisk(student.dropoutRisk) }}</span></td><td>{{ student.rating?.toFixed(2) ?? 'N/A' }}</td></tr>
               <tr v-if="!studentRatingData.students?.length"><td colspan="8" class="text-center text-muted">Студенты не найдены</td></tr>
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
  course: '', group: '', subject: '', sortBy: 'rating', limit: '5'
});


const currentPage = ref(1);
const itemsPerPage = ref(25); 


const chartData = ref([]); 
const allStudentsData = ref([]); 


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
  filters.limit = '5';
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
    
    if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.toLowerCase().trim();
        return allStudentsData.value.filter(student => {
            const studentId = String(student.id || student.name || '');
            return studentId.toLowerCase().includes(searchTerm) ||
                   (student.group && student.group.toLowerCase().includes(searchTerm));
        });
    }
    
    return allStudentsData.value;
});

const totalStudents = computed(() => allStudentsData.value?.length ?? 0);

const totalPages = computed(() => {
  return Math.ceil(totalStudents.value / itemsPerPage.value);
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

watch(filters, fetchStudentRating, { deep: true, immediate: false });

onMounted(() => {
  console.log('StudentRatingView mounted');
  fetchStudentRating();
});
</script>

<style scoped>
.d-flex.gap-3 {
    flex-wrap: wrap;
}
</style>