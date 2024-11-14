import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import Root from '../views/Root.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/:id',
    name: 'Root',
    component: Root,
  },
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
