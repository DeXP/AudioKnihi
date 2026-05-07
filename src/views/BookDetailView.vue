<template>
  <div class="max-w-6xl mx-auto p-4 space-y-6">
    <!-- Loading / Error -->
    <div v-if="loading" class="flex justify-center py-20"><span class="loading loading-spinner loading-lg"></span></div>
    <div v-else-if="error" class="alert alert-error">
      <span>❌ {{ error }}</span>
      <button class="btn btn-sm" @click="loadBook">Паўтарыць</button>
    </div>

    <!-- Book Detail -->
    <div v-else-if="book" class="grid md:grid-cols-3 gap-6">
      <!-- Cover (clickable for modal) -->
      <div class="md:col-span-1">
        <div 
          @click="showModal = true" 
          class="aspect-square overflow-hidden rounded-xl bg-base-200 cursor-zoom-in hover:ring-2 ring-primary transition"
        >
          <img :src="`book/${book.cover}`" :alt="book.title" class="w-full h-full object-cover" />
        </div>
        <div v-if="book.narrators?.length" class="mt-4 text-sm">
          <span class="font-medium">Аўдыякнігу чытае:</span>
          <p v-for="n in book.narrators" :key="n" class="text-base-content/70">{{ n }}</p>
        </div>
      </div>

      <!-- Info -->
      <div class="md:col-span-2 space-y-4">
        <div>
          <h1 class="text-2xl font-bold">{{ book.title }}</h1>
          <router-link 
            :to="{ path: '/', query: { author: book.author_slug } }"
            class="text-lg text-base-content/70 hover:text-primary transition-colors cursor-pointer no-underline inline-block mt-1"
          >
            {{ book.author }}
          </router-link>
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <router-link 
            v-for="g in book.genres" 
            :key="g"
            :to="{ path: '/', query: { genre: g } }"
            class="badge badge-outline hover:badge-primary cursor-pointer transition-colors"
          >
            {{ g }}
          </router-link>
        </div>

        <p class="text-base-content/80 leading-relaxed">{{ book.description }}</p>

        <div class="flex gap-4 text-sm text-base-content/60">
          <span>⏱ {{ formatDuration(book.length) }}</span>
          <span v-if="book.series">📚 {{ book.series }}{{ book.series_num ? ` #${book.series_num}` : '' }}</span>
        </div>

        <!-- External Source Link -->
        <div v-if="book.source" class="pt-2">
          <a
            :href="book.source"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-sm btn-outline gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
            Крыніца: {{ getSourceDomain(book.source) }}
          </a>
        </div>
      </div>
    </div>

    <!-- Back button -->
    <div class="pt-4">
      <router-link to="/" class="btn btn-ghost">← Вярнуцца да каталога</router-link>
    </div>

    <!-- ✅ Full-size Cover Modal -->
    <dialog id="cover_modal" class="modal" :open="showModal" @click.self="showModal = false">
      <div class="modal-box w-11/12 max-w-3xl p-0 overflow-hidden">
        <div class="relative">
          <img :src="`book/${book.cover}`" :alt="book.title" class="w-full h-auto" />
          <button 
            @click="showModal = false"
            class="btn btn-sm btn-circle btn-ghost absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70"
          >
            ✕
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="showModal = false"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'

const route = useRoute()
const catalog = useCatalogStore()
const book = ref(null)
const loading = ref(true)
const error = ref(null)
const showModal = ref(false) // ✅ For cover modal

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return '0хв'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0 ? `${h}г ${m}хв` : `${m}хв ${s}с`
}

const loadBook = async () => {
  loading.value = true
  error.value = null
  try {
    const { author, slug } = route.params
    const path = `book/${author}/${slug}.json`
    const res = await fetch(path)
    if (!res.ok) throw new Error(`Не атрымалася загрузіць: ${path}`)
    const raw = await res.json()
    const clean = {}
    for (const k in raw) clean[k.trim()] = typeof raw[k] === 'string' ? raw[k].trim() : raw[k]
    book.value = clean
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const getSourceDomain = (url) => {
  if (!url) return null
  try {
    const hostname = new URL(url).hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

onMounted(() => {
  if (catalog.books.length === 0) catalog.loadCatalog().then(loadBook).catch(loadBook)
  else loadBook()
})
</script>