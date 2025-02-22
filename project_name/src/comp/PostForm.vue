<template>
    

   <form @submit.prevent>
       <h4>Создание поста</h4>
       <MyInput v-model="post.title" type="text" placeholder="Название"></MyInput>
        <MyInput v-model="post.body" type="text" placeholder="Описание"></MyInput>
       <MyButton class="btn" @click="createPost" style="align-self: flex-end">Создать</MyButton>
     </form>
</template>


<script>

 export default {
        
        data(){
            return {
                post: {
                    title: '',
                    body: ''
                }
            }
        },
        methods:{
            createPost(){
                this.post.id = Date.now();
                this.$emit('create', this.post)
                this.post = {
                    title: '',
                    body: ''
                }
               
            }
        }
    }
</script>


<style scoped>
  form{
    display: flex;
    flex-direction: column;
  }

 

  
</style>