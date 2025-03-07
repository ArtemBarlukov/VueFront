<template>
  <div>
    <!-- Header в стиле ИРНИТУ -->
    <header class="q-header fixed-top bg-white text-black">
      <div class="toolbar row no-wrap items-center">
        <div class="toolbar-left">
          <a class="btn-logo" href="#">
            <div class="avatar">
              <img src="@/assets/istu_logo.png" alt="ИРНИТУ">
            </div>
            <h5 class="m-2">Инструменты для обработки открытых данных студентов</h5>
          </a>
          <a class="nav-tab" 
             :class="{ active: activeTab === 'statistics' }"
             @click="activeTab = 'statistics'"
             href="#">
            <i class="material-icons">analytics</i>
            Статистика оценок
          </a>
          <a class="nav-tab"
             :class="{ active: activeTab === 'academic' }"
             @click="activeTab = 'academic'"
             href="#">
            <i class="material-icons">school</i>
            Академический отпуск
          </a>
    </div>


      </div>
    </header>

    <!-- Main Content -->
    <div class="container mt-5 pt-3">
      <!-- Статистика оценок -->
      <div v-if="activeTab === 'statistics'" class="statistics-section">
        <div class="row mb-4">
          <div class="col">
            <div class="card">
              <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">Статистика успеваемости</h5>
                  <div class="d-flex gap-2">
                    <select class="form-select form-select-sm" v-model="selectedSemester">
                      <option v-for="sem in semesterOptions" :key="sem.value" :value="sem.value">
                        {{ sem.name }}
                      </option>
                    </select>
                    <select class="form-select form-select-sm" v-model="selectedSubject">
                      <option v-for="subj in subjectOptions" :key="subj.value" :value="subj.value">
                        {{ subj.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-body">
                        <h6 class="card-title">Статистика баллов</h6>
                        <ChartComponent :chartData="averageGradeData" :chartOptions="chartOptions"/>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-body">
                        <h6 class="card-title">Распределение оценок</h6>
                        <ChartComponent :chartData="gradeDistributionData" :chartOptions="chartOptions"/>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Добавляем таблицу статистики -->
                <div class="row mt-4">
                  <div class="col">
                    <div class="table-responsive">
                      <table class="table table-bordered table-hover">
                        <thead class="table-light">
                          <tr>
                            <th>Показатель</th>
                            <th>Значение</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Всего студентов</td>
                            <td>{{ filteredMarks.length }}</td>
                          </tr>
                          <tr>
                            <td>Средний балл</td>
                            <td>{{ calculateAverage(filteredMarks) }}</td>
                          </tr>
                          <tr>
                            <td>Отличников (5)</td>
                            <td>{{ countGrades(filteredMarks, 5) }} ({{ calculatePercentage(filteredMarks, 5) }}%)</td>
                          </tr>
                          <tr>
                            <td>Хорошистов (4)</td>
                            <td>{{ countGrades(filteredMarks, 4) }} ({{ calculatePercentage(filteredMarks, 4) }}%)</td>
                          </tr>
                          <tr>
                            <td>Удовлетворительно (3)</td>
                            <td>{{ countGrades(filteredMarks, 3) }} ({{ calculatePercentage(filteredMarks, 3) }}%)</td>
                          </tr>
                          <tr>
                            <td>Неудовлетворительно (2)</td>
                            <td>{{ countGrades(filteredMarks, 2) }} ({{ calculatePercentage(filteredMarks, 2) }}%)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <!-- Добавляем таблицу со списком студентов -->
                <div class="row mt-4">
                  <div class="col">
                    <div class="card">
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">Список студентов</h6>
                        <input 
                          type="text" 
                          class="form-control form-control-sm w-auto" 
                          v-model="studentSearch" 
                          placeholder="Поиск по ФИО..."
                        >
                      </div>
                      <div class="card-body">
                        <div class="table-responsive">
                          <table class="table table-striped table-hover">
                            <thead>
                              <tr>
                                <th>ФИО</th>
                                <th>Оценка</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="student in filteredStudentsList" :key="student.id">
                                <td>{{ student.name }}</td>
                                <td>
                                  <span :class="getGradeBadgeClass(student.grade)">
                                    {{ student.grade }}
                                  </span>
                                </td>
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

      <!-- Академический отпуск -->
      <div v-if="activeTab === 'academic'" class="academic-leave-section">
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Статистика по статусам студентов</h5>
          </div>
          <div class="card-body">
            <ChartComponent :chartData="academicStatusChartData" :chartOptions="chartOptions"/>
          </div>
    </div>

        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">Студенты после академического отпуска</h5>
            <div class="d-flex gap-2">
              <select class="form-select form-select-sm" v-model="selectedStatus">
                <option value="">Все статусы</option>
                <option v-for="status in uniqueStatuses" :key="status" :value="status">
                  {{ status }}
                </option>
    </select>
  </div>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover">
      <thead>
        <tr>
                    <th>ФИО</th>
                    <th>Группа</th>
                    <th>Дата возвращения</th>
                    <th>Статус</th>
        </tr>
      </thead>
      <tbody>
                  <tr v-for="student in filteredStudents" :key="student.id">
                    <td>{{ student.name }}</td>
                    <td>{{ student.group }}</td>
                    <td>{{ formatDate(student.returnDate) }}</td>
                    <td>
                      <span :class="getStatusBadgeClass(student.status)">
                        {{ student.status }}
                      </span>
                    </td>
        </tr>
      </tbody>
    </table>
            </div>
          </div>
  </div>
  </div>
  </div>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import ChartComponent from "./comp/ChartComponent.vue"
import Papa from 'papaparse'

export default {
  name: 'App',
  components: {
    ChartComponent
  },
  data() {
    return {
      activeTab: 'statistics',
      selectedSemester: '1',
      selectedSubject: '',
      marksData: [],
      returnedStudentsData: [],
      semesterOptions: [
        { value: '1', name: '1 семестр' },
        { value: '2', name: '2 семестр' },
        { value: '3', name: '3 семестр' },
        { value: '4', name: '4 семестр' }
      ],
      subjectOptions: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0
            }
          }
        },
        animation: false
      },
      selectedStatus: '',
      statusColors: {
        'Отчислен': 'bg-danger',
        'Продолжает обучение': 'bg-primary',
        'Возвращён': 'bg-success'
      },
      studentSearch: '',
      gradeColors: {
        5: 'bg-success',
        4: 'bg-primary',
        3: 'bg-warning',
        2: 'bg-danger'
      }
    }
  },
  computed: {
    academicLeaveStudents() {
      if (!this.returnedStudentsData.length) return []
      
      return this.returnedStudentsData.map(student => ({
        id: student.id,
        name: student['ФИО'],
        group: student['Группа'],
        returnDate: student['Дата возвращения'],
        status: student['Статус']
      }))
    },
    
    filteredMarks() {
      if (!this.marksData.length || !this.selectedSemester || !this.selectedSubject) return []
      
      return this.marksData.filter(mark => 
        mark['Семестр']?.toString() === this.selectedSemester.toString() &&
        mark['Предмет'] === this.selectedSubject
      )
    },
    
    averageGradeData() {
      const marks = this.filteredMarks.map(m => Number(m['Оценка'] || 0))
      const min = marks.length ? Math.min(...marks) : 0
      const avg = marks.length ? marks.reduce((a, b) => a + b, 0) / marks.length : 0
      const max = marks.length ? Math.max(...marks) : 0

      return {
        type: 'bar',
        data: {
          labels: ['Минимальный балл', 'Средний балл', 'Максимальный балл'],
          datasets: [{
            label: 'Баллы',
            data: [min, Number(avg.toFixed(2)), max],
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)', // красный для минимального
              'rgba(255, 205, 86, 0.6)', // желтый для среднего
              'rgba(75, 192, 192, 0.6)'  // зеленый для максимального
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)'
            ],
            borderWidth: 1,
            barPercentage: 0.5
          }]
        }
      }
    },
    
    gradeDistributionData() {
      const distribution = {
        'Отлично (5)': 0,
        'Хорошо (4)': 0,
        'Удовлетворительно (3)': 0,
        'Неудовлетворительно (2)': 0
      }

      this.filteredMarks.forEach(mark => {
        const grade = Number(mark['Оценка'] || 0)
        if (grade === 5) distribution['Отлично (5)']++
        else if (grade === 4) distribution['Хорошо (4)']++
        else if (grade === 3) distribution['Удовлетворительно (3)']++
        else distribution['Неудовлетворительно (2)']++
      })

      return {
        type: 'pie',
        data: {
          labels: Object.keys(distribution),
          datasets: [{
            data: Object.values(distribution),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',  // зеленый для отлично
              'rgba(54, 162, 235, 0.6)',  // синий для хорошо
              'rgba(255, 205, 86, 0.6)',  // желтый для удовл
              'rgba(255, 99, 132, 0.6)'   // красный для неуд
            ],
            borderColor: [
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(255, 99, 132)'
            ],
            borderWidth: 1
          }]
        }
      }
    },

    filteredStudents() {
      if (!this.selectedStatus) return this.academicLeaveStudents
      
      return this.academicLeaveStudents.filter(student => 
        student.status === this.selectedStatus
      )
    },

    uniqueStatuses() {
      return [...new Set(this.academicLeaveStudents.map(student => student.status))]
    },

    academicStatusChartData() {
      const statusCount = this.academicLeaveStudents.reduce((acc, student) => {
        acc[student.status] = (acc[student.status] || 0) + 1
        return acc
      }, {})

      const colors = {
        'Отчислен': 'rgba(255, 99, 132, 0.6)', 
        'Продолжает обучение': 'rgba(54, 162, 235, 0.6)',
        'Возвращён': 'rgba(75, 192, 192, 0.6)'
      }

      const borderColors = {
        'Отчислен': 'rgb(255, 99, 132)',
        'Продолжает обучение': 'rgb(54, 162, 235)',
        'Возвращён': 'rgb(75, 192, 192)'
      }

      return {
        type: 'pie',
        data: {
          labels: Object.keys(statusCount),
          datasets: [{
            data: Object.values(statusCount),
            backgroundColor: Object.keys(statusCount).map(status => colors[status]),
            borderColor: Object.keys(statusCount).map(status => borderColors[status]),
            borderWidth: 1
          }]
        }
      }
    },

    filteredStudentsList() {
      if (!this.filteredMarks.length) return []
      
      const students = this.filteredMarks.map(mark => ({
        id: mark['ID студента'] || Math.random().toString(),
        name: mark['ФИО студента'] || 'Не указано',
        grade: Number(mark['Оценка']) || 0
      }))

      if (!this.studentSearch) return students

      const search = this.studentSearch.toLowerCase()
      return students.filter(student => 
        student.name.toLowerCase().includes(search)
      )
    },
  },
  methods: {
    async loadCSVData() {
      try {
        const marksResponse = await fetch('/datasets/marks_dataset.csv')
        if (!marksResponse.ok) {
          throw new Error(`HTTP error! status: ${marksResponse.status}`);
        }
        const marksText = await marksResponse.text()
        console.log('Загруженные данные оценок:', marksText)

        const marksResult = Papa.parse(marksText, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
          transform: (value) => value.trim()
        })

        if (marksResult.errors.length) {
          console.error('Ошибки парсинга оценок:', marksResult.errors)
        }

        this.marksData = marksResult.data.filter(mark => 
          mark['Предмет'] && 
          mark['Семестр'] && 
          mark['Оценка']
        )
        console.log('Обработанные данные оценок:', this.marksData)

        const uniqueSubjects = [...new Set(this.marksData.map(mark => mark['Предмет']))]
        this.subjectOptions = uniqueSubjects
          .filter(Boolean)
          .map(subject => ({
            value: subject,
            name: subject
          }))

        if (this.subjectOptions.length) {
          this.selectedSubject = this.subjectOptions[0].value
        }

        const studentsResponse = await fetch('/datasets/returned_students.csv')
        if (!studentsResponse.ok) {
          throw new Error(`HTTP error! status: ${studentsResponse.status}`);
        }
        const studentsText = await studentsResponse.text()
        console.log('Загруженные данные студентов:', studentsText) // для отладки

        const studentsResult = Papa.parse(studentsText, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true,
          transform: (value) => value.trim()
        })

        if (studentsResult.errors.length) {
          console.error('Ошибки парсинга данных студентов:', studentsResult.errors)
        }

        this.returnedStudentsData = studentsResult.data.filter(student => 
          student['ФИО'] && 
          student['Группа'] && 
          student['Дата возвращения'] &&
          student['Статус']
        )
        console.log('Обработанные данные студентов:', this.returnedStudentsData) // для отладки

      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
      }
    },

    formatDate(dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString('ru-RU')
    },

    getStatusBadgeClass(status) {
      return `badge ${this.statusColors[status] || 'bg-secondary'}`
    },

    calculateAverage(marks) {
      if (!marks.length) return '0.00'
      const sum = marks.reduce((acc, mark) => acc + Number(mark['Оценка'] || 0), 0)
      return (sum / marks.length).toFixed(2)
    },

    countGrades(marks, grade) {
      return marks.filter(mark => Number(mark['Оценка']) === grade).length
    },

    calculatePercentage(marks, grade) {
      if (!marks.length) return '0.0'
      const count = this.countGrades(marks, grade)
      return ((count / marks.length) * 100).toFixed(1)
    },

    getGradeBadgeClass(grade) {
      return `badge ${this.gradeColors[grade] || 'bg-secondary'}`
    },
  },
  mounted() {
    this.loadCSVData()
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Header styles */
.q-header {
  height: 50px;
  border-bottom: 1px solid rgba(0,0,0,0.12);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.toolbar {
  height: 50px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-logo {
  padding: 8px;
  display: flex;
  align-items: center;
  text-decoration: none;
}

.avatar {
  width: 35px;
  height: 35px;
  overflow: hidden;
  border-radius: 4px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.nav-tab {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-tab:hover {
  color: #1976d2;
}

.nav-tab.active {
  color: #1976d2;
  position: relative;
}

.nav-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #1976d2;
}

.nav-tab i {
  margin-right: 8px;
  font-size: 20px;
}

.btn-user {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: none;
  border: none;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-user i {
  margin-right: 8px;
  font-size: 20px;
}

/* Adjust main content padding */
.container {
  padding-top: 60px;
}

/* Keep existing styles */
.nav-link {
  cursor: pointer;
}

.card {
  margin-bottom: 1rem;
}

.chart-container {
  height: 300px;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5em 0.75em;
}

.table th {
  font-weight: 500;
  background-color: #f8f9fa;
}

.chart-container {
  min-height: 300px;
}
</style>