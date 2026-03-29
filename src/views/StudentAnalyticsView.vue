<template>
  <div class="student-analytics-section">
    <div class="d-flex gap-2 mb-4">
      <button
        class="btn"
        :class="activeSection === 'predictions' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="activeSection = 'predictions'"
      >
        <i class="material-icons small align-middle me-1">trending_up</i>
        Прогноз оценок
      </button>
      <button
        class="btn"
        :class="activeSection === 'clustering' ? 'btn-primary' : 'btn-outline-secondary'"
        @click="activeSection = 'clustering'"
      >
        <i class="material-icons small align-middle me-1">hub</i>
        Кластерный анализ
      </button>
    </div>

    <!-- ========== PREDICTIONS SECTION ========== -->
    <div v-if="activeSection === 'predictions'">
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="material-icons small align-middle me-1">psychology</i>
            Прогнозирование оценок (нейросеть)
          </h5>
        </div>
        <div class="card-body">
          <p class="text-muted mb-3">
            Модель обучается на данных старших курсов и прогнозирует средний балл студентов
            выбранного курса на следующий год. Для каждого студента определяется направление
            изменения: положительный, отрицательный или нейтральный прогноз.
          </p>

          <div v-if="groupsLoading" class="text-center py-3">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Загрузка списка групп...
          </div>
          <template v-else>
            <div class="row g-3 mb-3">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Факультет</label>
                <select class="form-select" v-model="predForm.faculty" @change="onFacultyChange">
                  <option value="">— Выберите факультет —</option>
                  <option v-for="f in faculties" :key="f" :value="f">{{ f }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Направление (база группы)</label>
                <select class="form-select" v-model="predForm.group_base" :disabled="!predForm.faculty">
                  <option value="">— Выберите направление —</option>
                  <option v-for="gb in filteredGroupBases" :key="gb" :value="gb">{{ gb }}</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Курс для прогноза</label>
                <select class="form-select" v-model="predForm.course" :disabled="!predForm.group_base">
                  <option :value="0">— Выберите курс —</option>
                  <option :value="1">1 курс</option>
                  <option :value="2">2 курс</option>
                  <option :value="3">3 курс</option>
                </select>
              </div>
            </div>

            <div v-if="predError" class="alert alert-danger py-2 mb-3">{{ predError }}</div>
            <div v-if="predSuccess" class="alert alert-success py-2 mb-3">
              <i class="material-icons small align-middle me-1">check_circle</i>
              {{ predSuccess }}
            </div>

            <div class="d-flex gap-2 flex-wrap">
              <button
                class="btn btn-primary"
                @click="trainAndFetchPredictions"
                :disabled="!canSubmitPrediction || predTrainLoading"
              >
                <span v-if="predTrainLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="material-icons small align-middle me-1">rocket_launch</i>
                {{ predTrainLoading ? 'Обучение модели...' : 'Обучить модель и получить прогноз' }}
              </button>
              <button
                class="btn btn-outline-primary"
                @click="fetchPredictions"
                :disabled="!canSubmitPrediction || predFetchLoading"
              >
                <span v-if="predFetchLoading" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="material-icons small align-middle me-1">download</i>
                {{ predFetchLoading ? 'Загрузка...' : 'Загрузить готовый прогноз' }}
              </button>
            </div>
            <div v-if="predTrainLoading" class="mt-2 small text-muted">
              <i class="material-icons small align-middle me-1">info</i>
              Обучение нейросети может занять некоторое время. Пожалуйста, не закрывайте страницу.
            </div>
          </template>
        </div>
      </div>

      <!-- Prediction Results -->
      <div v-if="predictions.length > 0" class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="mb-0">
            <i class="material-icons small align-middle me-1">assessment</i>
            Результаты прогнозирования
            <span class="badge bg-secondary ms-2">{{ predictions.length }} студентов</span>
          </h5>
          <div class="d-flex gap-2 align-items-center">
            <select class="form-select form-select-sm" style="width: auto" v-model="predSortBy">
              <option value="group">По группе</option>
              <option value="predicted-desc">Прогноз ↓</option>
              <option value="predicted-asc">Прогноз ↑</option>
              <option value="change-desc">Изменение ↓</option>
              <option value="change-asc">Изменение ↑</option>
            </select>
            <select class="form-select form-select-sm" style="width: auto" v-model="predFilterDirection">
              <option value="">Все</option>
              <option value="positive">Рост</option>
              <option value="negative">Падение</option>
              <option value="neutral">Стабильно</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <!-- Summary -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm h-100 text-center">
                <div class="card-body py-3">
                  <div class="text-muted small">Средний текущий балл</div>
                  <div class="fs-4 fw-bold">{{ predSummary.avgCurrent }}</div>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card border-0 shadow-sm h-100 text-center">
                <div class="card-body py-3">
                  <div class="text-muted small">Средний прогнозный балл</div>
                  <div
                    class="fs-4 fw-bold"
                    :class="parseFloat(predSummary.avgPredicted) >= parseFloat(predSummary.avgCurrent) ? 'text-success' : 'text-danger'"
                  >
                    {{ predSummary.avgPredicted }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-4 col-md-2">
              <div class="card border-0 shadow-sm h-100 text-center">
                <div class="card-body py-3">
                  <div class="text-muted small">Рост ↑</div>
                  <div class="fs-4 fw-bold text-success">{{ predSummary.positive }}</div>
                </div>
              </div>
            </div>
            <div class="col-4 col-md-2">
              <div class="card border-0 shadow-sm h-100 text-center">
                <div class="card-body py-3">
                  <div class="text-muted small">Падение ↓</div>
                  <div class="fs-4 fw-bold text-danger">{{ predSummary.negative }}</div>
                </div>
              </div>
            </div>
            <div class="col-4 col-md-2">
              <div class="card border-0 shadow-sm h-100 text-center">
                <div class="card-body py-3">
                  <div class="text-muted small">Стабильно</div>
                  <div class="fs-4 fw-bold text-secondary">{{ predSummary.neutral }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart -->
          <div class="mb-4" style="height: 300px">
            <ChartComponent
              v-if="predChartData.data.labels.length > 0"
              :chartData="predChartData"
              :chartOptions="predChartOptions"
            />
          </div>

          <!-- Table -->
          <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light sticky-top">
                <tr>
                  <th style="width: 40px">#</th>
                  <th>ID студента</th>
                  <th>Группа</th>
                  <th class="text-center">Текущий ср. балл</th>
                  <th class="text-center">Прогноз</th>
                  <th class="text-center">Изменение</th>
                  <th class="text-center">Направление</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, i) in sortedPredictions" :key="s.mira_id">
                  <td class="text-muted">{{ i + 1 }}</td>
                  <td>{{ s.mira_id }}</td>
                  <td>{{ s.group }}</td>
                  <td class="text-center">
                    <span class="badge" :class="gradeClass(s.avg_grade_current)">
                      {{ formatGrade(s.avg_grade_current) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge" :class="gradeClass(s.predicted_grade)">
                      {{ formatGrade(s.predicted_grade) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span :class="changeTextClass(s.change_direction)">
                      {{ formatChangePercent(s.change_percent) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <span class="badge" :class="directionBadgeClass(s.change_direction)">
                      {{ directionLabel(s.change_direction) }}
                    </span>
                  </td>
                </tr>
                <tr v-if="sortedPredictions.length === 0">
                  <td colspan="7" class="text-center text-muted">Нет данных по выбранным фильтрам</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== CLUSTERING SECTION ========== -->
    <div v-if="activeSection === 'clustering'">
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="material-icons small align-middle me-1">model_training</i>
            Обучение модели кластеризации
          </h5>
        </div>
        <div class="card-body">
          <p class="text-muted mb-3">
            Запускает процесс кластеризации (KMeans) студентов по признакам «средний балл»
            и «посещаемость». Результаты сохраняются для последующего анализа.
          </p>
          <div v-if="clusterTrainError" class="alert alert-danger py-2">{{ clusterTrainError }}</div>
          <div v-if="clusterTrainSuccess" class="alert alert-success py-2">
            <i class="material-icons small align-middle me-1">check_circle</i>
            {{ clusterTrainSuccess }}
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" @click="trainClustering" :disabled="clusterTrainLoading">
              <span v-if="clusterTrainLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="material-icons small align-middle me-1">play_arrow</i>
              {{ clusterTrainLoading ? 'Обучение...' : 'Запустить кластеризацию' }}
            </button>
            <button class="btn btn-outline-primary" @click="fetchClusteringData" :disabled="clusterDataLoading">
              <span v-if="clusterDataLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="material-icons small align-middle me-1">download</i>
              Загрузить результаты
            </button>
          </div>
        </div>
      </div>

      <!-- Clustering Results -->
      <div v-if="clusterData" class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 class="mb-0">
            <i class="material-icons small align-middle me-1">bubble_chart</i>
            Результаты кластеризации
            <span class="badge bg-secondary ms-2">{{ clusterData.total_students }} студентов</span>
            <span v-if="clusterData.clusters_count" class="badge bg-info ms-1">{{ clusterData.clusters_count }} кластеров</span>
          </h5>
          <select class="form-select form-select-sm" style="width: auto" v-model="clusterGroupFilter" @change="fetchClusteringData">
            <option value="">Все группы</option>
            <option v-for="g in clusterAvailableGroups" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="card-body">
          <!-- Group stats table -->
          <div v-if="clusterGroupStats.length > 0" class="mb-4">
            <h6><i class="material-icons small align-middle me-1">groups</i> Статистика по группам</h6>
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead class="table-light">
                  <tr>
                    <th>Группа</th>
                    <th class="text-center">Ср. балл</th>
                    <th class="text-center">Посещаемость %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="gs in clusterGroupStats" :key="gs.name">
                    <td>{{ gs.name }}</td>
                    <td class="text-center">
                      <span class="badge" :class="gradeClass(gs.avg_grade)">{{ formatGrade(gs.avg_grade) }}</span>
                    </td>
                    <td class="text-center">{{ gs.attendance_percent?.toFixed(1) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Cluster scatter chart -->
          <div v-if="clusterChartData.data.datasets.length > 0" class="mb-4" style="height: 320px">
            <ChartComponent :chartData="clusterChartData" :chartOptions="scatterChartOptions" />
          </div>

          <!-- Students table -->
          <h6><i class="material-icons small align-middle me-1">people</i> Студенты</h6>
          <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
            <table class="table table-sm table-hover mb-0">
              <thead class="table-light sticky-top">
                <tr>
                  <th style="width: 40px">#</th>
                  <th>ID студента</th>
                  <th>Группа</th>
                  <th class="text-center">Ср. балл</th>
                  <th class="text-center">Посещаемость</th>
                  <th class="text-center">Кластер</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(s, i) in clusterStudents" :key="s.student_id">
                  <td class="text-muted">{{ i + 1 }}</td>
                  <td>{{ s.student_id }}</td>
                  <td>{{ s.group }}</td>
                  <td class="text-center">
                    <span class="badge" :class="gradeClass(s.avg_grade)">{{ formatGrade(s.avg_grade) }}</span>
                  </td>
                  <td class="text-center">{{ s.attendance_percent?.toFixed(1) }}%</td>
                  <td class="text-center">
                    <span class="badge" :class="clusterBadgeClass(s.cluster)">Кластер {{ s.cluster }}</span>
                  </td>
                </tr>
                <tr v-if="clusterStudents.length === 0">
                  <td colspan="6" class="text-center text-muted">Нет данных</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Individual student search -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="material-icons small align-middle me-1">person_search</i>
            Поиск студента по ID
          </h5>
        </div>
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text">ID студента</span>
                <input
                  type="text"
                  class="form-control"
                  v-model="clusterStudentId"
                  placeholder="Введите ID..."
                  @keyup.enter="fetchStudentCluster"
                >
                <button
                  class="btn btn-primary"
                  @click="fetchStudentCluster"
                  :disabled="clusterStudentLoading || !clusterStudentId.trim()"
                >
                  <span v-if="clusterStudentLoading" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="material-icons small align-middle">search</i>
                  Найти
                </button>
              </div>
            </div>
          </div>
          <div v-if="clusterStudentError" class="alert alert-danger py-2">{{ clusterStudentError }}</div>
          <div v-if="clusterStudentData" class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="text-muted small">ID</div>
                  <strong>{{ clusterStudentData.student_id }}</strong>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Группа</div>
                  <strong>{{ clusterStudentData.group }}</strong>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Средний балл</div>
                  <span class="badge" :class="gradeClass(clusterStudentData.avg_grade)">
                    {{ formatGrade(clusterStudentData.avg_grade) }}
                  </span>
                </div>
                <div class="col-md-3">
                  <div class="text-muted small">Кластер</div>
                  <span class="badge" :class="clusterBadgeClass(clusterStudentData.cluster)">
                    Кластер {{ clusterStudentData.cluster }}
                  </span>
                </div>
              </div>
              <div class="row g-3 mt-2">
                <div class="col-md-3">
                  <div class="text-muted small">Посещаемость</div>
                  <strong>{{ clusterStudentData.attendance_percent?.toFixed(1) }}%</strong>
                </div>
                <div class="col-md-3" v-if="clusterStudentData.speciality">
                  <div class="text-muted small">Специальность</div>
                  <strong>{{ clusterStudentData.speciality }}</strong>
                </div>
                <div class="col-md-3" v-if="clusterStudentData.faculty">
                  <div class="text-muted small">Факультет</div>
                  <strong>{{ clusterStudentData.faculty }}</strong>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!clusterStudentLoading && !clusterStudentError" class="text-center text-muted py-4">
            <i class="material-icons" style="font-size: 3rem; opacity: 0.3">person_search</i>
            <p class="mt-2">Введите ID студента для просмотра его кластерной принадлежности</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject, onMounted } from 'vue';
import ChartComponent from '@/components/ChartComponent.vue';

defineProps({
  chartOptions: { type: Object, required: true }
});

const fetchData = inject('fetchData');
const API_BASE_URL = inject('API_BASE_URL');

const activeSection = ref('predictions');

// ─── Groups data for prediction form ───
const groupsRaw = ref([]);
const groupsLoading = ref(false);

const faculties = computed(() => {
  const set = new Set(groupsRaw.value.map(g => g.faculty_name).filter(Boolean));
  return [...set].sort();
});

const extractGroupBase = (name) => name.replace(/[-\s]?\d{2}$/, '');

const filteredGroupBases = computed(() => {
  if (!predForm.faculty) return [];
  const bases = new Set(
    groupsRaw.value
      .filter(g => g.faculty_name === predForm.faculty)
      .map(g => extractGroupBase(g.name))
      .filter(Boolean)
  );
  return [...bases].sort();
});

// ─── Prediction state ───
const predForm = reactive({ faculty: '', group_base: '', course: 0 });
const predTrainLoading = ref(false);
const predFetchLoading = ref(false);
const predError = ref(null);
const predSuccess = ref(null);
const predictions = ref([]);
const predSortBy = ref('group');
const predFilterDirection = ref('');

const canSubmitPrediction = computed(() => predForm.faculty && predForm.group_base && predForm.course > 0);

// ─── Clustering state ───
const clusterTrainLoading = ref(false);
const clusterTrainError = ref(null);
const clusterTrainSuccess = ref(null);
const clusterDataLoading = ref(false);
const clusterData = ref(null);
const clusterGroupFilter = ref('');
const clusterAvailableGroups = ref([]);
const clusterStudentId = ref('');
const clusterStudentLoading = ref(false);
const clusterStudentError = ref(null);
const clusterStudentData = ref(null);

// ─── Prediction actions ───
const trainAndFetchPredictions = async () => {
  if (!fetchData || !canSubmitPrediction.value) return;
  predTrainLoading.value = true;
  predError.value = null;
  predSuccess.value = null;
  predictions.value = [];

  try {
    const trainResult = await fetchData(`${API_BASE_URL}/predictions/train/`, {
      method: 'POST',
      body: JSON.stringify({
        faculty: predForm.faculty,
        group_base: predForm.group_base,
        course: predForm.course
      })
    });
    predSuccess.value = trainResult?.message || 'Модель успешно обучена. Загрузка прогнозов...';
    predTrainLoading.value = false;
    await fetchPredictions();
  } catch (err) {
    predError.value = err.message || 'Ошибка при обучении модели.';
    predTrainLoading.value = false;
  }
};

const fetchPredictions = async () => {
  if (!fetchData || !canSubmitPrediction.value) return;
  predFetchLoading.value = true;
  predError.value = null;

  try {
    const params = new URLSearchParams({
      faculty: predForm.faculty,
      group_base: predForm.group_base,
      course: String(predForm.course)
    });
    const data = await fetchData(`${API_BASE_URL}/predictions/data/?${params.toString()}`);
    if (data?.predictions) {
      predictions.value = data.predictions;
      if (!predSuccess.value) {
        predSuccess.value = `Загружено ${data.predictions.length} прогнозов.`;
      }
    }
  } catch (err) {
    predError.value = err.message || 'Ошибка при загрузке прогнозов. Возможно, модель ещё не обучена для этих параметров.';
  } finally {
    predFetchLoading.value = false;
  }
};

const onFacultyChange = () => {
  predForm.group_base = '';
  predForm.course = 0;
  predictions.value = [];
  predSuccess.value = null;
  predError.value = null;
};

// ─── Prediction computed ───
const sortedPredictions = computed(() => {
  let result = [...predictions.value];

  if (predFilterDirection.value) {
    if (predFilterDirection.value === 'neutral') {
      result = result.filter(s => s.change_direction === 'no change' || s.change_direction === 'undefined');
    } else {
      result = result.filter(s => s.change_direction === predFilterDirection.value);
    }
  }

  result.sort((a, b) => {
    switch (predSortBy.value) {
      case 'predicted-desc': return (b.predicted_grade ?? 0) - (a.predicted_grade ?? 0);
      case 'predicted-asc': return (a.predicted_grade ?? 0) - (b.predicted_grade ?? 0);
      case 'change-desc': return (b.change_percent ?? 0) - (a.change_percent ?? 0);
      case 'change-asc': return (a.change_percent ?? 0) - (b.change_percent ?? 0);
      default: return (a.group || '').localeCompare(b.group || '', 'ru');
    }
  });
  return result;
});

const predSummary = computed(() => {
  const p = predictions.value;
  if (!p.length) return { avgCurrent: 'N/A', avgPredicted: 'N/A', positive: 0, negative: 0, neutral: 0 };

  const currents = p.map(s => s.avg_grade_current).filter(v => v != null);
  const predicted = p.map(s => s.predicted_grade).filter(v => v != null);

  return {
    avgCurrent: currents.length ? (currents.reduce((a, b) => a + b, 0) / currents.length).toFixed(2) : 'N/A',
    avgPredicted: predicted.length ? (predicted.reduce((a, b) => a + b, 0) / predicted.length).toFixed(2) : 'N/A',
    positive: p.filter(s => s.change_direction === 'positive').length,
    negative: p.filter(s => s.change_direction === 'negative').length,
    neutral: p.filter(s => s.change_direction === 'no change' || s.change_direction === 'undefined').length
  };
});

const predChartData = computed(() => {
  const displayed = sortedPredictions.value.slice(0, 30);
  if (!displayed.length) return { type: 'bar', data: { labels: [], datasets: [] } };

  return {
    type: 'bar',
    data: {
      labels: displayed.map(s => `${s.group} #${s.mira_id}`),
      datasets: [
        {
          label: 'Текущий ср. балл',
          data: displayed.map(s => s.avg_grade_current),
          backgroundColor: 'rgba(13, 110, 253, 0.5)',
          borderColor: 'rgba(13, 110, 253, 1)',
          borderWidth: 1
        },
        {
          label: 'Прогнозный балл',
          data: displayed.map(s => s.predicted_grade),
          backgroundColor: displayed.map(s =>
            s.change_direction === 'positive' ? 'rgba(25, 135, 84, 0.5)'
            : s.change_direction === 'negative' ? 'rgba(220, 53, 69, 0.5)'
            : 'rgba(108, 117, 125, 0.5)'
          ),
          borderColor: displayed.map(s =>
            s.change_direction === 'positive' ? 'rgba(25, 135, 84, 1)'
            : s.change_direction === 'negative' ? 'rgba(220, 53, 69, 1)'
            : 'rgba(108, 117, 125, 1)'
          ),
          borderWidth: 1
        }
      ]
    }
  };
});

const predChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true } },
  scales: {
    y: { beginAtZero: false, min: 2, max: 5, title: { display: true, text: 'Средний балл' } },
    x: { ticks: { maxRotation: 45, minRotation: 25, font: { size: 10 } } }
  }
};

// ─── Clustering actions ───
const trainClustering = async () => {
  if (!fetchData) return;
  clusterTrainLoading.value = true;
  clusterTrainError.value = null;
  clusterTrainSuccess.value = null;

  try {
    const data = await fetchData(`${API_BASE_URL}/analytics/train/`, { method: 'POST' });
    clusterTrainSuccess.value = data?.message || 'Кластеризация успешно выполнена.';
    await fetchClusteringData();
  } catch (err) {
    clusterTrainError.value = err.message || 'Ошибка при запуске кластеризации.';
  } finally {
    clusterTrainLoading.value = false;
  }
};

const fetchClusteringData = async () => {
  if (!fetchData) return;
  clusterDataLoading.value = true;

  try {
    let url = `${API_BASE_URL}/analytics/data/`;
    if (clusterGroupFilter.value) {
      url += `?group=${encodeURIComponent(clusterGroupFilter.value)}`;
    }
    const data = await fetchData(url);
    if (data) {
      clusterData.value = data;
      if (!clusterGroupFilter.value && data.students) {
        const groups = new Set(data.students.map(s => s.group).filter(Boolean));
        clusterAvailableGroups.value = [...groups].sort();
      }
    }
  } catch {
    clusterData.value = null;
  } finally {
    clusterDataLoading.value = false;
  }
};

const fetchStudentCluster = async () => {
  if (!fetchData || !clusterStudentId.value.trim()) return;
  clusterStudentLoading.value = true;
  clusterStudentError.value = null;
  clusterStudentData.value = null;

  try {
    const data = await fetchData(`${API_BASE_URL}/analytics/data/${clusterStudentId.value.trim()}/`);
    if (data) clusterStudentData.value = data;
  } catch (err) {
    clusterStudentError.value = err.message || 'Студент не найден в результатах кластеризации.';
  } finally {
    clusterStudentLoading.value = false;
  }
};

// ─── Clustering computed ───
const clusterStudents = computed(() => clusterData.value?.students || []);

const clusterGroupStats = computed(() => {
  const stats = clusterData.value?.group_stats;
  if (!stats) return [];
  return Object.entries(stats).map(([name, s]) => ({ name, ...s })).sort((a, b) => a.name.localeCompare(b.name, 'ru'));
});

const CLUSTER_COLORS = [
  'rgba(13, 110, 253, 0.6)',
  'rgba(25, 135, 84, 0.6)',
  'rgba(220, 53, 69, 0.6)',
  'rgba(255, 193, 7, 0.6)',
  'rgba(111, 66, 193, 0.6)'
];

const clusterChartData = computed(() => {
  const students = clusterStudents.value;
  if (!students.length) return { type: 'scatter', data: { labels: [], datasets: [] } };

  const buckets = {};
  students.forEach(s => {
    const c = s.cluster ?? 0;
    if (!buckets[c]) buckets[c] = [];
    buckets[c].push({ x: s.avg_grade ?? 0, y: s.attendance_percent ?? 0 });
  });

  const datasets = Object.entries(buckets).map(([cId, points], i) => ({
    label: `Кластер ${cId}`,
    data: points,
    backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
    borderColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length].replace('0.6', '1'),
    borderWidth: 1,
    pointRadius: 5
  }));

  return { type: 'scatter', data: { labels: [], datasets } };
});

const scatterChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'top' } },
  scales: {
    x: { title: { display: true, text: 'Средний балл' }, min: 2, max: 5 },
    y: { title: { display: true, text: 'Посещаемость %' }, min: 0, max: 100 }
  }
};

// ─── Shared helpers ───
const formatGrade = (val) => (val != null ? Number(val).toFixed(2) : '—');

const gradeClass = (grade) => {
  if (grade == null) return 'bg-secondary';
  if (grade >= 4.5) return 'bg-success';
  if (grade >= 3.5) return 'bg-primary';
  if (grade >= 2.5) return 'bg-warning text-dark';
  return 'bg-danger';
};

const changeTextClass = (direction) => {
  if (direction === 'positive') return 'text-success fw-bold';
  if (direction === 'negative') return 'text-danger fw-bold';
  return 'text-secondary';
};

const directionBadgeClass = (direction) => {
  if (direction === 'positive') return 'bg-success';
  if (direction === 'negative') return 'bg-danger';
  return 'bg-secondary';
};

const directionLabel = (direction) => {
  if (direction === 'positive') return '↑ Рост';
  if (direction === 'negative') return '↓ Падение';
  if (direction === 'no change') return '— Стабильно';
  return '— Н/Д';
};

const formatChangePercent = (val) => {
  if (val == null || isNaN(val)) return '—';
  const sign = val > 0 ? '+' : '';
  return `${sign}${Number(val).toFixed(1)}%`;
};

const clusterBadgeClass = (cluster) => {
  const classes = ['bg-primary', 'bg-success', 'bg-danger', 'bg-warning text-dark', 'bg-info'];
  return classes[(cluster ?? 0) % classes.length];
};

// ─── Init ───
onMounted(async () => {
  groupsLoading.value = true;
  try {
    const data = await fetchData(`${API_BASE_URL}/groups/`);
    if (Array.isArray(data)) {
      groupsRaw.value = data;
    }
  } catch {
    // Groups loading failed — dropdowns will be empty
  } finally {
    groupsLoading.value = false;
  }
});
</script>

<style scoped>
.table-danger-subtle {
  background-color: rgba(220, 53, 69, 0.05);
}
</style>
