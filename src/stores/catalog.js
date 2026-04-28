import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCatalogStore = defineStore('catalog', () => {
  const books = ref([])
  const query = ref('')
  const filterGenre = ref(null)
  const filterAuthor = ref(null)
  const sortBy = ref('title_asc')

  const loadCatalog = async () => {
    const res = await fetch('catalog.json')
    if (!res.ok) throw new Error(`Failed to load catalog: ${res.status}`)
    const data = await res.json()
    
    // Handle trailing spaces in JSON keys & values safely
    const rawBooks = data["books "] || data.books || []
    books.value = rawBooks.map(b => {
      const clean = {}
      for (const k in b) {
        const cleanKey = k.trim()
        const val = b[k]
        clean[cleanKey] = typeof val === 'string' ? val.trim() : val
      }
      return clean
    })
  }

  const processed = computed(() => {
    let list = [...books.value]

    // Search
    if (query.value) {
      const q = query.value.toLowerCase()
      list = list.filter(b => 
        b.title?.toLowerCase().includes(q) || 
        b.author?.toLowerCase().includes(q) ||
        b.genres?.some(g => g.toLowerCase().includes(q))
      )
    }

    // Filters
    if (filterGenre.value) list = list.filter(b => b.genres?.includes(filterGenre.value))
    if (filterAuthor.value) list = list.filter(b => b.author_slug === filterAuthor.value)

    // Sort
    const [field, dir] = sortBy.value.split('_')
    if (field === 'random') {
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[list[i], list[j]] = [list[j], list[i]]
      }
    } else {
      list.sort((a, b) => {
        let valA = a[field] ?? ''
        let valB = b[field] ?? ''
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        return dir === 'asc' 
          ? String(valA).localeCompare(String(valB), 'be') 
          : String(valB).localeCompare(String(valA), 'be')
      })
    }

    return list
  })

  return { books, query, filterGenre, filterAuthor, sortBy, processed, loadCatalog }
})