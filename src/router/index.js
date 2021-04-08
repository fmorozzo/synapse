import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import Dashboard from '../views/Dashboard.vue'
import { projectAuth } from '../firebase/config'

//Auth guard
const requireAuth = (to, from, next) => {
  let user = projectAuth.currentUser
  console.log('current user in auth guard: ', user)
  if(!user){
    next({ name: 'Welcome' })
  } else {
    next()
  }
}

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: Welcome
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
