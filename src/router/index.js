import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import MyCollection from '../views/MyCollection.vue'
import Relations from '../views/Relations.vue'
import SearchPage from '../views/SearchPage.vue'
import RecordDetails from '../views/RecordDetails.vue'
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
    path: '/collection',
    name: 'MyCollection',
    component: MyCollection,
    beforeEnter: requireAuth
  },
  {
    path: '/relations',
    name: 'Relations',
    component: Relations,
    beforeEnter: requireAuth
  },
  {
    path: '/search',
    name: 'SearchPage',
    component: SearchPage,
    beforeEnter: requireAuth
  },
  {
    path: '/records/:releaseID',
    name: 'RecordDetails',
    component: RecordDetails,
    props: true
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
