import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import PostsPage from '../views/PostsPage.vue'
import ProjectsPage from '../views/ProjectsPage.vue'
import CategoriesPage from '../views/CategoriesPage.vue'
import CategoryPage from '../views/CategoryPage.vue'
import AboutPage from '../views/AboutPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/posts', name: 'posts', component: PostsPage },
  { path: '/projects', name: 'projects', component: ProjectsPage },
  { path: '/categories', name: 'categories', component: CategoriesPage },
  { path: '/categories/:id', name: 'category', component: CategoryPage },
  { path: '/about', name: 'about', component: AboutPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
