<template>
  <div>
    <!-- Header в стиле ИРНИТУ -->
    <header class="q-header fixed-top bg-white text-black">
      <div class="toolbar row no-wrap items-center">
        <div class="toolbar-left">
          <a class="btn-logo" href="#">
            <div class="avatar">
              <img src="@/assets/istu_logo.png" alt="ИРНИТУ" style="max-height: 100%; width: auto;">
            </div>
            <h7 class="m-2 title_header">ИНСТРУМЕНТЫ ДЛЯ ОБРАБОТКИ ОТКРЫТЫХ ДАННЫХ СТУДЕНТОВ</h7>
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
          <a class="nav-tab"
             :class="{ active: activeTab === 'subject-stats' }"
             @click="activeTab = 'subject-stats'"
             href="#">
            <i class="material-icons">assessment</i>
            Статистика по предмету
          </a>
          <a class="nav-tab"
             :class="{ active: activeTab === 'student-rating' }"
             @click="activeTab = 'student-rating'"
             href="#">
            <i class="material-icons">leaderboard</i>
            Рейтинг студентов
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
                    <select class="form-select form-select-sm" v-model="selectedCourseForStats">
                      <option value="">Все курсы</option>
                      <option v-for="course in coursesForStats" :key="course" :value="course">
                        {{ course }} курс
                      </option>
                    </select>
                    <select class="form-select form-select-sm" v-model="selectedSemesterForStats">
                      <option value="">Все семестры</option>
                      <option v-for="sem in semestersForStats" :key="sem.value" :value="sem.value">
                        {{ sem.name }}
                      </option>
                    </select>
                    <select class="form-select form-select-sm" v-model="selectedGroupForStats">
                      <option value="">Все группы</option>
                      <option v-for="group in availableGroups" :key="group" :value="group">
                        {{ group }}
                      </option>
                    </select>
                    <select class="form-select form-select-sm" v-model="selectedSubject">
                      <option value="">Все предметы</option>
                      <option v-for="subject in subjectsForStats" :key="subject.value" :value="subject.value">
                        {{ subject.name }}
                      </option>
                    </select>
                    <button class="btn btn-outline-secondary btn-sm" @click="resetStatsFilters">
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
                                <th>Группа</th>
                                <th>Курс</th>
                                <th class="grade-cell">Оценка</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="student in filteredStudentsList" :key="student.id">
                                <td>{{ student.name }}</td>
                                <td>{{ student.group }}</td>
                                <td>{{ student.course }}</td>
                                <td class="grade-cell">
                                  <span :class="getGradeClass(student.grade)">
                                    {{ getGradeText(student.grade) }}
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

      <!-- Статистика по предмету -->
      <div v-if="activeTab === 'subject-stats'" class="subject-stats-section">
        <div class="card">
          <div class="card-header">
            <h5 class="text-center mb-3">
              Сводная статистика
              {{ selectedSubject ? `по предмету "${selectedSubject}"` : '' }}
              {{ selectedSemesterForStats ? `за ${selectedSemesterForStats} семестр` : '' }}
              {{ selectedCourseForStats ? `${selectedCourseForStats} курса` : '' }}
            </h5>
            <div class="d-flex justify-content-center gap-3 mb-3">
              <select class="form-select w-auto" v-model="selectedCourseForStats">
                <option value="">Все курсы</option>
                <option v-for="course in coursesForStats" :key="course" :value="course">
                  {{ course }} курс
                </option>
              </select>
              <select class="form-select w-auto" v-model="selectedSemesterForStats">
                <option value="">Все семестры</option>
                <option v-for="sem in semestersForStats" :key="sem.value" :value="sem.value">
                  {{ sem.name }}
                </option>
              </select>
              <select class="form-select w-auto" v-model="selectedSubject">
                <option value="">Все предметы</option>
                <option v-for="subject in subjectsForStats" :key="subject.value" :value="subject.value">
                  {{ subject.name }}
                </option>
              </select>
              <button class="btn btn-outline-secondary" @click="resetStatsFilters">
                Сбросить фильтры
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="row">
              <!-- Левая колонка с фильтром по группам -->
              <div class="col-md-3">
                <div class="dropdown">
                  <button class="btn btn-outline-secondary dropdown-toggle w-100" 
                          type="button" 
                          id="groupDropdown"
                          data-bs-toggle="dropdown" 
                          aria-expanded="false">
                    Группы ({{ selectedGroups.length }})
                  </button>
                  <ul class="dropdown-menu w-100" aria-labelledby="groupDropdown">
                    <li class="px-3 pb-2 border-bottom">
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Выбрано: {{ selectedGroups.length }}</small>
                        <div class="d-flex gap-2">
                          <button 
                            class="btn btn-link btn-sm p-0" 
                            @click="selectAllGroups"
                            v-if="selectedGroups.length !== availableGroups.length">
                            Выбрать все
                          </button>
                          <button 
                            v-if="selectedGroups.length" 
                            class="btn btn-link btn-sm p-0" 
                            @click="selectedGroups = []">
                            Очистить
                          </button>
                        </div>
                      </div>
                    </li>
                    <li v-for="group in availableGroups" :key="group">
                      <label class="dropdown-item d-flex align-items-center gap-2 m-0">
                        <input type="checkbox" 
                               class="form-check-input" 
                               v-model="selectedGroups" 
                               :value="group">
                        {{ group }}
                      </label>
                    </li>
                    <li v-if="!availableGroups.length" class="dropdown-item disabled">
                      Нет доступных групп
                    </li>
                  </ul>
                </div>
              </div>
              
              <!-- Центральная часть со статистикой -->
              <div class="col-md-9">
                <div class="row mb-4">
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-body text-center">
                        <h6 class="text-muted mb-2">Средний балл</h6>
                        <h2 class="text-warning mb-0">{{ calculateAverage(filteredMarks) }}</h2>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card">
                      <div class="card-body text-center">
                        <h6 class="text-muted mb-2">Лучший балл</h6>
                        <h2 class="text-success mb-0">{{ calculateMaxGrade(filteredMarks) }}</h2>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Графики -->
                <div class="row mb-4">
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-body">
                        <ChartComponent :chartData="gradeDistributionBarData" :chartOptions="chartOptions"/>
                      </div>
                    </div>
                  </div>
                  <!-- В template, рядом с диаграммой лучших предметов -->
                  <div class="col-md-6">
                    <div class="card h-100">
                      <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">Предметы с наилучшей успеваемостью</h6>
                        <div class="d-flex gap-2 align-items-center">
                          <select class="form-select form-select-sm" v-model="subjectChartConfig.sortBy">
                            <option value="avg">По среднему баллу</option>
                            <option value="max">По максимальному баллу</option>
                            <option value="count">По количеству оценок</option>
                          </select>
                          <select class="form-select form-select-sm" v-model="subjectChartConfig.limit">
                            <option value="3">Топ 3</option>
                            <option value="5">Топ 5</option>
                            <option value="10">Топ 10</option>
                            <option value="999">Все</option>
                          </select>
                        </div>
                      </div>
                      <div class="card-body">
                        <ChartComponent :chartData="subjectPerformanceData" :chartOptions="chartOptions"/>
                      </div>
                    </div>
                  </div>
                </div>

                

                <!-- Таблица показателей -->
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Показатель</th>
                        <th>Значение</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Минимальный балл</td>
                        <td>{{ calculateMinGrade(filteredMarks) }}</td>
                      </tr>
                      <tr>
                        <td>Средний балл</td>
                        <td>{{ calculateAverage(filteredMarks) }}</td>
                      </tr>
                      <tr>
                        <td>Максимальный балл</td>
                        <td>{{ calculateMaxGrade(filteredMarks) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>

      <!-- Академический отпуск -->
      <div v-if="activeTab === 'academic'" class="academic-leave-section">
        <!-- Добавляем навигационные вкладки -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a class="nav-link" 
               :class="{ active: academicSubTab === 'performance' }"
               @click.prevent="academicSubTab = 'performance'"
               href="#">
              Успеваемость
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link"
               :class="{ active: academicSubTab === 'returns' }"
               @click.prevent="academicSubTab = 'returns'"
               href="#">
              Даты возврата
            </a>
          </li>
        </ul>

        <!-- Контент вкладки "Успеваемость" -->
        <div v-if="academicSubTab === 'performance'" class="academic-performance">
          <!-- Графики успеваемости -->
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header">
                  <h6 class="mb-0">Распределение задолженностей</h6>
                </div>
                <div class="card-body">
                  <ChartComponent :chartData="academicDebtsChartData" :chartOptions="chartOptions"/>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header">
                  <h6 class="mb-0">Средний балл по группам</h6>
                </div>
                <div class="card-body">
                  <ChartComponent :chartData="academicGroupAverageChartData" :chartOptions="chartOptions"/>
                </div>
              </div>
            </div>
          </div>

          <!-- Таблица успеваемости -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Сводная статистика по успеваемости</h5>
              <div class="d-flex gap-2 align-items-center">
                <input type="text" 
                       class="form-control form-select-sm" 
                       v-model="academicSearch" 
                       placeholder="Поиск по ФИО...">
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm dropdown-toggle" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false">
                    Группа ({{ selectedGroups.length }})
                  </button>
                  <ul class="dropdown-menu py-2" style="min-width: 200px;">
                    <li class="px-3 pb-2 border-bottom">
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Выбрано: {{ selectedGroups.length }}</small>
                        <button 
                          v-if="selectedGroups.length" 
                          class="btn btn-link btn-sm p-0" 
                          @click="selectedGroups = []">
                          Очистить
                        </button>
                      </div>
                    </li>
                    <li v-for="group in uniqueGroups" :key="group" class="dropdown-item">
                      <label class="d-flex align-items-center gap-2 m-0">
                        <input 
                          type="checkbox" 
                          class="form-check-input" 
                          v-model="selectedGroups" 
                          :value="group"
                        >
                        {{ group }}
                      </label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="mb-0">Найдено студентов: {{ filteredAcademicStudents.length }}</h6>
              </div>
              <div class="table-responsive">
                <table class="table table-bordered table-hover">
                  <thead class="table-light">
                    <tr>
                      <th @click="sortTable('name')" style="cursor: pointer">
                        ФИО студента {{ getSortIcon('name') }}
                      </th>
                      <th @click="sortTable('group')" style="cursor: pointer">
                        Группа {{ getSortIcon('group') }}
                      </th>
                      <th @click="sortTable('debts')" style="cursor: pointer">
                        Количество задолженностей {{ getSortIcon('debts') }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="student in filteredAcademicStudents" :key="student.id">
                      <td>{{ student.name }}</td>
                      <td>{{ student.group }}</td>
                      <td>
                        <span :class="getDebtBadgeClass(student.debts)">
                          {{ student.debts }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Контент вкладки "Даты возврата" -->
        <div v-if="academicSubTab === 'returns'" class="academic-returns">
          <!-- Статистика по статусам -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Статистика по статусам студентов</h5>
          </div>
          <div class="card-body">
            <ChartComponent :chartData="academicStatusChartData" :chartOptions="chartOptions"/>
          </div>
    </div>

          <!-- Таблица дат возврата -->
          <div class="card mb-4">
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
  </div>

  <!-- Добавим новую секцию -->
  <div v-if="activeTab === 'student-rating'" class="student-rating-section">
    <div class="card">
      <div class="card-header">
        <h5 class="text-center mb-3">
          Рейтинг студентов по успеваемости, посещаемости и активности
        </h5>
        <div class="d-flex justify-content-end gap-3 mb-3">
          <select class="form-select w-auto" v-model="selectedCourseForRating">
            <option value="">Все курсы</option>
            <option v-for="course in coursesForRating" :key="course" :value="course">
              {{ course }} курс
            </option>
          </select>
          <select class="form-select w-auto" v-model="selectedGroupForRating">
            <option value="">Все группы</option>
            <option v-for="group in groupsForRating" :key="group" :value="group">
              {{ group }}
            </option>
          </select>
          <select class="form-select w-auto" v-model="selectedSubjectForRating">
            <option value="">Все предметы</option>
            <option v-for="subject in subjectsForRating" :key="subject" :value="subject">
              {{ subject }}
            </option>
          </select>
          <button class="btn btn-outline-secondary" @click="resetRatingFilters">
            Сбросить фильтры
          </button>
          <div class="btn-group">
            <input type="radio" class="btn-check" name="rating-sort" id="sort-rating" 
                   v-model="ratingConfig.sortBy" value="rating">
            <label class="btn btn-outline-primary" for="sort-rating">По рейтингу</label>

            <input type="radio" class="btn-check" name="rating-sort" id="sort-performance" 
                   v-model="ratingConfig.sortBy" value="performance">
            <label class="btn btn-outline-primary" for="sort-performance">По успеваемости</label>

            <input type="radio" class="btn-check" name="rating-sort" id="sort-attendance" 
                   v-model="ratingConfig.sortBy" value="attendance">
            <label class="btn btn-outline-primary" for="sort-attendance">По посещаемости</label>

            <input type="radio" class="btn-check" name="rating-sort" id="sort-activity" 
                   v-model="ratingConfig.sortBy" value="activity">
            <label class="btn btn-outline-primary" for="sort-activity">По активности</label>
          </div>
        </div>
      </div>
      <div class="card-body">
        <!-- График рейтинга -->
        <div class="mb-4">
          <ChartComponent :chartData="studentRatingChartData" :chartOptions="chartOptions"/>
        </div>

        <!-- Таблица рейтинга -->
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>ФИО студента</th>
                <th>Группа</th>
                <th>Курс</th>
                <th>Средний балл</th>
                <th>Активность</th>
                <th>Посещаемость</th>
                <th>Вероятность отчисления</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in filteredStudentsRating" :key="student.id">
                <td>{{ student.name }}</td>
                <td>{{ student.group }}</td>
                <td>{{ student.course }}</td>
                <td>{{ student.avgGrade.toFixed(2) }}</td>
                <td>{{ student.activity }}/10</td>
                <td>{{ student.attendancePercent }}%</td>
                <td>
                  <span :class="getDropoutRiskClass(student.dropoutRisk)">
                    {{ formatDropoutRisk(student.dropoutRisk) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
import { Dropdown } from 'bootstrap'

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
        { value: '4', name: '4 семестр' },
        { value: '5', name: '5 семестр' },
        { value: '6', name: '6 семестр' },
        { value: '7', name: '7 семестр' },
        { value: '8', name: '8 семестр' }
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
      },
      academicSearch: '',
      selectedAcademicGroup: '',
      selectedGroups: [],
      debtColors: {
        0: 'bg-success',
        1: 'bg-warning',
        2: 'bg-warning',
        3: 'bg-danger'
      },
      sortConfig: {
        key: null,
        direction: 'asc'
      },
      academicSubTab: 'performance',
      subjectChartConfig: {
        sortBy: 'avg',
        limit: '5'
      },
      ratingConfig: {
        sortBy: 'rating'
      },
      selectedSubjectForRating: '',
      selectedGroupForRating: '',
      selectedCourseForRating: '',
      selectedCourseForStats: '',
      selectedSemesterForStats: '',
      selectedGroupForStats: '',
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
      let marks = this.marksData || []
      
      if (this.selectedCourseForStats) {
        marks = marks.filter(mark => mark['Курс'] === this.selectedCourseForStats)
      }
      
      if (this.selectedSemesterForStats) {
        marks = marks.filter(mark => mark['Семестр'] === this.selectedSemesterForStats)
      }

      if (this.selectedSubject) {
        marks = marks.filter(mark => mark['Предмет'] === this.selectedSubject)
      }

      if (this.selectedGroups.length) {
        marks = marks.filter(mark => this.selectedGroups.includes(mark['Группа']))
      }

      return marks
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
      if (!this.marksData) return []

      let filteredData = this.marksData

      // Применяем фильтры
      if (this.selectedCourseForStats) {
        filteredData = filteredData.filter(mark => mark['Курс'] === this.selectedCourseForStats)
      }
      if (this.selectedSemesterForStats) {
        filteredData = filteredData.filter(mark => mark['Семестр'] === this.selectedSemesterForStats)
      }
      if (this.selectedGroupForStats) {
        filteredData = filteredData.filter(mark => mark['Группа'] === this.selectedGroupForStats)
      }
      if (this.selectedSubject) {
        filteredData = filteredData.filter(mark => mark['Предмет'] === this.selectedSubject)
      }

      // Группируем по студентам
      const studentsMap = new Map()
      filteredData.forEach(mark => {
        const studentKey = mark['ФИО']
        if (!studentsMap.has(studentKey)) {
          studentsMap.set(studentKey, {
            id: Math.random().toString(),
            name: mark['ФИО'],
            group: mark['Группа'],
            course: mark['Курс'],
            grade: Number(mark['Оценка'])
          })
        }
      })

      let students = Array.from(studentsMap.values())

      // Применяем поиск по ФИО
      if (this.studentSearch) {
        const search = this.studentSearch.toLowerCase()
        students = students.filter(student => 
          student.name.toLowerCase().includes(search)
        )
      }

      return students.sort((a, b) => a.name.localeCompare(b.name))
    },

    subjectGroups() {
      if (!this.selectedSubject || !this.marksData) return []
      
      return [...new Set(this.marksData
        .filter(mark => mark['Предмет'] === this.selectedSubject)
        .map(mark => mark['Группа'])
        .filter(Boolean)
      )].sort()
    },

    uniqueGroups() {
      // Получаем группы как из данных оценок, так и из данных студентов
      const groupsFromMarks = new Set(this.marksData.map(mark => mark['Группа']))
      const groupsFromStudents = new Set(this.academicLeaveStudents.map(student => student.group))
      
      // Объединяем уникальные группы из обоих источников
      const allGroups = [...groupsFromMarks, ...groupsFromStudents]
      
      // Фильтруем пустые значения и возвращаем уникальный список
      return [...new Set(allGroups)].filter(Boolean).sort()
    },

    uniqueSubjects() {
      // Получаем группы как из данных оценок, так и из данных студентов
      const subjectsFromSubjects = new Set(this.marksData.map(mark => mark['Предмет']))
      
      
      // Фильтруем пустые значения и возвращаем уникальный список
      return [...new Set(subjectsFromSubjects)].filter(Boolean).sort()
    },

    filteredAcademicStudents() {
      let students = this.academicLeaveStudents

      // Фильтрация по поиску
      if (this.academicSearch) {
        const search = this.academicSearch.toLowerCase()
        students = students.filter(student => 
          student.name.toLowerCase().includes(search)
        )
      }

      // Фильтрация по выбранным группам
      if (this.selectedGroups.length) {
        students = students.filter(student => 
          this.selectedGroups.includes(student.group)
        )
      }

      // Добавляем случайное количество задолженностей
      students = students.map(student => ({
        ...student,
        debts: Math.floor(Math.random() * 15)
      }))

      // Сортировка
      if (this.sortConfig.key) {
        students.sort((a, b) => {
          let aValue = a[this.sortConfig.key]
          let bValue = b[this.sortConfig.key]
          
          // Для числовых значений
          if (this.sortConfig.key === 'debts') {
            aValue = Number(aValue)
            bValue = Number(bValue)
          }
          
          if (aValue < bValue) return this.sortConfig.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return this.sortConfig.direction === 'asc' ? 1 : -1
          return 0
        })
      }

      return students
    },

    academicDebtsChartData() {
      const debtsDistribution = {
        'Нет задолженностей': 0,
        '1 задолженность': 0,
        '2 задолженности': 0,
        '3 и более': 0
      }

      this.filteredAcademicStudents.forEach(student => {
        if (student.debts === 0) debtsDistribution['Нет задолженностей']++
        else if (student.debts === 1) debtsDistribution['1 задолженность']++
        else if (student.debts === 2) debtsDistribution['2 задолженности']++
        else debtsDistribution['3 и более']++
      })

      return {
        type: 'pie',
        data: {
          labels: Object.keys(debtsDistribution),
          datasets: [{
            data: Object.values(debtsDistribution),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',  // зеленый
              'rgba(255, 205, 86, 0.6)',  // желтый
              'rgba(255, 159, 64, 0.6)',  // оранжевый
              'rgba(255, 99, 132, 0.6)'   // красный
            ],
            borderColor: [
              'rgb(75, 192, 192)',
              'rgb(255, 205, 86)',
              'rgb(255, 159, 64)',
              'rgb(255, 99, 132)'
            ],
            borderWidth: 1
          }]
        }
      }
    },

    academicGroupAverageChartData() {
      const groupAverages = {}
      const groupCounts = {}

      // Считаем сумму задолженностей и количество студентов по группам
      this.filteredAcademicStudents.forEach(student => {
        if (!groupAverages[student.group]) {
          groupAverages[student.group] = 0
          groupCounts[student.group] = 0
        }
        groupAverages[student.group] += student.debts
        groupCounts[student.group]++
      })

      // Вычисляем средние значения
      Object.keys(groupAverages).forEach(group => {
        groupAverages[group] = +(groupAverages[group] / groupCounts[group]).toFixed(1)
      })

      return {
        type: 'bar',
        data: {
          labels: Object.keys(groupAverages),
          datasets: [{
            label: 'Среднее количество задолженностей',
            data: Object.values(groupAverages),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        }
      }
    },

    gradeDistributionBarData() {
      const grades = [2, 3, 4, 5]
      const data = grades.map(grade => 
        this.filteredMarks.filter(mark => Number(mark['Оценка']) === grade).length
      )

      return {
        type: 'bar',
        data: {
          labels: ['2', '3', '4', '5'],
          datasets: [{
            label: 'Количество оценок',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',  // красный для 2
              'rgba(255, 205, 86, 0.6)',  // желтый для 3
              'rgba(75, 192, 192, 0.6)',  // зеленый для 4
              'rgba(54, 162, 235, 0.6)'   // синий для 5
            ],
            borderColor: [
              'rgb(255, 99, 132)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(54, 162, 235)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  const grade = grades[context.dataIndex];
                  return [
                    `Оценка: ${grade}`,
                    `Количество: ${value}`,
                    `Процент: ${((value / this.filteredMarks.length) * 100).toFixed(1)}%`
                  ];
                }.bind(this)
              }
            },
            title: {
              display: true,
              text: 'Распределение оценок'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Количество оценок'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Оценки'
              }
            }
          }
        }
      }
    },

    subjectPerformanceData() {
      if (!this.marksData || !this.filteredMarks.length) return null

      // Группируем оценки по предметам
      const subjectStats = Object.values(this.filteredMarks.reduce((acc, mark) => {
        const subject = mark['Предмет']
        if (!acc[subject]) {
          acc[subject] = {
            subject: subject,
            grades: [],
            attendance: [],
            activity: []
          }
        }
        acc[subject].grades.push(Number(mark['Оценка']))
        acc[subject].attendance.push(Number(mark['Посещаемость']))
        acc[subject].activity.push(Number(mark['Активность']))
        return acc
      }, {}))

      // Вычисляем статистику для каждого предмета
      const stats = subjectStats.map(stat => ({
        subject: stat.subject,
        avg: +(stat.grades.reduce((a, b) => a + b, 0) / stat.grades.length).toFixed(2),
        max: Math.max(...stat.grades),
        count: stat.grades.length,
        avgAttendance: +(stat.attendance.reduce((a, b) => a + b, 0) / stat.attendance.length).toFixed(2),
        avgActivity: +(stat.activity.reduce((a, b) => a + b, 0) / stat.activity.length).toFixed(2)
      }))

      // Сортируем в зависимости от выбранного критерия
      const sortedStats = stats.sort((a, b) => {
        switch (this.subjectChartConfig.sortBy) {
          case 'max':
            return b.max - a.max
          case 'count':
            return b.count - a.count
          default: // 'avg'
            return b.avg - a.avg
        }
      }).slice(0, Number(this.subjectChartConfig.limit))

      // Формируем данные для графика
      return {
        type: 'bar',
        data: {
          labels: sortedStats.map(item => item.subject),
          datasets: [
            {
              label: 'Средний балл',
              data: sortedStats.map(item => item.avg),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1,
              order: 1
            },
            {
              label: 'Посещаемость',
              data: sortedStats.map(item => item.avgAttendance / 30 * 100),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1,
              order: 2
            },
            {
              label: 'Активность',
              data: sortedStats.map(item => item.avgActivity * 10),
              backgroundColor: 'rgba(255, 205, 86, 0.6)',
              borderColor: 'rgb(255, 205, 86)',
              borderWidth: 1,
              order: 3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Статистика по предметам'
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const stats = sortedStats[context.dataIndex]
                  const dataset = context.dataset
                  let label = dataset.label || ''

                  switch (dataset.label) {
                    case 'Средний балл':
                      return `${label}: ${stats.avg.toFixed(2)}`
                    case 'Посещаемость':
                      return `${label}: ${(stats.avgAttendance / 30 * 100).toFixed(1)}%`
                    case 'Активность':
                      return `${label}: ${stats.avgActivity.toFixed(1)}/10`
                    default:
                      return `${label}: ${context.formattedValue}`
                  }
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: this.getChartLabel()
              }
            }
          }
        }
      }
    },

    filteredStudentsRating() {
      if (!this.marksData) return []

      // Создаем копию данных для фильтрации
      let studentsMap = new Map()

      // Проходим по всем оценкам и группируем их по студентам
      this.marksData.forEach(mark => {
        // Проверяем все фильтры
        if (this.selectedCourseForRating && mark['Курс'] !== this.selectedCourseForRating) return
        if (this.selectedGroupForRating && mark['Группа'] !== this.selectedGroupForRating) return
        if (this.selectedSubjectForRating && mark['Предмет'] !== this.selectedSubjectForRating) return

        const studentKey = mark['ФИО']
        if (!studentsMap.has(studentKey)) {
          studentsMap.set(studentKey, {
            id: Math.random().toString(),
            name: mark['ФИО'],
            group: mark['Группа'],
            course: mark['Курс'],
            grades: [],
            activity: Number(mark['Активность']),
            attendance: Number(mark['Посещаемость'])
          })
        }
        
        const student = studentsMap.get(studentKey)
        student.grades.push(Number(mark['Оценка']))
      })

      // Преобразуем Map в массив и вычисляем показатели
      let students = Array.from(studentsMap.values()).map(student => {
        const avgGrade = +(student.grades.reduce((a, b) => a + b, 0) / student.grades.length).toFixed(2)
        const attendancePercent = +((student.attendance / 30) * 100).toFixed(1)
        const rating = +(
          avgGrade * 0.4 +
          (student.attendance / 30) * 30 +
          (student.activity / 10) * 30
        ).toFixed(2)

        return {
          ...student,
          avgGrade,
          attendancePercent,
          rating,
          dropoutRisk: this.calculateDropoutRisk({
            ...student,
            avgGrade,
            attendancePercent
          })
        }
      })

      return this.applySorting(students)
    },

    // Обновляем данные для графиков
    studentRatingChartData() {
      const students = this.filteredStudentsRating.slice(0, 6) // Показываем топ-6 студентов

      return {
        type: 'bar',
        data: {
          labels: students.map(s => s.name),
          datasets: [
            {
              label: 'Средний балл',
              data: students.map(s => s.avgGrade),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              stack: 'Stack 0'
            },
            {
              label: 'Активность',
              data: students.map(s => s.activity),
              backgroundColor: 'rgba(255, 205, 86, 0.6)',
              stack: 'Stack 0'
            },
            {
              label: 'Посещаемость',
              data: students.map(s => s.attendancePercent),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              stack: 'Stack 0'
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true
            }
          }
        }
      }
    },

    subjectsForRating() {
      if (!this.marksData) return []
      
      let filteredData = this.marksData

      // Фильтруем по курсу и группе при получении списка предметов
      if (this.selectedCourseForRating) {
        filteredData = filteredData.filter(mark => mark['Курс'] === this.selectedCourseForRating)
      }
      if (this.selectedGroupForRating) {
        filteredData = filteredData.filter(mark => mark['Группа'] === this.selectedGroupForRating)
      }

      return [...new Set(filteredData.map(mark => mark['Предмет']))].sort()
    },

    groupsForRating() {
      if (!this.marksData) return []
      
      let filteredData = this.marksData

      // Фильтруем только по курсу при получении списка групп
      if (this.selectedCourseForRating) {
        filteredData = filteredData.filter(mark => mark['Курс'] === this.selectedCourseForRating)
      }

      return [...new Set(filteredData.map(mark => mark['Группа']))].sort()
    },

    coursesForRating() {
      if (!this.marksData) return []
      return [...new Set(this.marksData.map(mark => mark['Курс']))].sort((a, b) => a - b)
    },

    coursesForStats() {
      if (!this.marksData) return []
      let filteredData = this.marksData

      // Фильтруем по семестру, если выбран
      if (this.selectedSemesterForStats) {
        filteredData = filteredData.filter(mark => mark['Семестр'] === this.selectedSemesterForStats)
      }

      // Фильтруем по предмету, если выбран
      if (this.selectedSubject) {
        filteredData = filteredData.filter(mark => mark['Предмет'] === this.selectedSubject)
      }

      return [...new Set(filteredData.map(mark => mark['Курс']))].sort((a, b) => a - b)
    },

    semestersForStats() {
      if (!this.marksData) return this.semesterOptions
      let filteredData = this.marksData

      // Фильтруем по курсу, если выбран
      if (this.selectedCourseForStats) {
        filteredData = filteredData.filter(mark => mark['Курс'] === this.selectedCourseForStats)
      }

      // Фильтруем по предмету, если выбран
      if (this.selectedSubject) {
        filteredData = filteredData.filter(mark => mark['Предмет'] === this.selectedSubject)
      }

      const availableSemesters = [...new Set(filteredData.map(mark => mark['Семестр']))].sort()
      return this.semesterOptions.filter(sem => availableSemesters.includes(sem.value))
    },

    subjectsForStats() {
      if (!this.marksData) return []
      
      let filteredData = this.marksData

      // Фильтруем по курсу
      if (this.selectedCourseForStats) {
        filteredData = filteredData.filter(mark => mark['Курс'] === this.selectedCourseForStats)
      }

      // Фильтруем по семестру
      if (this.selectedSemesterForStats) {
        filteredData = filteredData.filter(mark => mark['Семестр'] === this.selectedSemesterForStats)
      }

      return [...new Set(filteredData.map(mark => mark['Предмет']))]
        .sort()
        .map(subject => ({
          value: subject,
          name: subject
        }))
    },

    // Обновляем получение доступных групп
    availableGroups() {
      if (!this.marksData) return []
      
      let filteredData = this.marksData

      // Применяем все фильтры
      if (this.selectedCourseForStats) {
        filteredData = filteredData.filter(mark => mark['Курс'] === this.selectedCourseForStats)
      }
      if (this.selectedSemesterForStats) {
        filteredData = filteredData.filter(mark => mark['Семестр'] === this.selectedSemesterForStats)
      }
      if (this.selectedSubject) {
        filteredData = filteredData.filter(mark => mark['Предмет'] === this.selectedSubject)
      }

      return [...new Set(filteredData.map(mark => mark['Группа']))].sort()
    },
  },
  methods: {
    async loadCSVData() {
      try {
        const marksResponse = await fetch('/datasets/marks_dataset.csv')
        const marksText = await marksResponse.text()

        const marksResult = Papa.parse(marksText, {
          header: true,
          delimiter: ';',
          skipEmptyLines: true
        })

        this.marksData = marksResult.data.filter(mark => 
          mark['Предмет'] && 
          mark['Семестр'] && 
          mark['Оценка']
        )

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
    calculateMaxGrade(marks) {
      if (!marks || !marks.length) return 0
      return Math.max(...marks.map(mark => Number(mark['Оценка'] || 0)))
    },

    calculateMinGrade(marks) {
      if (!marks || !marks.length) return 0
      return Math.min(...marks.map(mark => Number(mark['Оценка'] || 0)))
    },

    calculateAverage(marks) {
      if (!marks || !marks.length) return 0
      const sum = marks.reduce((acc, mark) => acc + Number(mark['Оценка'] || 0), 0)
      return +(sum / marks.length).toFixed(2)
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

    getDebtBadgeClass(debts) {
      return `badge ${this.debtColors[debts] || 'bg-danger'}`
    },

    sortTable(key) {
      if (this.sortConfig.key === key) {
        this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortConfig.key = key
        this.sortConfig.direction = 'asc'
      }
    },

    getSortIcon(key) {
      if (this.sortConfig.key !== key) return '↕'
      return this.sortConfig.direction === 'asc' ? '↑' : '↓'
    },

    getChartLabel() {
      switch (this.subjectChartConfig.sortBy) {
        case 'max':
          return 'Максимальный балл'
        case 'count':
          return 'Количество оценок'
        default:
          return 'Средний балл'
      }
    },

    getGradeText(grade) {
      // Преобразуем grade в строку для сравнения
      const gradeStr = String(grade)
      const gradeMap = {
        '5': 'Отлично',
        '4': 'Хорошо',
        '3': 'Удовлетворительно',
        '2': 'Неудовлетворительно'
      }
      return gradeMap[gradeStr] || grade
    },

    getGradeClass(grade) {
      // Преобразуем grade в строку для сравнения
      const gradeStr = String(grade)
      return {
        'grade-badge': true,
        'grade-excellent': gradeStr === '5' || grade === 5,
        'grade-good': gradeStr === '4' || grade === 4,
        'grade-satisfactory': gradeStr === '3' || grade === 3,
        'grade-unsatisfactory': gradeStr === '2' || grade === 2
      }
    },

    formatAttendance(attendance) {
      return `${attendance}%`
    },

    // Добавляем метод для сортировки
    applySorting(students) {
      switch (this.ratingConfig.sortBy) {
        case 'performance':
          return students.sort((a, b) => b.avgGrade - a.avgGrade)
        case 'attendance':
          return students.sort((a, b) => b.attendancePercent - a.attendancePercent)
        case 'activity':
          return students.sort((a, b) => b.activity - a.activity)
        default: // 'rating'
          return students.sort((a, b) => b.rating - a.rating)
      }
    },

    resetRatingFilters() {
      this.selectedCourseForRating = ''
      this.selectedGroupForRating = ''
      this.selectedSubjectForRating = ''
    },

    resetStatsFilters() {
      this.selectedCourseForStats = ''
      this.selectedSemesterForStats = ''
      this.selectedGroupForStats = ''
      this.selectedSubject = ''
      this.selectedGroups = []
      this.studentSearch = ''
    },

    selectAllGroups() {
      this.selectedGroups = [...this.availableGroups]
    },

    calculateDropoutRisk(student) {
      let risk = 0

      // Фактор среднего балла (40% влияния)
      const gradeRisk = Math.max(0, (3 - student.avgGrade) / 1.5)
      risk += gradeRisk * 0.4

      // Фактор посещаемости (25% влияния)
      const attendanceRisk = Math.max(0, (70 - student.attendancePercent) / 70)
      risk += attendanceRisk * 0.25

      // Фактор активности (15% влияния)
      const activityRisk = Math.max(0, (5 - student.activity) / 5)
      risk += activityRisk * 0.15

      // Фактор количества двоек (20% влияния)
      const failedGradesCount = student.grades.filter(grade => grade <= 2).length
      const failureRisk = Math.min(1, failedGradesCount / 3)
      risk += failureRisk * 0.2

      // Тренд успеваемости (дополнительный множитель)
      const trendMultiplier = this.calculateGradeTrend(student.grades)
      risk *= trendMultiplier

      // Нормализация до 0-1
      return Math.min(1, Math.max(0, risk))
    },

    calculateGradeTrend(grades) {
      if (grades.length < 2) return 1

      // Сортируем оценки по времени (предполагая, что они уже в хронологическом порядке)
      const recentGrades = grades.slice(-3) // берем последние 3 оценки
      const oldGrades = grades.slice(0, -3) // берем более старые оценки

      if (recentGrades.length === 0 || oldGrades.length === 0) return 1

      const recentAvg = recentGrades.reduce((a, b) => a + b, 0) / recentGrades.length
      const oldAvg = oldGrades.reduce((a, b) => a + b, 0) / oldGrades.length

      // Если последние оценки хуже предыдущих, увеличиваем риск
      if (recentAvg < oldAvg) {
        return 1.2 // увеличиваем риск на 20%
      }
      // Если улучшение, уменьшаем риск
      if (recentAvg > oldAvg) {
        return 0.8 // уменьшаем риск на 20%
      }
      return 1
    },

    formatDropoutRisk(risk) {
      return `${(risk * 100).toFixed(1)}%`
    },

    getDropoutRiskClass(risk) {
      return {
        'badge': true,
        'bg-success': risk < 0.3,
        'bg-warning': risk >= 0.3 && risk < 0.6,
        'bg-danger': risk >= 0.6
      }
    }
  },
  mounted() {
    this.loadCSVData()
    // Инициализация Bootstrap dropdown
    const dropdownElementList = document.querySelectorAll('.dropdown-toggle')
    const dropdownList = [...dropdownElementList].map(dropdownToggleEl => new Dropdown(dropdownToggleEl))
  },
  watch: {
    selectedCourseForStats() {
      // Проверяем, есть ли выбранный семестр в новом списке доступных семестров
      if (this.selectedSemesterForStats && 
          !this.semestersForStats.some(s => s.value === this.selectedSemesterForStats)) {
        this.selectedSemesterForStats = ''
      }
      // Проверяем, есть ли выбранная группа в новом списке доступных групп
      if (this.selectedGroupForStats && 
          !this.availableGroups.includes(this.selectedGroupForStats)) {
        this.selectedGroupForStats = ''
      }
      // Проверяем, есть ли выбранный предмет в новом списке доступных предметов
      if (this.selectedSubject && 
          !this.subjectsForStats.some(s => s.value === this.selectedSubject)) {
        this.selectedSubject = ''
      }
    },

    selectedSemesterForStats() {
      // Проверяем, есть ли выбранная группа в новом списке доступных групп
      if (this.selectedGroupForStats && 
          !this.availableGroups.includes(this.selectedGroupForStats)) {
        this.selectedGroupForStats = ''
      }
      // Проверяем, есть ли выбранный предмет в новом списке доступных предметов
      if (this.selectedSubject && 
          !this.subjectsForStats.some(s => s.value === this.selectedSubject)) {
        this.selectedSubject = ''
      }
    },

    selectedGroupForStats() {
      // Проверяем, есть ли выбранный предмет в новом списке доступных предметов
      if (this.selectedSubject && 
          !this.subjectsForStats.some(s => s.value === this.selectedSubject)) {
        this.selectedSubject = ''
      }
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Header styles */
.q-header {
  height: 54px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  z-index: 2000;
  position: fixed;
  width: 100%;
  background-color: white;
  display: flex;
  align-items: center;
}

.toolbar {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding: 0 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  height: 100%;
}

.btn-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 0 8px;
  height: 100%;
}

.avatar {
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  vertical-align: middle;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  height: 38px;
  width: 38px;
  margin: 0 auto;
}

.avatar img {
  max-height: inherit;
  width: auto;
  object-fit: contain;
  max-width: 120%;
  display: block;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.nav-tabs {
  display: flex;
  align-items: stretch;
  height: 100%;
  gap: 8px;
}

.nav-tab {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  color: rgba(0, 0, 0, 0.7);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.nav-tab.active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
  background-color: rgba(25, 118, 210, 0.04);
}

.nav-tab:hover {
  color: rgba(0, 0, 0, 0.9);
  background-color: rgba(0, 0, 0, 0.04);
}

.nav-tab i {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.title_header {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  color: black;
  margin: 0;
  padding: 0 16px;
  height: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 8px 0;
}

.logo-container img {
  height: 38px;
  width: auto;
  object-fit: contain;
  max-width: 100%;
  display: block;
}

/* Если нужно, можно добавить медиа-запрос для мобильных устройств */
@media (max-width: 768px) {
  .logo-container img {
    height: 32px;
  }
}

/* Если изображение всё ещё обрезается, можно попробовать этот вариант */
/*.logo-container {
  width: 150px;
}*/

.avatar {
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  vertical-align: middle;
  display: inline-block;
  border-radius: 50%;
  font-size: 32px;
  height: 38px;
  width: 38px;
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
  user-select: none;
  position: relative;
}

.table th:hover {
  background-color: #f0f0f0;
}

.chart-container {
  min-height: 300px;
}

.dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-item {
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item.disabled {
  color: #6c757d;
  cursor: not-allowed;
}

.grade-cell {
  text-align: center;
  padding-right: 16px;
}

.grade-badge {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  border-radius: 16px;
  outline: 0;
  position: relative;
  height: 2em;
  max-width: 100%;
  margin: 4px;
  font-size: 14px;
  padding: .5em .9em;
  white-space: nowrap;
  margin-left: auto;
}

.grade-excellent {
  background-color: rgb(180, 255, 169) !important;

}

.grade-good {
  background-color: rgb(218, 255, 157) !important;

}

.grade-satisfactory {
  background-color: rgb(255, 231, 169) !important;
}

.grade-unsatisfactory {
  background-color: rgba(239, 83, 80, 0.2) !important;

}

.badge {
  padding: 0.5em 1em;
  border-radius: 1rem;
  font-weight: normal;
}

.bg-success {
  background-color: rgba(40, 167, 69, 0.2) !important;
  color: #28a745 !important;
}

.bg-warning {
  background-color: rgba(255, 193, 7, 0.2) !important;
  color: #ffc107 !important;
}

.bg-danger {
  background-color: rgba(220, 53, 69, 0.2) !important;
  color: #dc3545 !important;
}
</style>

