<template>
  <nav aria-label="Навигация по страницам">
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <a class="page-link" href="#" @click.prevent="onPageChange(currentPage - 1)" aria-label="Предыдущая">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      
      <!-- Первая страница -->
      <li v-if="showFirstButton" class="page-item" :class="{ active: currentPage === 1 }">
        <a class="page-link" href="#" @click.prevent="onPageChange(1)">1</a>
      </li>
      
      <!-- Многоточие слева -->
      <li v-if="showLeftEllipsis" class="page-item disabled">
        <span class="page-link">...</span>
      </li>
      
      <!-- Центральные страницы -->
      <li v-for="page in displayedPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
        <a class="page-link" href="#" @click.prevent="onPageChange(page)">{{ page }}</a>
      </li>
      
      <!-- Многоточие справа -->
      <li v-if="showRightEllipsis" class="page-item disabled">
        <span class="page-link">...</span>
      </li>
      
      <!-- Последняя страница -->
      <li v-if="showLastButton && totalPages > 1" class="page-item" :class="{ active: currentPage === totalPages }">
        <a class="page-link" href="#" @click.prevent="onPageChange(totalPages)">{{ totalPages }}</a>
      </li>
      
      <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
        <a class="page-link" href="#" @click.prevent="onPageChange(currentPage + 1)" aria-label="Следующая">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisiblePages: {
    type: Number,
    default: 5
  }
});

const emit = defineEmits(['page-change']);

const onPageChange = (page) => {
  if (page < 1 || page > props.totalPages || page === props.currentPage) {
    return;
  }
  emit('page-change', page);
};

const displayedPages = computed(() => {
  if (props.totalPages <= props.maxVisiblePages) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1);
  }
  
  const halfVisiblePages = Math.floor(props.maxVisiblePages / 2);
  let startPage = props.currentPage - halfVisiblePages;
  let endPage = props.currentPage + halfVisiblePages;
  
  if (startPage < 2) {
    startPage = 2;
    endPage = Math.min(props.totalPages - 1, startPage + props.maxVisiblePages - 2);
  } else if (endPage >= props.totalPages) {
    endPage = props.totalPages - 1;
    startPage = Math.max(2, endPage - props.maxVisiblePages + 2);
  }
  
  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
});

const showFirstButton = computed(() => props.totalPages > 1);
const showLastButton = computed(() => props.totalPages > 1);
const showLeftEllipsis = computed(() => displayedPages.value.length > 0 && displayedPages.value[0] > 2);
const showRightEllipsis = computed(() => {
  return displayedPages.value.length > 0 && 
         displayedPages.value[displayedPages.value.length - 1] < props.totalPages - 1;
});
</script>

<style scoped>
.page-link {
  color: #1976d2;
}
.page-item.active .page-link {
  background-color: #1976d2;
  border-color: #1976d2;
}
.page-link:focus {
  box-shadow: 0 0 0 0.25rem rgba(25, 118, 210, 0.25);
}
</style>