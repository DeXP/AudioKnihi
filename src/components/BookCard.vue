<template>
  <router-link 
    :to="{ name: 'book-detail', params: { author: book.author_slug, slug: book.slug } }" 
    class="card bg-base-200 hover:shadow-lg transition cursor-pointer group"
  >
    <figure class="aspect-square overflow-hidden rounded-t-xl bg-base-300">
      <img :src="`book/${book.cover}`" :alt="book.title" class="w-full h-full object-cover group-hover:scale-105 transition" loading="lazy" />
    </figure>
    <div class="card-body p-3">
      <h2 class="card-title text-sm line-clamp-2">{{ book.title }}</h2>
      <p class="text-xs text-base-content/70">{{ book.author }}</p>
      <div class="flex gap-1 mt-1">
        <span v-for="g in book.genres?.slice(0, 2)" :key="g" class="badge badge-ghost text-[10px]">{{ g }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({ book: Object })
</script>