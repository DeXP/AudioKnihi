<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <aside class="w-full lg:w-64 bg-base-200 p-4 rounded-xl space-y-4">
      <input v-model="catalog.query" placeholder="Пошук..." class="input input-bordered w-full" />
      
      <select v-model="catalog.filterGenre" class="select select-bordered w-full">
        <option :value="null">Усе жанры</option>
        <option v-for="g in uniqueGenres" :key="g" :value="g">{{ g }}</option>
      </select>
      
      <select v-model="catalog.filterAuthor" class="select select-bordered w-full">
        <option :value="null">Усе аўтары</option>
        <option v-for="a in uniqueAuthors" :key="a.slug" :value="a.slug">{{ a.name }}</option>
      </select>
      
      <select v-model="catalog.sortBy" class="select select-bordered w-full">
        <option value="title_asc">Назва А-Я</option>
        <option value="title_desc">Назва Я-А</option>
        <option value="author_asc">Аўтар А-Я</option>
        <option value="author_desc">Аўтар Я-А</option>
        <option value="length_asc">Даўжыня ↑</option>
        <option value="length_desc">Даўжыня ↓</option>
        <option value="random">🎲 Выпадкова</option>
      </select>
    </aside>

    <!-- Loading State -->
    <div v-if="catalog.books.length === 0" class="flex-1 flex items-center justify-center py-20">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>
    
    <!-- Book Grid -->
    <div v-else class="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <BookCard v-for="book in catalog.processed" :key="book.slug" :book="book" />
    </div>
  </div>
</template>

<script setup>
import { useCatalogStore } from '@/stores/catalog'
import BookCard from '@/components/BookCard.vue'
import { onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const catalog = useCatalogStore()
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  await catalog.loadCatalog()
  // ✅ Apply filters from URL on load
  if (route.query.genre) catalog.filterGenre = route.query.genre
  if (route.query.author) catalog.filterAuthor = route.query.author
  if (route.query.sort) catalog.sortBy = route.query.sort
  if (route.query.q) catalog.query = route.query.q
})

// ✅ Sync filters to URL
watch(
  [() => catalog.filterGenre, () => catalog.filterAuthor, () => catalog.sortBy, () => catalog.query],
  () => {
    const query = {}
    if (catalog.filterGenre) query.genre = catalog.filterGenre
    if (catalog.filterAuthor) query.author = catalog.filterAuthor
    if (catalog.sortBy !== 'title_asc') query.sort = catalog.sortBy
    if (catalog.query) query.q = catalog.query
    router.replace({ query })
  },
  { deep: true }
)

const uniqueGenres = computed(() => {
  const genres = new Set()
  catalog.books.forEach(b => b.genres?.forEach(g => genres.add(g)))
  return Array.from(genres).sort((a, b) => a.localeCompare(b, 'be'))
})

const uniqueAuthors = computed(() => {
  const map = new Map()
  catalog.books.forEach(b => {
    if (b.author_slug && !map.has(b.author_slug)) {
      map.set(b.author_slug, { name: b.author, slug: b.author_slug })
    }
  })
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'be'))
})
</script>