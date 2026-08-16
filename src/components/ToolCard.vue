<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import FavoriteButton from './FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';

const props = defineProps<{ tool: Tool & { category: string } }>();
const { tool } = toRefs(props);
const theme = useThemeVars();
</script>

<template>
  <router-link :to="tool.path" class="decoration-none group">
    <c-card class="h-full !border-1px transition-all duration-200 ease-out group-hover:-translate-y-1px group-hover:border-emerald-500/60 dark:group-hover:border-emerald-500/50 group-hover:shadow-sm">
      <div flex items-center justify-between>
        <div class="h-10 w-10 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors duration-200 dark:bg-neutral-800/80 dark:text-neutral-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          <n-icon size="22" :component="tool.icon" />
        </div>

        <div flex items-center gap-8px>
          <div
            v-if="tool.isNew"
            class="rounded-full bg-emerald-500 px-2 py-0.5 text-10px font-medium text-white tracking-wide uppercase dark:text-neutral-900"
          >
            {{ $t('toolCard.new') }}
          </div>

          <FavoriteButton :tool="tool" />
        </div>
      </div>

      <div class="truncate my-8px text-base font-600 text-neutral-900 tracking-tight dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
        {{ tool.name }}
      </div>

      <div class="line-clamp-2 text-13px text-neutral-500 leading-relaxed dark:text-neutral-400">
        {{ tool.description }}
      </div>
    </c-card>
  </router-link>
</template>
