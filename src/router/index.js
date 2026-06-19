import { createRouter, createWebHistory } from 'vue-router'
import AboutPage from '../views/AboutPage.vue'
import PostsPage from '../views/PostsPage.vue'
import ProjectsPage from '../views/ProjectsPage.vue'
import CategoriesPage from '../views/CategoriesPage.vue'
import CategoryPage from '../views/CategoryPage.vue'

const routes = [
  { path: '/', name: 'about', component: AboutPage },
  { path: '/posts', name: 'posts', component: PostsPage },
  { path: '/projects', name: 'projects', component: ProjectsPage },
  { path: '/categories', name: 'categories', component: CategoriesPage },
  { path: '/categories/:id', name: 'category', component: CategoryPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
