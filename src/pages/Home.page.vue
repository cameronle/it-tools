<script setup lang="ts">
import { IconClock, IconDragDrop, IconHeart, IconTrash } from '@tabler/icons-vue';
import { useHead } from '@vueuse/head';
import { computed, ref } from 'vue';
import Draggable from 'vuedraggable';
import ToolCard from '../components/ToolCard.vue';
import { useToolStore } from '@/tools/tools.store';
import type { ToolWithCategory } from '@/tools/tools.types';

const toolStore = useToolStore();

useHead({ title: 'IT Tools - Handy online tools for developers' });
const { t } = useI18n();

const activeFilter = ref<'all' | 'favorites' | 'recent' | string>('all');

const favoriteTools = computed(() => toolStore.favoriteTools);
const recentTools = computed(() => toolStore.recentTools);

const categories = computed(() => {
  return toolStore.toolsByCategory.map(cat => ({
    name: cat.name,
    count: cat.components.length,
  }));
});

const displayedTools = computed(() => {
  if (activeFilter.value === 'all') {
    return [];
  }
  if (activeFilter.value === 'favorites') {
    return favoriteTools.value;
  }
  if (activeFilter.value === 'recent') {
    return recentTools.value;
  }
  const found = toolStore.toolsByCategory.find(cat => cat.name === activeFilter.value);
  return (found?.components as ToolWithCategory[]) || [];
});

// Update favorite tools order when drag is finished
function onUpdateFavoriteTools() {
  toolStore.updateFavoriteTools(favoriteTools.value);
}
</script>

<template>
  <div class="pb-40px pt-12px">
    <!-- Category Pills Filter Bar -->
    <div class="sticky top-0 z-20 mb-20px bg-white/70 px-2 py-10px backdrop-blur-md -mx-2 dark:bg-#09090b/80">
      <div class="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
        <button
          class="pill-btn"
          :class="{ active: activeFilter === 'all' }"
          @click="activeFilter = 'all'"
        >
          <span>{{ $t('home.categories.allTools') }}</span>
          <span class="pill-count">{{ toolStore.tools.length }}</span>
        </button>

        <button
          v-if="favoriteTools.length > 0"
          class="pill-btn"
          :class="{ active: activeFilter === 'favorites' }"
          @click="activeFilter = 'favorites'"
        >
          <n-icon :component="IconHeart" size="14" class="text-rose-500" />
          <span>{{ $t('home.categories.favoriteTools') }}</span>
          <span class="pill-count">{{ favoriteTools.length }}</span>
        </button>

        <button
          v-if="recentTools.length > 0"
          class="pill-btn"
          :class="{ active: activeFilter === 'recent' }"
          @click="activeFilter = 'recent'"
        >
          <n-icon :component="IconClock" size="14" class="text-amber-500" />
          <span>{{ $t('home.categories.recent', 'Recently Used') }}</span>
          <span class="pill-count">{{ recentTools.length }}</span>
        </button>

        <div class="h-4 w-1px bg-neutral-200 dark:bg-neutral-800" />

        <button
          v-for="cat in categories"
          :key="cat.name"
          class="pill-btn"
          :class="{ active: activeFilter === cat.name }"
          @click="activeFilter = cat.name"
        >
          <span>{{ cat.name }}</span>
          <span class="pill-count">{{ cat.count }}</span>
        </button>
      </div>
    </div>

    <div class="grid-wrapper">
      <!-- Filtered View when specific category is active -->
      <div v-if="activeFilter !== 'all'">
        <div class="mb-14px flex items-center justify-between">
          <h2 class="text-sm text-neutral-600 font-semibold tracking-wide uppercase dark:text-neutral-300">
            {{ activeFilter === 'favorites' ? $t('home.categories.favoriteTools') : activeFilter === 'recent' ? $t('home.categories.recent', 'Recently Used') : activeFilter }}
            <span class="ml-1 text-xs text-neutral-400 font-normal">({{ displayedTools.length }})</span>
          </h2>

          <button
            v-if="activeFilter === 'recent' && recentTools.length > 0"
            class="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-100 hover:text-rose-500 dark:hover:bg-neutral-800"
            @click="toolStore.clearRecentTools"
          >
            <n-icon :component="IconTrash" size="14" />
            <span>{{ $t('home.clearRecent', 'Clear') }}</span>
          </button>
        </div>

        <div v-if="displayedTools.length > 0" class="grid grid-cols-1 gap-14px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
          <ToolCard v-for="tool in displayedTools" :key="tool.name" :tool="tool" />
        </div>

        <div v-else class="py-40px text-center text-sm text-neutral-400">
          No tools in this category.
        </div>
      </div>

      <!-- Default Overview View (All) -->
      <div v-else>
        <!-- Recently Used Section -->
        <div v-if="recentTools.length > 0" class="mb-24px">
          <div class="mb-12px flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400">
              <n-icon :component="IconClock" size="15" class="text-amber-500" />
              <span>{{ $t('home.categories.recent', 'Recently Used') }}</span>
            </h3>

            <button
              class="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-rose-500 dark:hover:bg-neutral-800"
              @click="toolStore.clearRecentTools"
            >
              <n-icon :component="IconTrash" size="13" />
              <span>{{ $t('home.clearRecent', 'Clear') }}</span>
            </button>
          </div>

          <div class="grid grid-cols-1 gap-14px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
            <ToolCard v-for="tool in recentTools" :key="tool.name" :tool="tool" />
          </div>
        </div>

        <!-- Favorites Section -->
        <transition name="height">
          <div v-if="favoriteTools.length > 0" class="mb-24px">
            <h3 class="mb-12px flex items-center gap-2 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400">
              <n-icon :component="IconHeart" size="15" class="text-rose-500" />
              <span>{{ $t('home.categories.favoriteTools') }}</span>
              <c-tooltip :tooltip="$t('home.categories.favoritesDndToolTip')">
                <n-icon :component="IconDragDrop" size="16" class="cursor-grab text-neutral-400" />
              </c-tooltip>
            </h3>
            <Draggable
              :list="favoriteTools"
              class="grid grid-cols-1 gap-14px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4"
              ghost-class="ghost-favorites-draggable"
              item-key="name"
              @end="onUpdateFavoriteTools"
            >
              <template #item="{ element: tool }">
                <ToolCard :tool="tool" />
              </template>
            </Draggable>
          </div>
        </transition>

        <!-- New Tools Section -->
        <div v-if="toolStore.newTools.length > 0" class="mb-24px">
          <h3 class="mb-12px text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400">
            {{ t('home.categories.newestTools') }}
          </h3>
          <div class="grid grid-cols-1 gap-14px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
            <ToolCard v-for="tool in toolStore.newTools" :key="tool.name" :tool="tool" />
          </div>
        </div>

        <!-- All Tools Section -->
        <h3 class="mb-12px text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400">
          {{ $t('home.categories.allTools') }}
        </h3>
        <div class="grid grid-cols-1 gap-14px lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4">
          <ToolCard v-for="tool in toolStore.tools" :key="tool.name" :tool="tool" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid transparent;
  background-color: rgba(128, 128, 128, 0.08);
  color: #71717a;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background-color: rgba(128, 128, 128, 0.16);
    color: #18181b;
  }

  &.active {
    background-color: #10b981;
    color: #ffffff;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.25);

    .pill-count {
      background-color: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }
  }

  .pill-count {
    padding: 1px 6px;
    border-radius: 9999px;
    font-size: 10px;
    background-color: rgba(128, 128, 128, 0.14);
    color: inherit;
  }
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.height-enter-active,
.height-leave-active {
  transition: all 0.5s ease-in-out;
  overflow: hidden;
  max-height: 500px;
}

.height-enter-from,
.height-leave-to {
  max-height: 42px;
  overflow: hidden;
  opacity: 0;
  margin-bottom: 0;
}

.ghost-favorites-draggable {
  opacity: 0.4;
  background-color: #ccc;
  border: 2px dashed #666;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
  animation: ghost-favorites-draggable-animation 0.2s ease-out;
}

@keyframes ghost-favorites-draggable-animation {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 0.4;
    transform: scale(1.0);
  }
}
</style>
