import { createApp } from "vue";
import App from "./app.vue";
import components from '@/comp/UI';


const app = createApp(App); 


components.forEach(component => {
    app.component(component.name, component); 
});


app.mount('#app');
n