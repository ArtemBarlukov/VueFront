<template>
    <div class="post">
        <div>
            <div><strong>Название:</strong>{{post.title}}</div>
            <div><strong>Описание:</strong>{{post.body}}</div>
        </div>
        
        <div>
            <div class="post__btn">
                <MyButton @click="$emit('remove', post)">Удалить</MyButton>
            </div>
        </div>
        
   </div>
</template>

<script>


export default {
    props: {
        post: {
            type: Object,
            required: true,
        }
    }
}
</script>

<style scoped>
.post {
    padding: 10px;
    border: 1px solid cornflowerblue;
    margin-top: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>