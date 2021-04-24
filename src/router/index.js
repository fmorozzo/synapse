import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import SearchPage from '../views/SearchPage.vue'
import Records from '../views/Records.vue'
import Dashboard from '../views/Dashboard.vue'
import Circles from '../views/Circles.vue'
import Charts from '../views/Charts.vue'
import Marketplace from '../views/Marketplace.vue'
import MyCollection from '../views/MyCollection.vue'
import Account from '../views/settings/Account.vue'
import Notifications from '../views/settings/Notifications.vue'
import Settings from '../views/Settings.vue'
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
    component: Welcome,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    beforeEnter: requireAuth
  },
  {
    path: '/collection',
    name: 'MyCollection',
    component: MyCollection,
    beforeEnter: requireAuth
  },
  {
    path: '/circles',
    name: 'Circles',
    component: Circles,
    beforeEnter: requireAuth
  },
  {
    path: '/charts',
    name: 'Charts',
    component: Charts,
    beforeEnter: requireAuth
  },
  {
    path: '/marketplace',
    name: 'Marketplace',
    component: Marketplace,
    beforeEnter: requireAuth
  },
  {
    path: '/search',
    name: 'SearchPage',
    component: SearchPage,
    beforeEnter: requireAuth
  },
  {
    path: '/records',
    name: 'Records',
    component: Records,
    props: true,
    beforeEnter: requireAuth
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    props: true,
    beforeEnter: requireAuth,
    children: [
      {
        path: '',
        name: 'Account',
        component: Account,
        beforeEnter: requireAuth
      },
      {
        path: 'account',
        name: 'Account',
        component: Account,
        beforeEnter: requireAuth
      },
      {
        path: 'notifications',
        name: 'Notifications',
        component: Notifications,
        beforeEnter: requireAuth
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
