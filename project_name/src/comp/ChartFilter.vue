<template>
  <div>
    <h3>Фильтр по категориям</h3>
    <select @change="updateCategory($event.target.value)">
      <option value="">Все категории</option>
      <option v-for="(category, index) in categories" :key="index" :value="category">{{ category }}</option>
    </select>
  </div>
</template>

<script>
export default {
  props: {
    categories: Array,
  },
  methods: {
    
    updateCategory(category) {
      this.$emit('update-category', category); 
    },
  },
};
</script>
