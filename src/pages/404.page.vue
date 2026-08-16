<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({ title: 'Page not found - IT Tools' });
</script>

<template>
  <div class="mx-auto max-w-500px px-4 py-16 text-center">
    <div class="mb-4 inline-flex items-center justify-center rounded-2xl bg-emerald-500/10 p-6 text-emerald-500 dark:bg-emerald-500/20">
      <icon-mdi:compass-off-outline class="text-64px" />
    </div>

    <h1 class="mb-2 text-28px text-neutral-800 font-bold dark:text-neutral-100">
      {{ $t('404.notFound') }}
    </h1>

    <p class="mb-1 text-sm text-neutral-500 dark:text-neutral-400">
      {{ $t('404.sorry') }}
    </p>

    <p class="mb-6 text-xs text-neutral-400 dark:text-neutral-500">
      {{ $t('404.maybe') }}
    </p>

    <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <c-button to="/" type="primary">
        <icon-mdi:home-outline mr-1 text-16px />
        {{ $t('404.backHome') }}
      </c-button>
    </div>
  </div>
</template>
