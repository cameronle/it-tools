<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import type { HeadObject } from '@vueuse/head';
import { useStorage } from '@vueuse/core';
import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-vue';

import BaseLayout from './base.layout.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import { useStyleStore } from '@/stores/style.store';

const route = useRoute();
const toolStore = useToolStore();
const styleStore = useStyleStore();
const isZenMode = useStorage('tool-layout:is-zen-mode', false);

function toggleZenMode() {
  isZenMode.value = !isZenMode.value;
  if (isZenMode.value) {
    styleStore.isMenuCollapsed = true;
  }
}

onMounted(() => {
  if (route.path) {
    toolStore.recordRecentTool(route.path);
  }
});

const head = computed<HeadObject>(() => ({
  title: `${route.meta.name} - IT Tools`,
  meta: [
    {
      name: 'description',
      content: route.meta?.description as string,
    },
    {
      name: 'keywords',
      content: ((route.meta.keywords ?? []) as string[]).join(','),
    },
  ],
}));
useHead(head);
const { t } = useI18n();

const i18nKey = computed<string>(() => route.path.trim().replace('/', ''));
const toolTitle = computed<string>(() => t(`tools.${i18nKey.value}.title`, String(route.meta.name)));
const toolDescription = computed<string>(() => t(`tools.${i18nKey.value}.description`, String(route.meta.description)));
</script>

<template>
  <BaseLayout>
    <div class="tool-layout" :class="{ 'is-zen': isZenMode }">
      <div class="tool-header">
        <div flex items-center justify-between gap-4>
          <h1 class="tool-title">
            {{ toolTitle }}
          </h1>

          <div flex items-center gap-2>
            <c-tooltip :tooltip="isZenMode ? $t('home.exitZenMode', 'Exit Zen / Wide Mode') : $t('home.enterZenMode', 'Zen / Wide Mode')">
              <c-button
                circle
                variant="text"
                :class="{ 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20': isZenMode }"
                @click="toggleZenMode"
              >
                <n-icon size="18" :component="isZenMode ? IconArrowsMinimize : IconArrowsMaximize" />
              </c-button>
            </c-tooltip>

            <FavoriteButton :tool="{ name: route.meta.name, path: route.path } as Tool" />
          </div>
        </div>

        <div class="tool-description">
          {{ toolDescription }}
        </div>
      </div>

      <div class="tool-content">
        <slot />
      </div>
    </div>
  </BaseLayout>
</template>

<style lang="less" scoped>
.tool-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 12px;
  box-sizing: border-box;
  transition: max-width 0.25s ease;

  &.is-zen {
    max-width: 100%;
    padding: 0 20px;
  }

  .tool-header {
    padding: 24px 0 20px;
    width: 100%;

    .tool-title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0;
      line-height: 1.25;
      color: var(--n-text-color, #18181b);
    }

    .tool-description {
      margin-top: 6px;
      font-size: 14px;
      line-height: 1.5;
      color: #71717a;
    }
  }

  .tool-content {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 40px;

    ::v-deep(& > *) {
      flex: 1 1 560px;
      max-width: 100%;
    }
  }
}
</style>
