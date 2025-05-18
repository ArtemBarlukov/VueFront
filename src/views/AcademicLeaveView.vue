<template>
  <div class="academic-leave-section">
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: academicSubTab === 'performance' }" @click.prevent="academicSubTab = 'performance'" href="#">
          Успеваемость
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: academicSubTab === 'returns' }" @click.prevent="academicSubTab = 'returns'" href="#">
          Даты возврата
        </a>
      </li>
    </ul>

    <!-- Контент вкладки "Успеваемость" -->
    <div v-if="academicSubTab === 'performance'">
      <div v-if="isLoadingPerformance" class="alert alert-info">Загрузка успеваемости...</div>
      <div v-if="errorPerformance" class="alert alert-danger">{{ errorPerformance }}</div>
      <div v-if="performanceData">
         <div class="row mb-4">
           <div class="col-md-6">
             <div class="card h-100">
               <div class="card-header">
                 <h6 class="mb-0 d-flex align-items-center">
                   Распределение задолженностей
                   <span class="ms-2 badge bg-light text-dark">
                     <i class="material-icons small">touch_app</i> Кликабельно
                   </span>
                 </h6>
               </div>
               <div class="card-body">
                 <ChartComponent
                   v-if="performanceData?.debtsDistribution"
                   :chartData="debtsChartData"
                   :chartOptions="chartOptions"
                   @chart-click="handlePerformanceChartClick"
                 />
                 <div v-else>Нет данных для графика.</div>
               </div>
             </div>
           </div>
           <div class="col-md-6">
             <div class="card h-100">
               <div class="card-header">
                 <h6 class="mb-0 d-flex align-items-center">
                   Среднее кол-во долгов по группам
                   <span class="ms-2 badge bg-light text-dark">
                     <i class="material-icons small">touch_app</i> Кликабельно
                   </span>
                 </h6>
               </div>
               <div class="card-body">
                  <ChartComponent
                    v-if="performanceData?.groupAverages?.length > 0"
                    :chartData="groupAverageDebtsChartData"
                    :chartOptions="chartOptions"
                    @chart-click="handleGroupDistributionClick"
                 />
                 <div v-else>Нет данных для графика.</div>
               </div>
             </div>
           </div>
         </div>
         <div class="card mb-4">
           <div class="card-header d-flex justify-content-between align-items-center">
             <div class="d-flex align-items-center">
               <h5 class="mb-0">Сводная статистика</h5>
             </div>
             <div class="d-flex gap-2 align-items-center">
               <div class="input-group input-group-sm">
                 <input type="text" class="form-control" v-model="searchInput" placeholder="Поиск по ФИО..." @input="debouncedSearch">
                 <button 
                   class="btn btn-outline-secondary" 
                   type="button" 
                   @click="clearSearch"
                   v-if="searchInput || temporaryFilter"
                 >
                   <i class="material-icons small">clear</i>
                 </button>
               </div>
               <div class="dropdown">
                 <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                   Группа ({{ filtersPerformance.group ? '1' : 'Все' }})
                 </button>
                 <ul class="dropdown-menu py-2" ref="dropdownMenuPerformanceRef">
                   <li><label class="dropdown-item m-0"><input type="radio" class="form-check-input me-2" v-model="filtersPerformance.group" value=""> Все группы</label></li>
                   <li v-for="g in filterOptions.groups" :key="g"><label class="dropdown-item m-0"><input type="radio" class="form-check-input me-2" v-model="filtersPerformance.group" :value="g">{{ g }}</label></li>
                 </ul>
               </div>
             </div>
           </div>
           <div class="card-body">
             <div class="d-flex justify-content-between align-items-center mb-3">
               <h6 class="mb-0">Найдено: {{ sortedPerformanceStudents.length }}</h6>
             </div>
             <div class="table-responsive">
               <table class="table table-bordered table-hover">
                 <thead class="table-light"><tr><th @click="sortTable('name')" style="cursor: pointer">ФИО {{ getSortIcon('name') }}</th><th @click="sortTable('group')" style="cursor: pointer">Группа {{ getSortIcon('group') }}</th><th @click="sortTable('debts')" style="cursor: pointer">Долги {{ getSortIcon('debts') }}</th></tr></thead>
                 <tbody>
                   <tr v-for="student in paginatedStudents" :key="student.id"><td>{{ student.name }}</td><td>{{ student.group }}</td><td><span :class="getDebtBadgeClass(student.debts)">{{ student.debts }}</span></td></tr>
                   <tr v-if="!paginatedStudents.length"><td colspan="3" class="text-center text-muted">Студенты не найдены</td></tr>
                 </tbody>
               </table>
             </div>
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
      </div>
      <div v-else-if="!isLoadingPerformance && !errorPerformance && !performanceData">
          Не удалось загрузить данные или данные отсутствуют.
      </div>
    </div>

    <!-- Контент вкладки "Даты возврата" -->
    <div v-if="academicSubTab === 'returns'">
        <div v-if="isLoadingReturns" class="alert alert-info">Загрузка дат возврата...</div>
        <div v-if="errorReturns" class="alert alert-danger">{{ errorReturns }}</div>
        <div v-if="returnsData">
          <!-- Добавляем диаграмму дат возврата внутрь вкладки -->
          <div class="row mb-4">
            <div class="col-md-0">
              <div class="card h-100">
                <div class="card-header">
                  <h6 class="mb-0 d-flex align-items-center">
                    Статистика по статусам
                    <span class="ms-2 badge bg-light text-dark">
                      <i class="material-icons small">touch_app</i> Кликабельно
                    </span>
                  </h6>
                </div>
                <div class="card-body">
                  <ChartComponent
                    v-if="returnsData?.statusDistribution"
                    :chartData="statusChartData"
                    :chartOptions="chartOptions"
                    @chart-click="handleStatusChartClick"
                  />
                  <div v-else>Нет данных для графика.</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Таблица со студентами -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <h5 class="mb-0">Студенты после академ. отпуска</h5>
                <div v-if="temporaryFilter && temporaryFilter.startsWith('date:')" class="badge bg-info ms-2">
                  Фильтр по дате возврата: {{ temporaryFilter.substring(5) }}
                  <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close" @click="clearChartFilter" style="font-size: 0.5rem;"></button>
                </div>
                <div v-if="temporaryFilter && temporaryFilter.startsWith('status:')" class="badge bg-info ms-2">
                  Фильтр по статусу: {{ temporaryFilter.substring(7) }}
                  <button type="button" class="btn-close btn-close-white ms-2" aria-label="Close" @click="clearChartFilter" style="font-size: 0.5rem;"></button>
                </div>
              </div>
              <div class="d-flex gap-2 align-items-center">
                <div class="input-group input-group-sm">
                  <input type="text" class="form-control" v-model="searchReturnsInput" placeholder="Поиск по ФИО..." @input="debouncedReturnsSearch">
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    @click="clearSearch"
                    v-if="searchReturnsInput || temporaryFilter"
                  >
                    <i class="material-icons small">clear</i>
                  </button>
                </div>
                <select class="form-select form-select-sm" v-model="filtersReturns.status">
                  <option value="">Все статусы</option>
                  <option v-for="status in uniqueStatuses" :key="status" :value="status">{{ status }}</option>
                </select>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-striped table-hover">
                  <thead><tr><th>ФИО</th><th>Группа</th><th>Дата возврата</th><th>Статус</th></tr></thead>
                  <tbody>
                    <tr v-for="student in paginatedReturnsStudents" :key="student.id"><td>{{ student.name }}</td><td>{{ student.group }}</td><td>{{ formatDate(student.returnDate) }}</td><td><span :class="getStatusBadgeClass(student.status)">{{ student.status }}</span></td></tr>
                    <tr v-if="!paginatedReturnsStudents.length"><td colspan="4" class="text-center text-muted">Студенты не найдены</td></tr>
                  </tbody>
                </table>
              </div>
              <per-page-selector v-model="itemsPerPage" @change="resetPagination" />
              <pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                @page-change="onPageChange"
              />
              <div class="text-center text-muted mt-2">
                Показано {{ paginatedReturnsStudents.length }} из {{ totalStudents }} записей
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!isLoadingReturns && !errorReturns && !returnsData">
            Не удалось загрузить данные или данные отсутствуют.
        </div>
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

const academicSubTab = ref('performance');

const performanceData = ref(null);
const isLoadingPerformance = ref(false);
const errorPerformance = ref(null);
const filtersPerformance = reactive({ group: '', search: '' });
const sortConfig = reactive({ key: null, direction: 'asc' });
const dropdownMenuPerformanceRef = ref(null);

const returnsData = ref(null);
const isLoadingReturns = ref(false);
const errorReturns = ref(null);
const filtersReturns = reactive({ status: '', search: '' });

const searchInput = ref('');
let searchTimeout = null;

const temporaryFilter = ref(null);

const statusColors = {
  'Отчислен': { bg: 'rgba(220, 53, 69, 0.7)', border: 'rgb(220, 53, 69)' },
  'Продолжает обучение': { bg: 'rgba(13, 110, 253, 0.7)', border: 'rgb(13, 110, 253)' },
  'Возвращён': { bg: 'rgba(25, 135, 84, 0.7)', border: 'rgb(25, 135, 84)' }
};

Object.keys(statusColors).forEach(key => {
  statusColors[key].cssClass = key === 'Отчислен' ? 'bg-danger' : 
                              key === 'Продолжает обучение' ? 'bg-primary' : 
                              key === 'Возвращён' ? 'bg-success' : 'bg-secondary';
});

const fetchAcademicPerformance = async () => {
    if (!fetchData) return;
    isLoadingPerformance.value = true;
    errorPerformance.value = null;
    const params = new URLSearchParams();
    if (filtersPerformance.group) params.append('group', filtersPerformance.group);
    if (filtersPerformance.search) params.append('search', filtersPerformance.search);
    try {
        const data = await fetchData(`${API_BASE_URL}/academic/performance/?${params.toString()}`);
         if (data !== null) performanceData.value = data;
    } catch (err) {
        errorPerformance.value = err.message || 'Не удалось загрузить данные успеваемости.';
        performanceData.value = null;
    } finally {
        isLoadingPerformance.value = false;
    }
};

const sortTable = (key) => {
  if (sortConfig.key === key) {
    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
  } else {
    sortConfig.key = key;
    sortConfig.direction = 'asc';
  }
};
const getSortIcon = (key) => (sortConfig.key !== key) ? '↕' : (sortConfig.direction === 'asc' ? '↑' : '↓');
const debtColors = { 0: 'bg-success', 1: 'bg-warning', 2: 'bg-warning' };
const getDebtBadgeClass = (debts) => `badge ${debtColors[debts] ?? 'bg-danger'}`;

const fetchAcademicReturns = async () => {
     if (!fetchData) return;
     isLoadingReturns.value = true;
     errorReturns.value = null;
     try {
         const data = await fetchData(`${API_BASE_URL}/academic/returns/`);
         if (data !== null) returnsData.value = data;
     } catch (err) {
         errorReturns.value = err.message || 'Не удалось загрузить данные о возвратах.';
         returnsData.value = null;
     } finally {
         isLoadingReturns.value = false;
     }
};
const formatDate = (dateStr) => { try { return new Date(dateStr).toLocaleDateString('ru-RU'); } catch { return dateStr || 'N/A'; } };
const getStatusBadgeClass = (status) => {
  const colorKey = status in statusColors ? status : null;
  return `badge ${colorKey ? statusColors[colorKey].cssClass || 'bg-secondary' : 'bg-secondary'}`;
};
const hexToRgb = (hex) => { try { let r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '108,117,125'; } catch { return '108,117,125'; } };

const emptyChartData = (type = 'bar') => ({ type, data: { labels: [], datasets: [] } });

const debtsChartData = computed(() => {
    const dist = performanceData.value?.debtsDistribution;
    if (!dist) return emptyChartData('pie');
    const labels = ['Нет долгов', '1 долг', '2 долга', '3+ долга'];
    const data = [dist['0'] ?? 0, dist['1'] ?? 0, dist['2'] ?? 0, dist['3plus'] ?? 0];
    const filteredLabels = labels.filter((_, i) => data[i] > 0);
    const filteredData = data.filter(d => d > 0);
    const bgColors = ['rgba(75, 192, 192, 0.6)', 'rgba(255, 205, 86, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 99, 132, 0.6)'].filter((_, i) => data[i] > 0);
    const borderColors = ['rgb(75, 192, 192)', 'rgb(255, 205, 86)', 'rgb(255, 159, 64)', 'rgb(255, 99, 132)'].filter((_, i) => data[i] > 0);
    return { type: 'pie', data: { labels: filteredLabels, datasets: [{ data: filteredData, backgroundColor: bgColors, borderColor: borderColors, borderWidth: 1 }] } };
});

const groupAverageDebtsChartData = computed(() => {
    const averages = performanceData.value?.groupAverages;
    if (!averages || !averages.length) return emptyChartData('bar');
    return { type: 'bar', data: { labels: averages.map(g => g.group), datasets: [{ label: 'Среднее кол-во долгов', data: averages.map(g => g.avgDebts?.toFixed(1) ?? 0), backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgb(54, 162, 235)', borderWidth: 1 }] } };
});

const sortedPerformanceStudents = computed(() => {
     const students = [...(performanceData.value?.students ?? [])];
     if (sortConfig.key) {
         students.sort((a, b) => {
             let aValue = a[sortConfig.key]; let bValue = b[sortConfig.key];
             if (sortConfig.key === 'debts') { aValue = Number(aValue); bValue = Number(bValue); }
             else { aValue = String(aValue).toLowerCase(); bValue = String(bValue).toLowerCase(); }
             if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
             if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
             return 0;
         });
     }
     return students;
 });

const statusChartData = computed(() => {
  const dist = returnsData.value?.statusDistribution;
  if (!dist) return emptyChartData('pie');
  
  const labels = Object.keys(dist);
  const data = Object.values(dist);
  
  const filteredLabels = labels.filter((_, i) => data[i] > 0);
  const filteredData = data.filter(d => d > 0);
  
  const backgroundColors = filteredLabels.map(label => {
    if (label in statusColors) {
      return statusColors[label].bg;
    } else {
      const hue = Math.floor(Math.random() * 360);
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    }
  });
  
  const borderColors = filteredLabels.map(label => {
    if (label in statusColors) {
      return statusColors[label].border;
    } else {
      const hue = Math.floor(Math.random() * 360);
      return `hsl(${hue}, 70%, 50%)`;
    }
  });
  
  return {
    type: 'pie',
    data: {
      labels: filteredLabels,
      datasets: [{
        data: filteredData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    }
  };
});
const uniqueStatuses = computed(() => [...new Set(returnsData.value?.students?.map(s => s.status) ?? [])].sort());
const filteredReturnsStudents = computed(() => {
    let students = returnsData.value?.students ?? [];
    
    if (filtersReturns.search && filtersReturns.search.trim() !== '') {
        const searchTerm = filtersReturns.search.toLowerCase().trim();
        students = students.filter(student => {
            if (!student) return false;
            return (student.name && student.name.toLowerCase().includes(searchTerm)) ||
                   (student.group && student.group.toLowerCase().includes(searchTerm));
        });
    }
    
    if (filtersReturns.status) {
        students = students.filter(s => s.status === filtersReturns.status);
    }
    
    if (temporaryFilter.value && temporaryFilter.value.startsWith('date:')) {
        const selectedDate = temporaryFilter.value.substring(5); 
        students = students.filter(student => {
            if (!student.returnDate) return false;
            
            try {
                const returnDate = new Date(student.returnDate);
                const returnDateStr = returnDate.toLocaleDateString('ru-RU', { 
                    year: 'numeric', 
                    month: 'long' 
                });
                
                return returnDateStr.includes(selectedDate);
            } catch {
                return false;
            }
        });
    } else if (temporaryFilter.value && temporaryFilter.value.startsWith('status:')) {
        const selectedStatus = temporaryFilter.value.substring(7); 
        students = students.filter(student => student.status === selectedStatus);
    }
    
    return students;
});

watch(academicSubTab, (newTab) => {
  if (newTab === 'performance' && !performanceData.value) {
    fetchAcademicPerformance();
  } else if (newTab === 'returns' && !returnsData.value) {
    fetchAcademicReturns();
  }
});

let debounceTimer = null;
const debounceFetch = (fetchFunction, delay = 500) => { 
  clearTimeout(debounceTimer); 
  debounceTimer = setTimeout(() => fetchFunction(), delay); 
};

watch(filtersPerformance, () => debounceFetch(fetchAcademicPerformance), { deep: true });

onMounted(() => {
  console.log('AcademicLeaveView mounted');
  if (academicSubTab.value === 'performance') {
    fetchAcademicPerformance();
  } else {
    fetchAcademicReturns();
  }
    nextTick(() => {
      if (dropdownMenuPerformanceRef.value) {
          const dropdownElementList = document.querySelectorAll('.dropdown-toggle');
          [...dropdownElementList].map(el => new Dropdown(el));
      }
    });
});

const currentPage = ref(1);
const itemsPerPage = ref(25);

const allStudents = computed(() => {
  return academicSubTab.value === 'performance' 
    ? (sortedPerformanceStudents.value || []) 
    : (filteredReturnsStudents.value || []);
});

const totalStudents = computed(() => allStudents.value?.length || 0);

const totalPages = computed(() => {
  return Math.ceil(totalStudents.value / itemsPerPage.value) || 1;
});

const paginatedStudents = computed(() => {
  if (!sortedPerformanceStudents.value) return [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedPerformanceStudents.value.slice(start, end);
});

const paginatedReturnsStudents = computed(() => {
  if (!filteredReturnsStudents.value) return [];
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredReturnsStudents.value.slice(start, end);
});

const onPageChange = (page) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetPagination = () => {
  currentPage.value = 1;
};

watch([], resetPagination);

watch(academicSubTab, () => {
  resetPagination();
});

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    filtersPerformance.search = searchInput.value;
    currentPage.value = 1;
  }, 1000); 
};

const clearSearch = () => {
  if (academicSubTab.value === 'performance') {
    searchInput.value = '';
    filtersPerformance.search = '';
  } else {
    searchReturnsInput.value = '';
    filtersReturns.search = '';
  }
  
  temporaryFilter.value = null;
  currentPage.value = 1;
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
};

const clearChartFilter = () => {
  temporaryFilter.value = null;
  
  if (temporaryFilter.value && temporaryFilter.value.startsWith('status:')) {
    filtersReturns.status = '';
  }
  
  currentPage.value = 1;
};

const scrollToTable = () => {
  setTimeout(() => {
    const tableElement = document.querySelector('.table-striped');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
};

const handlePerformanceChartClick = (data) => {
  console.log('Клик по диаграмме успеваемости:', data);
  
  if (!data || !data.label) {
    console.error('Ошибка: данные о клике неполные', data);
    return;
  }
  
  const label = data.label;
  
  let filter;
  
  if (label.includes('Нет долгов') || label.includes('0 долг')) {
    filter = 'no_debts';
  } else if (label.includes('1 долг')) {
    filter = 'one_debt';
  } else if (label.includes('2 долга')) {
    filter = 'two_debts';
  } else if (label.includes('3+ долга')) {
    filter = 'many_debts';
  }
  
  if (filter) {
    searchInput.value = '';
    filtersPerformance.search = '';
    
    temporaryFilter.value = filter;
    
    sortConfig.key = 'debts';
    sortConfig.direction = filter === 'no_debts' ? 'asc' : 'desc';
    
    currentPage.value = 1;
    
    scrollToTable();
  }
};

const handleGroupDistributionClick = (data) => {
  console.log('Клик по диаграмме распределения по группам:', data);
  
  if (!data || !data.label) {
    console.error('Ошибка: данные о клике неполные', data);
    return;
  }
  
  const selectedGroup = data.label;
  
  if (selectedGroup) {
    searchInput.value = '';
    filtersPerformance.search = '';
    
    temporaryFilter.value = `group:${selectedGroup}`;
    
    filtersPerformance.group = selectedGroup;
    
    sortConfig.key = 'group';
    sortConfig.direction = 'asc';
    
    currentPage.value = 1;
    
    scrollToTable();
  }
};

const handleReturnDatesClick = (data) => {
  console.log('Клик по диаграмме дат возврата:', data);
  
  if (!data || !data.label) {
    console.error('Ошибка: данные о клике неполные', data);
    return;
  }
  
  const selectedDate = data.label;
  
  if (selectedDate) {
    if (academicSubTab.value !== 'returns') {
      academicSubTab.value = 'returns';
    }
    
    filtersReturns.status = '';
    
    temporaryFilter.value = `date:${selectedDate}`;
    
    currentPage.value = 1;
    
    scrollToTable();
  }
};

const handleStatusChartClick = (data) => {
  console.log('Клик по диаграмме статусов:', data);
  
  if (!data || !data.label) {
    console.error('Ошибка: данные о клике неполные', data);
    return;
  }
  
  const selectedStatus = data.label;
  
  if (selectedStatus) {
    if (academicSubTab.value !== 'returns') {
      academicSubTab.value = 'returns';
    }
    
    filtersReturns.status = selectedStatus;
    
    temporaryFilter.value = `status:${selectedStatus}`;
    
    currentPage.value = 1;
    
    scrollToTable();
  }
};

const searchReturnsInput = ref('');

const debouncedReturnsSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    filtersReturns.search = searchReturnsInput.value;
    currentPage.value = 1;
  }, 1000);
};
</script>

<style scoped>
</style>