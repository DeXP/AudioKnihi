import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
  { path: '/book/:author/:slug', name: 'book-detail', component: () => import('@/views/BookDetailView.vue') }
]

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})