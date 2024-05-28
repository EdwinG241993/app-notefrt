import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/HomeView.vue'
import store from '../store/store';

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: () => import(/* webpackChunkName: "login" */ '../views/LoginView.vue')
    },
    {
      path: '/nota',
      name: 'nota',
      component: () => import(/* webpackChunkName: "nota" */ '../views/NotasView.vue'),
      meta: { requireAuth: true }
    }
  ]
});

router.beforeEach((to, from, next) => {
  const rutaProtegida = to.matched.some(record => record.meta.requireAuth);

  if (rutaProtegida && store.state.token === '') {
    next({ name: 'login' })

  } else {
    next()
  }

})

export default router
