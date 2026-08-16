<script lang="ts" setup>
import { NIcon } from 'naive-ui';
import { RouterLink, useRoute } from 'vue-router';
import { Home2, Menu2 } from '@vicons/tabler';
import { storeToRefs } from 'pinia';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';

const styleStore = useStyleStore();
const route = useRoute();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);

const { t } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);

// Auto-collapse sidebar on mobile when navigating to another route
watch(
  () => route.path,
  () => {
    if (styleStore.isSmallScreen) {
      styleStore.isMenuCollapsed = true;
    }
  },
);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <RouterLink to="/" class="brand-header">
        <div class="brand-logo">
          <icon-mdi:code-tags text-18px />
        </div>
        <div class="brand-info">
          <div class="brand-title">
            IT-TOOLS
          </div>
          <div class="brand-subtitle">
            {{ $t('home.subtitle') }}
          </div>
        </div>
      </RouterLink>

      <div class="sider-content">
        <div v-if="styleStore.isSmallScreen" flex flex-col items-center px-4 pb-2>
          <locale-selector w="100%" mb-2 />

          <div flex justify-center>
            <NavbarButtons />
          </div>
        </div>

        <CollapsibleToolMenu :tools-by-category="tools" />

        <div class="footer">
          <div class="text-xs text-neutral-400 dark:text-neutral-500">
            <span>IT-Tools v{{ version }}</span>
            <template v-if="commitSha && commitSha.length > 0">
              <span mx-1>•</span>
              <c-link
                target="_blank"
                rel="noopener"
                type="primary"
                :href="`https://github.com/CorentinTh/it-tools/tree/${commitSha}`"
              >
                {{ commitSha }}
              </c-link>
            </template>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div flex items-center justify-between gap-3 pb-2>
        <div flex items-center gap-2>
          <c-button
            circle
            variant="text"
            :aria-label="$t('home.toggleMenu')"
            @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
          >
            <NIcon size="20" :component="Menu2" />
          </c-button>

          <c-tooltip :tooltip="$t('home.home')" position="bottom">
            <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
              <NIcon size="20" :component="Home2" />
            </c-button>
          </c-tooltip>

          <c-tooltip :tooltip="$t('home.uiLib')" position="bottom">
            <c-button v-if="config.app.env === 'development'" to="/c-lib" circle variant="text" :aria-label="$t('home.uiLib')">
              <icon-mdi:brush-variant text-18px />
            </c-button>
          </c-tooltip>
        </div>

        <div mx-auto max-w-lg flex-1>
          <command-palette />
        </div>

        <div flex items-center gap-2>
          <locale-selector v-if="!styleStore.isSmallScreen" />
          <NavbarButtons v-if="!styleStore.isSmallScreen" />
        </div>
      </div>
      <slot />
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
.footer {
  text-align: center;
  margin-top: 24px;
  padding: 16px 0;
  border-top: 1px solid rgba(128, 128, 128, 0.1);
}

.sider-content {
  padding-top: 60px;
  padding-bottom: 40px;
  padding-left: 8px;
  padding-right: 8px;
}

.brand-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  text-decoration: none;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  background-color: var(--n-color, #18181c);
  backdrop-filter: blur(8px);

  .brand-logo {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background-color: #10b981;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
  }

  .brand-info {
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .brand-title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--n-text-color, #18181b);
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 11px;
      color: #71717a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
