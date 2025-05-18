<template>
  <div class="d-flex justify-content-center align-items-center my-3">
    <label class="me-2">Записей на странице:</label>
    <select class="form-select form-select-sm" style="width: auto;" v-model="perPage" @change="onChange">
      <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
    </select>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    default: 25
  },
  options: {
    type: Array,
    default: () => [10, 25, 50, 100]
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const perPage = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
  perPage.value = newValue;
});

const onChange = () => {
  emit('update:modelValue', perPage.value);
  emit('change', perPage.value);
};
</script> 