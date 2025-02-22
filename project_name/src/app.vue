<template>
  <div class="app">
    <h1>Страница с постами</h1>
    <div class="app__btns">
      <MyButton @click="showDialog">Создать пост</MyButton>
      <MySelect v-model="selectedSort" :options="sortOptions" />
    </div>

    <MyDialog v-model:show="dialogVisible">
      <PostForm @create="createPost" />
    </MyDialog>

    <PostList :posts="posts" @remove="removePost" v-if="!isPostsLoading" />
    <div v-else>Идет загрузка...</div>

    <div>
      <h2>График посещений</h2>
      <ChartComponent
        :chartData="filteredChartData"
        :chartOptions="chartOptions"
        @subject-click="handleSubjectClick"
      />
    </div>

    <MyDialog v-model:show="groupDialogVisible">
      <h3>Выберите учебную группу для предмета: {{ selectedSubject }}</h3>
      <MySelect v-model="selectedGroup" :options="groupOptions" />
      <MyButton @click="showStudents">Показать студентов</MyButton>
    </MyDialog>

    <div>
      <h3>Студенты группы {{ selectedGroup }} по предмету: {{ selectedSubject }}</h3>
      <ul>
        <li v-for="(student, index) in selectedStudents" :key="index">
          <span class="clickable" @click="showOptions(student)">
            {{ student.name }}
          </span> 
          - Средний балл: {{ calculateAverage(student.grade) }}
        </li>
      </ul>
    </div>

    <MyDialog v-model:show="studentDialogVisible">
  <h3>{{ dialogTitle }}</h3>
  <div>
    <label for="action-select">Выберите действие:</label>
    <select id="action-select" v-model="selectedAction" @change="handleActionChange">
      <option value="" disabled>Выберите...</option>
      <option value="grades">Оценки</option>
      <option value="attendance">Количество посещенных занятий</option>
      <option value="debts">Количество долгов</option>
    </select>
  </div>

  <div v-if="dialogType === 'grades'">
    <table>
      <thead>
        <tr>
          <th>Оценка</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(grade, index) in selectedStudent?.grade || []" :key="index">
          <td>{{ grade }}</td>
        </tr>
      </tbody>
    </table>
    <p>Средний балл: {{ calculateAverage(selectedStudent?.grade || []) }}</p>
    <ChartComponent
      v-if="gradesChartData"
      :chartData="gradesChartData"
      :chartOptions="gradesChartOptions"
    />
  </div>

  <div v-else-if="dialogType === 'attendance'">
    <p>Количество посещенных занятий: {{ getAttendance(selectedStudent?.name) }}</p>
  </div>

  <div v-else-if="dialogType === 'debts'">
    <p>Количество долгов: {{ calculateDebts(selectedStudent?.grade || []) }}</p>
  </div>
</MyDialog>

  </div>
</template>




<script>
import PostForm from "@/comp/PostForm.vue";
import PostList from "@/comp/PostList.vue";
import MyButton from "./comp/UI/MyButton.vue";
import MySelect from "./comp/UI/MySelect.vue";
import MyDialog from "./comp/UI/MyDialog.vue";
import ChartComponent from "./comp/ChartComponent.vue";

export default {
  components: {
    PostList,
    PostForm,
    MyButton,
    MySelect,
    MyDialog,
    ChartComponent,
  },

  data() {
    return {
      posts: [],
      dialogVisible: false,
      isPostsLoading: false,
      selectedSort: "",
      sortOptions: [
        { name: "По названию", value: "title" },
        { name: "По содержанию", value: "body" },
      ],
      chartData: {
        type: "bar",
        data: {
          labels: ["Математика", "Физика", "Программирование", "История", "Английский"],
          datasets: [
            {
              label: "Количество посещенных занятий",
              data: [10, 8, 9, 7, 5],
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
      },
      chartOptions: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
      studentsData: {
        Математика: {
          "ЭВМб-22-1": [
            { name: "Дагонов Иван", grade: [5, 4, 3, 3] },
            { name: "Иванова Мария", grade: [5, 4, 2, 5] },
            { name: "Никитин Николай", grade: [4, 4, 2, 3] },
            { name: "Моспанюк Ольга", grade: [4, 4, 2, 5] },
            { name: "Угарин Геральд", grade: [4, 5, 3, 3] },
            { name: "Петров Никита", grade: [3, 3, 3, 2] },
          ],
        },
      },
      selectedSubject: null,
      selectedGroup: null,
      groupOptions: [],
      selectedStudents: [],
      groupDialogVisible: false,
      studentDialogVisible: false,
      dialogTitle: "",
      dialogType: "",
      selectedStudent: null,
      attendanceData: {
        "Дагонов Иван": 10,
        "Иванова Мария": 8,
        "Никитин Николай": 9,
        "Моспанюк Ольга": 7,
        "Угарин Геральд": 5,
        "Петров Никита": 3,
      },
      attendanceWeeklyData: {
        "Дагонов Иван": [3, 2, 4, 1],
        "Иванова Мария": [2, 3, 3, 0],
        "Никитин Николай": [4, 1, 2, 2],
        "Моспанюк Ольга": [2, 2, 3, 0],
        "Угарин Геральд": [1, 1, 2, 1],
        "Петров Никита": [0, 2, 1, 0],
      },
      selectedAction: "",
      gradesChartData: null,
      gradesChartOptions: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    };
  },

  computed: {
    filteredChartData() {
      return this.chartData;
    },
  },

  methods: {
    calculateAverage(grades) {
      if (!Array.isArray(grades) || grades.length === 0) {
        return 0;
      }
      const total = grades.reduce((sum, grade) => sum + grade, 0);
      return (total / grades.length).toFixed(2);
    },
    calculateDebts(grades) {
      return grades.filter((grade) => grade < 3).length;
    },
    getAttendance(name) {
      return this.attendanceData[name] || 0;
    },
    createPost(post) {
      this.posts.push(post);
      this.dialogVisible = false;
    },
    removePost(post) {
      this.posts = this.posts.filter((p) => p.id !== post.id);
    },
    showDialog() {
      this.dialogVisible = true;
    },
    handleSubjectClick({ subject }) {
      this.selectedSubject = subject;

      const groups = this.studentsData[subject] || {};
      this.groupOptions = Object.keys(groups).map((group) => ({
        name: group,
        value: group,
      }));
      this.groupDialogVisible = true;
    },
    showStudents() {
      if (this.selectedGroup && this.selectedSubject) {
        this.selectedStudents =
          this.studentsData[this.selectedSubject][this.selectedGroup] || [];

        if (this.selectedStudents.length > 0) {
          this.groupDialogVisible = false;
        } else {
          alert("Нет студентов для выбранной группы и предмета.");
        }
      } else {
        alert("Пожалуйста, выберите группу и предмет.");
      }
    },
    showOptions(student) {
      this.selectedStudent = student;
      this.dialogTitle = `Статистика студента: ${student.name}`;
      this.selectedAction = ""; // Сброс действия
      this.studentDialogVisible = true;
    },
    handleActionChange() {
      if (this.selectedAction === "grades") {
        this.dialogType = "grades";
        this.dialogTitle = `Оценки студента: ${this.selectedStudent.name}`;
        this.updateGradesChart(this.selectedStudent.grade);
      } else if (this.selectedAction === "attendance") {
        this.dialogType = "attendance";
        this.dialogTitle = `Посещения студента: ${this.selectedStudent.name}`;
      } else if (this.selectedAction === "debts") {
        this.dialogType = "debts";
        this.dialogTitle = `Долги студента: ${this.selectedStudent.name}`;
      } else {
        this.dialogType = "";
        this.dialogTitle = "";
      }
    },
    updateGradesChart(grades) {
      if (!Array.isArray(grades) || grades.length === 0) {
        this.gradesChartData = null;
        return;
      }
      this.gradesChartData = {
        type: "bar",
        data: {
          labels: grades.map((_, index) => `Оценка ${index + 1}`),
          datasets: [
            {
              label: "Оценки",
              data: grades,
              backgroundColor: "rgba(153, 102, 255, 0.6)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 1,
            },
          ],
        },
      };
    },
  },
};
</script>



<style>
* {
  margin: 5px;
  padding: 5px;
  box-sizing: border-box;
}
.app {
  padding: 10px;
}

.app__btns {
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
}

.clickable {
  cursor: pointer;
  transition: color 0.3s, background-color 0.3s;
}

.clickable:hover {
  color: #007bff;
  background-color: #f0f8ff; 
}


.dialog-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.grades-table {
  width: 50%;
}

.grades-chart {
  width: 50%;
}
</style>


