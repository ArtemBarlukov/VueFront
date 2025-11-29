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
            } else {
                allStudentsData.value = [];
                console.warn("Получены некорректные данные студентов:", data.students);
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
const sortIcon = computed(() => {
  return sortDirection.value === 'asc' 
    ? 'material-icons small text-muted ms-1'
    : 'material-icons small text-muted ms-1';
});

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
  console.log('Клик по диаграмме распределения оценок:', data);
  
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
    
    console.log(`Установлен фильтр по оценке: ${gradeFilter}`);
    console.log(`Количество записей до фильтрации: ${allStudentsData.value.length}`);
    
    const matchingRecords = allStudentsData.value.filter(student => 
      String(student.grade).toLowerCase() === gradeFilter.toLowerCase()
    );
    console.log(`Найдено записей с оценкой ${gradeFilter}: ${matchingRecords.length}`);
    
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

onMounted(() => {
  console.log('StatisticsView mounted');
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
  
  console.log(`Обработано записей: ${expandedRecords.length}`);
  const gradeStats = {};
  expandedRecords.forEach(record => {
    const grade = String(record.grade).toLowerCase();
    gradeStats[grade] = (gradeStats[grade] || 0) + 1;
  });
  console.log('Статистика по оценкам:', gradeStats);
  
  return expandedRecords;
};
</script>

<style scoped>
.d-flex.gap-2 {
    flex-wrap: wrap;
}
</style>