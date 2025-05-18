<template>
    <button class="btn">
        <slot></slot>
    </button>
</template>
 
<script>
export default {
 name: 'MyButton'
}
</script>

<style scoped>
.btn{
    padding: 15px;
    background: none;
    border: 1px solid cornflowerblue;
    color: black;
    font-size: 15px;
    font-weight: bold;
  }
</style>