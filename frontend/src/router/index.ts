import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Root from '../views/Root.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Root',
    component: Root
  },
  {
    path: '/:id',
    name: 'RootWithId',
    component: Root
  },
  {
    path: '*',
    redirect: '/'  // Redirect any unmatched routes to home
  }
];

const router = new VueRouter({
  mode: 'history',  // Make sure history mode is enabled
  base: process.env.BASE_URL,
  routes
});

// Optional: Add navigation guard to handle route changes
router.beforeEach((to, from, next) => {
  next();
});

export default router;
