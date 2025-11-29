<template>
  <div>
    <!-- Header в стиле ИРНИТУ -->
    <header class="istu-header fixed-top">
      <div class="istu-toolbar">
        <!-- Мобильная кнопка меню -->
        <div class="mobile-menu-toggle d-lg-none">
          <button class="btn btn-link text-dark" @click="toggleMobileMenu">
            <i class="material-icons">menu</i>
          </button>
        </div>
        
        <!-- Логотип и название -->
        <div class="istu-toolbar-title">
          <a class="istu-btn istu-btn-logo" href="#" @click.prevent="activeTab = 'statistics'; mobileMenuOpen = false;">
            <div class="istu-avatar">
              <img src="@/assets/istu_logo.png" alt="ИРНИТУ">
            </div>
          </a>
          <a class="istu-btn istu-btn-title-text d-none d-sm-block" href="#" @click.prevent="activeTab = 'statistics'; mobileMenuOpen = false;">
            ИНСТРУМЕНТЫ ДЛЯ ОБРАБОТКИ ОТКРЫТЫХ ДАННЫХ СТУДЕНТОВ
          </a>
        </div>
        
        <!-- Навигационные вкладки (стилизованные под q-tabs) -->
        <div class="istu-tabs d-none d-lg-flex">
          <!-- Целевой навбар имеет одну вкладку "Зачетная книжка". 
               Если вы хотите ее, замените ваши вкладки на что-то вроде:
          <a class="istu-tab" :class="{ active: activeTab === 'recordBook' }" @click="setActiveTab('recordBook')" href="#">
            <i class="material-icons">fact_check</i>Зачетная книжка
          </a>
          -->
          <a class="istu-tab" :class="{ active: activeTab === 'statistics' }" @click="setActiveTab('statistics')" href="#">
            <i class="material-icons">analytics</i> СТАТИСТИКА ОЦЕНОК
          </a>
          <a class="istu-tab" :class="{ active: activeTab === 'academic' }" @click="setActiveTab('academic')" href="#">
            <i class="material-icons">school</i> АКАДЕМ. ОТПУСК
          </a>
          <a class="istu-tab" :class="{ active: activeTab === 'subject-stats' }" @click="setActiveTab('subject-stats')" href="#">
            <i class="material-icons">assessment</i> СТАТИСТИКА ПО ПРЕДМЕТУ
          </a>
          <a class="istu-tab" :class="{ active: activeTab === 'student-rating' }" @click="setActiveTab('student-rating')" href="#">
            <i class="material-icons">leaderboard</i> РЕЙТИНГ СТУДЕНТОВ
          </a>
        </div>
        
        <!-- Авторизация (с выпадающим меню для пользователя) -->
        <div class="istu-toolbar-auth">
          <div v-if="isAuthenticated" class="nav-item dropdown header-auth-dropdown">
            <a class="nav-link dropdown-toggle istu-user-dropdown-toggle" href="#" id="navbarDropdownUserMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="material-icons me-1" style="vertical-align: middle;">person</i>
              <span class="user-name-display d-none d-sm-inline">{{ formattedUserName }}</span>
              <i class="material-icons istu-dropdown-arrow d-none d-sm-inline">arrow_drop_down</i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownUserMenu">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">
                  <i class="material-icons me-2" style="vertical-align: middle;">exit_to_app</i>Выйти
                </a>
              </li>
            </ul>
          </div>
          <div v-else>
            <button class="btn btn-istu-login" @click="openLoginModal">
              <i class="material-icons">login</i>
              <span class="d-none d-md-inline-block ms-1">Войти</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Мобильное меню -->
      <div class="mobile-menu d-lg-none" :class="{ 'mobile-menu-open': mobileMenuOpen }">
        <a class="mobile-menu-item" :class="{ active: activeTab === 'statistics' }" @click="setActiveTabMobile('statistics')">
          <i class="material-icons">analytics</i> СТАТИСТИКА ОЦЕНОК
        </a>
        <a class="mobile-menu-item" :class="{ active: activeTab === 'academic' }" @click="setActiveTabMobile('academic')">
          <i class="material-icons">school</i> АКАДЕМ. ОТПУСК
        </a>
        <a class="mobile-menu-item" :class="{ active: activeTab === 'subject-stats' }" @click="setActiveTabMobile('subject-stats')">
          <i class="material-icons">assessment</i> СТАТИСТИКА ПО ПРЕДМЕТУ
        </a>
        <a class="mobile-menu-item" :class="{ active: activeTab === 'student-rating' }" @click="setActiveTabMobile('student-rating')">
          <i class="material-icons">leaderboard</i> РЕЙТИНГ СТУДЕНТОВ
        </a>
      </div>
    </header>

    <!-- Модальное окно авторизации -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true" ref="loginModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="loginModalLabel">Авторизация</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="loginError" class="alert alert-danger">{{ loginError }}</div>
            <div class="mb-3">
              <label for="username" class="form-label">Электронная почта</label>
              <input type="text" class="form-control" id="username" v-model="loginForm.email" 
                     :disabled="loginLoading" placeholder="Введите электронную почту">
            </div>
            <div class="mb-3">
              <label for="password" class="form-label">Пароль</label>
              <input type="password" class="form-control" id="password" v-model="loginForm.password"
                     :disabled="loginLoading" placeholder="Введите пароль">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" :disabled="loginLoading">Отмена</button>
            <button type="button" class="btn btn-primary" @click="login" :disabled="loginLoading">
              <span v-if="loginLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Войти
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-5 pt-5"> 
      <!-- Индикатор загрузки и ошибок теперь управляются дочерними компонентами -->
      <!--
      <div v-if="isLoading" class="alert alert-info">Загрузка данных...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      -->

      <template v-if="!globalLoading && !globalError">
        <keep-alive>
          <component
            :is="currentViewComponent"
            :filter-options="filterOptions"
            :chart-options="chartOptions"
            :rating-chart-options="ratingChartOptions"
          ></component>
        </keep-alive>
      </template>
      <div v-if="globalLoading" class="alert alert-info text-center">Загрузка базовых данных...</div>
      <div v-if="globalError" class="alert alert-danger text-center">{{ globalError }}</div>
    </div>
  </div>
</template>

<script setup>

  // test commit 2
import { ref, reactive, computed, watch, onMounted, provide, defineAsyncComponent, nextTick } from 'vue';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import { Modal } from 'bootstrap';

const API_BASE_URL = '/api';
// const DJANGO_SERVER_URL = 'http://localhost:8000'; 
const DJANGO_SERVER_URL = '';
const LOGIN_PATH = '/login/'; 
const TOKEN_REFRESH_PATH = '/auth/token/refresh/';

const StatisticsView = defineAsyncComponent(() => import('./views/StatisticsView.vue'));
const AcademicLeaveView = defineAsyncComponent(() => import('./views/AcademicLeaveView.vue'));
const SubjectStatsView = defineAsyncComponent(() => import('./views/SubjectStatsView.vue'));
const StudentRatingView = defineAsyncComponent(() => import('./views/StudentRatingView.vue'));

const activeTab = ref('statistics');
const globalLoading = ref(true);
const globalError = ref(null);

const isAuthenticated = ref(false);
const accessToken = ref(localStorage.getItem('accessToken') || null);
const refreshToken = ref(localStorage.getItem('refreshToken') || null);
const userData = ref(JSON.parse(localStorage.getItem('userData')) || { name: '', email: '' });
const loginForm = reactive({ email: '', password: '' });
const loginError = ref(null);
const loginLoading = ref(false);
const loginModalRef = ref(null);
let loginModal = null;

const filterOptions = reactive({
    courses: [1, 2, 3, 4],
    semesters: [ { value: '1', name: '1' }, { value: '2', name: '2' }, { value: '3', name: '3' }, { value: '4', name: '4' }, { value: '5', name: '5' }, { value: '6', name: '6' }, { value: '7', name: '7' }, { value: '8', name: '8' } ].map(s => ({ value: s.value, name: `${s.name} семестр`})),
    groups: [],
    subjects: []
});

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true } },
    scales: { y: { beginAtZero: true } }
});
const ratingChartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' }, tooltip: { enabled: true } },
    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
});

const mobileMenuOpen = ref(false);


const fetchData = async (url, options = {}, isRetry = false) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    };

    if (accessToken.value) { 
      headers['Authorization'] = `Bearer ${accessToken.value}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401 && !isRetry && refreshToken.value && url !== `${API_BASE_URL}${LOGIN_PATH}`) {
        console.warn("Access token possibly expired, attempting to refresh...");
        try {
          const newTokens = await refreshAccessToken();
          if (newTokens && newTokens.access) {
            console.log("Token refreshed, retrying original request.");
            return await fetchData(url, options, true);
          } else {
            console.error("Failed to refresh token (new token not received or refresh failed). Logging out.");
            logoutAndShowLogin("Не удалось обновить сессию. Пожалуйста, войдите снова.");
            throw new Error("Не удалось обновить токен авторизации");
          }
        } catch (refreshError) {
          console.error("Error during token refresh process:", refreshError);
          logoutAndShowLogin("Ошибка обновления сессии. Пожалуйста, войдите снова.");
          throw refreshError;
        }
      }

      if (!response.ok) {
           let errorBody = null;
           try { errorBody = await response.json(); } catch(e) { }
           
           if (response.status === 401) {
             throw new Error("Необходима авторизация");
           }
           
           const errorDetail = errorBody?.detail || (Array.isArray(errorBody?.non_field_errors) ? errorBody.non_field_errors.join(', ') : null);
           const errorMsg = errorDetail || `Ошибка сети: ${response.status} ${response.statusText}`;
           console.error("Ошибка ответа API:", errorMsg, "для", url);
           if (response.status === 401 && (isRetry || !refreshToken.value) && isAuthenticated.value) {
               logoutAndShowLogin("Сессия недействительна. Пожалуйста, войдите снова.");
           }
           throw new Error(errorMsg);
      }
      if (response.status === 204) return null;
      return await response.json();
    } catch (err) {
      console.error('Общая ошибка при запросе к API:', url, err);
      if (!err.message.toLowerCase().includes("авторизац")) {
          // error.value = err.message; 
      }
      throw err;
    }
};
provide('fetchData', fetchData);
provide('API_BASE_URL', API_BASE_URL);

const setActiveTab = (tabName) => {
  activeTab.value = tabName;
};

const openLoginModal = () => {
  loginError.value = null;
  loginForm.email = '';
  loginForm.password = '';
  if (loginModal) {
    loginModal.show();
  }
};

const login = async () => {
  if (!loginForm.email || !loginForm.password) {
    loginError.value = "Введите email и пароль"; return;
  }
  loginLoading.value = true; loginError.value = null;
  try {
    // Исправлено: используем API_BASE_URL для консистентности с остальными запросами
    const response = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
    });
    if (!response.ok) {
      let errorData; try { errorData = await response.json(); } catch (e) {}
      loginError.value = errorData?.detail || (Array.isArray(errorData?.non_field_errors) ? errorData.non_field_errors.join(', ') : null) || "Неверный email или пароль";
      return;
    }
    const data = await response.json();
    if (data.access && data.refresh) {
      accessToken.value = data.access;
      refreshToken.value = data.refresh;
      userData.value = { name: data.name || loginForm.email, email: data.email || loginForm.email };
      isAuthenticated.value = true; 

      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('userData', JSON.stringify(userData.value));

      if (loginModal) loginModal.hide();
      loginForm.email = ''; loginForm.password = '';
      await loadFilterOptions(); 
    } else {
      loginError.value = "Ошибка: не получены токены от сервера.";
    }
  } catch (error) {
    loginError.value = "Ошибка при входе в систему: " + error.message;

    isAuthenticated.value = false; accessToken.value = null; refreshToken.value = null; userData.value = {};
    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('userData');
  } finally {
    loginLoading.value = false;
  }
};

const logout = async () => {
  accessToken.value = null; refreshToken.value = null; userData.value = {}; isAuthenticated.value = false;
  localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('userData');
  globalError.value = null;
  filterOptions.groups = []; filterOptions.subjects = []; 
  
  window.location.reload();
};


const logoutAndShowLogin = (message) => { logout(); setTimeout(() => { alert(message); openLoginModal(); }, 100); };

const refreshAccessToken = async () => {
  if (!refreshToken.value) { console.warn("No refresh token."); return null; }
  console.log("Refreshing access token...");
  try {
    const response = await fetch(`${API_BASE_URL}${TOKEN_REFRESH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken.value })
    });
    if (!response.ok) { console.error("Refresh token failed:", response.status); return null; }
    const data = await response.json();
    if (data.access) {
      accessToken.value = data.access; localStorage.setItem('accessToken', data.access);
      if (data.refresh) { refreshToken.value = data.refresh; localStorage.setItem('refreshToken', data.refresh); }
      console.log("Access token refreshed.");
      return data;
    }
    return null;
  } catch (error) { console.error("Error refreshing access token:", error); return null; }
};

const loadFilterOptions = async () => {
    globalLoading.value = true; globalError.value = null;
    console.log("App.vue: Attempting to load filter options. IsAuthenticated:", isAuthenticated.value);
    try {
        // Исправлено: используем API_BASE_URL для консистентности и поле 'name' вместо 'title'
        const groupsData = await fetchData(`${API_BASE_URL}/groups/`);
        if (groupsData) { 
            // StudentGroupSerializer возвращает поле 'name', а не 'title'
            filterOptions.groups = groupsData.map(g => g.name || g.title).filter(Boolean).sort(); 
        }
        else { console.warn("No group data received from /api/groups/ or error occurred."); filterOptions.groups = []; }

        // Исправлено: используем /api/disciplines/ вместо /api/disciples/
        // DisciplineSerializer возвращает объекты с полями 'discipline_id' и 'name'
        const subjectsData = await fetchData(`${API_BASE_URL}/disciplines/`);
        if (subjectsData) { 
            // Проверяем структуру ответа - DisciplineSerializer возвращает массив с полем 'name'
            if (Array.isArray(subjectsData) && subjectsData.length > 0) {
                filterOptions.subjects = subjectsData.map(d => d.name).filter(Boolean).sort(); 
            } else {
                filterOptions.subjects = [];
            }
        }
        else { console.warn("No subject data received from /api/disciplines/ or error occurred."); filterOptions.subjects = [];}

        console.log("App.vue: Filter options loaded (or attempted). Groups:", filterOptions.groups.length, "Subjects:", filterOptions.subjects.length);
    } catch (e) {
        console.error("App.vue: Error loading filter options:", e);
        globalError.value = `Не удалось загрузить опции для фильтров: ${e.message}`;
        if (e.message.toLowerCase().includes("авторизац") && !isAuthenticated.value) {
          setTimeout(() => { openLoginModal(); }, 200);
        }
    } finally {
        globalLoading.value = false;
    }
};

const currentViewComponent = computed(() => {
  switch (activeTab.value) {
    case 'statistics': return StatisticsView;
    case 'academic': return AcademicLeaveView;
    case 'subject-stats': return SubjectStatsView;
    case 'student-rating': return StudentRatingView;
    default: return null;
  }
});
const formattedUserName = computed(() => {
  if (!userData.value.name) return '';
  
  const parts = userData.value.name.split(' ');
  if (parts.length >= 3) {
    return `${parts[0].toUpperCase()} ${parts[1][0].toUpperCase()}.${parts[2][0].toUpperCase()}.`;
  }
  return userData.value.name.toUpperCase();
});

onMounted(() => {
  nextTick(() => { if (loginModalRef.value) { loginModal = new Modal(loginModalRef.value); }});

  const savedAccessToken = localStorage.getItem('accessToken');
  const savedRefreshToken = localStorage.getItem('refreshToken');
  const savedUserDataString = localStorage.getItem('userData');

  if (savedAccessToken && savedRefreshToken && savedUserDataString) {
    accessToken.value = savedAccessToken;
    refreshToken.value = savedRefreshToken;
    try {
      userData.value = JSON.parse(savedUserDataString);
      isAuthenticated.value = true; 
      console.log("Auth data restored. User:", userData.value.name || userData.value.email);
    } catch (e) {
      console.error("Error parsing saved user data from localStorage", e);
      logout(); 
    }
  }
  loadFilterOptions();
});

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const setActiveTabMobile = (tabName) => {
  setActiveTab(tabName);
  mobileMenuOpen.value = false;
};

</script>

<style>

@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

body {
  background-color: #f5f5f5; 
}

.main-content-area {
  padding-top: 65px; 
}

.istu-header { 
  background-color: #fff;
  color: #000; 
  height: 50px; 
  border-bottom: 1px solid #e0e0e0; 
  box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
  z-index: 1030;
  padding: 0 8px; 
}

.istu-toolbar {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 0; 
}

.istu-toolbar-title {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.istu-btn {
  display: inline-flex; 
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #000; 
  background-color: transparent;
  border: none;
  padding: 0 8px; 
  height: 100%;
  cursor: pointer;
  border-radius: 4px; 
  transition: background-color 0.2s ease;
}
.istu-btn:hover {
  background-color: rgba(0,0,0,0.04); 
}

.istu-btn-logo {
  padding: 0 4px;
}

.istu-avatar { 
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px; 
  height: 38px;
  border-radius: 50%; 
  overflow: hidden;
}
.istu-avatar img { 
  max-height: 100%; 
  width: auto;
  object-fit: contain;
}

.istu-btn-title-text {
  font-size: 1rem;
  font-weight: 500;
  margin-left: 8px;
  white-space: nowrap;
}

.istu-tabs {
  display: flex;
  align-items: stretch; 
  height: 100%;
  margin-left: 16px; 
  flex-grow: 1; 
  justify-content: flex-start; 
}

.istu-tab {
  display: flex;
  align-items: center;
  padding: 0 12px; 
  color: rgba(0,0,0,0.7);
  text-decoration: none;
  position: relative;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease, background-color 0.2s ease;
  border-bottom: 2px solid transparent; 
}
.istu-tab:hover {
  color: rgba(0,0,0,0.9);
  background-color: rgba(0,0,0,0.04);
}
.istu-tab.active {
  color: #1976d2; 
  border-bottom-color: #1976d2; 
}
.istu-tab .material-icons {
  margin-right: 6px;
  font-size: 1.25rem; 
}

.istu-toolbar-auth {
  margin-left: auto; 
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
}

.istu-user-dropdown-toggle {
  display: flex !important; 
  align-items: center;
  color: #000 !important;
  text-decoration: none;
  padding: 8px 4px !important; 
  height: 100%;
  font-size: 0.875rem;
  font-weight: 500;
}
.istu-user-dropdown-toggle::after {
  display: none !important; 
}
.istu-user-dropdown-toggle:hover {
  background-color: rgba(0,0,0,0.04);
  border-radius: 4px;
}
.istu-user-dropdown-toggle .material-icons {
  font-size: 1.25rem;
}
.istu-user-dropdown-toggle .user-name-display {
  margin: 0 4px;
  max-width: 150px; 
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.istu-dropdown-arrow {
  font-size: 1.5rem; 
}

.btn-istu-login {
  display: flex; 
  align-items: center; 
  background-color: #1976d2; 
  color: white; 
  border: none; 
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}
.btn-istu-login:hover { 
  background-color: #1565c0; 
}
.btn-istu-login .material-icons {
  margin-right: 4px;
}

.mobile-menu-toggle {
  padding: 0 8px;
  z-index: 1031;
}
.mobile-menu-toggle .btn {
  padding: 0;
  line-height: 1;
}
.mobile-menu-toggle .material-icons {
  font-size: 28px; 
}

.mobile-menu {
  position: fixed;
  top: 50px; 
  left: 0;
  width: 100%;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1029; 
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}
.mobile-menu-open {
  max-height: calc(100vh - 50px); 
  overflow-y: auto;
  border-top: 1px solid #e0e0e0;
}
.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(0, 0, 0, 0.7);
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
.mobile-menu-item.active {
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.04);
}
.mobile-menu-item i {
  margin-right: 12px;
}

@media (min-width: 1550px) {
    .d-lg-none {
        display: none !important;
    }
}
@media (max-width: 1549px) { 
  .istu-tabs {
    display: none !important; 
  }
  
  .mobile-menu-toggle {
    display: block !important;
  }
  
  .istu-toolbar-title {
    flex-grow: 1;
    justify-content: center;
  }
  
  .istu-toolbar-auth {
    padding: 0;
  }
  

  .btn-istu-login .ms-1 {
    display: none !important;
  }
}

@media (max-width: 450px) {
  .istu-btn-title-text {
    font-size: 0.85rem; 
    max-width: 180px;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  
  .istu-avatar {
    width: 32px;
    height: 32px;
  }
}

.modal.show .modal-dialog {
    transform: none;
    padding-top: 50px;
}
.page-item.active .page-link {
  background-color: #1976d2;
  border-color: #1976d2;
  color: white;
}

.grade-cell { text-align: center; padding-right: 16px; font-weight: bold; }
.grade-5, .grade-зачет, .grade-Зачет, .grade-Зачёт, .grade-зачёт { background-color: rgb(180, 255, 169) !important; color: #0d6e00 !important; }
.grade-4 { background-color: rgb(218, 255, 157) !important; color: #3c7a00 !important; }
.grade-3 { background-color: rgb(255, 231, 169) !important; color: #ad7800 !important; }
.grade-2, .grade-незачет, .grade-Незачет, .grade-Незачёт, .grade-незачёт { background-color: rgba(239, 83, 80, 0.2) !important; color: #b71c1c !important; }
.grade-A { background-color: rgb(180, 255, 169) !important; color: #0d6e00 !important; }
.grade-B { background-color: rgb(218, 255, 157) !important; color: #3c7a00 !important; }
.grade-C { background-color: rgb(255, 231, 169) !important; color: #ad7800 !important; }
.grade-D { background-color: rgb(255, 189, 169) !important; color: #ad3500 !important; }
.grade-F { background-color: rgba(239, 83, 80, 0.2) !important; color: #b71c1c !important; }
.grade-badge { display: inline-flex; align-items: center; vertical-align: middle; border-radius: 16px; outline: 0; position: relative; height: 2em; max-width: 100%; margin: 4px; font-size: 14px; padding: .5em .9em; white-space: nowrap; margin-left: auto; }
.grade-excellent { background-color: rgb(180, 255, 169) !important; }
.grade-good { background-color: rgb(218, 255, 157) !important; }
.grade-satisfactory { background-color: rgb(255, 231, 169) !important; }
.grade-unsatisfactory { background-color: rgba(239, 83, 80, 0.2) !important; }
.badge { padding: 0.5em 1em; border-radius: 1rem; font-weight: normal; }
.bg-success { background-color: rgba(40, 167, 69, 0.2) !important; color: #28a745 !important; }
.bg-warning { background-color: rgba(255, 193, 7, 0.2) !important; color: #ffc107 !important; }
.bg-danger { background-color: rgba(220, 53, 69, 0.2) !important; color: #dc3545 !important; }
</style>
