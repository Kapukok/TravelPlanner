import {createApp} from 'vue'
import {createRouter, createWebHashHistory} from 'vue-router'
import './style.css'
import App from './App.vue'
import FirstPage from './components/FirstPage.vue'
import InteractPage from './components/InteractPage.vue'

const routes = [
  {path: '/', component: FirstPage, name: 'FirstPage'},
  {path: '/interact', component: InteractPage, name: 'InteractPage'}
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.mount('#app')
