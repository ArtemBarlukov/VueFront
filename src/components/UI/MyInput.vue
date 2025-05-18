<template>
    <input :value="modelValue" @input="updateInput" class="input" type="text">
</template>

<script>
export default {
 name: 'MyInput',
 props: {
     modelValue: [String, Number]
 },
 methods: {
    updateInput(event){
        this.$emit('update:modelValue', event.target.value)
    }
 }
}
</script>

<style scoped>
  .input {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid cornflowerblue;
    margin-top: 5px;
  }
</style>