<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen } = toRefs(styleStore);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
const siderWidth = computed(() => (isSmallScreen.value ? 290 : 250));
</script>

<template>
  <n-layout has-sider class="main-layout">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="0"
      :width="siderWidth"
      :collapsed="isMenuCollapsed"
      :show-trigger="false"
      :native-scrollbar="false"
      :position="siderPosition"
      class="app-sider"
      :class="{ 'is-mobile-open': isSmallScreen && !isMenuCollapsed }"
    >
      <slot name="sider" />
    </n-layout-sider>

    <n-layout class="content">
      <slot name="content" />
      <div
        v-if="isSmallScreen && !isMenuCollapsed"
        class="overlay"
        @click="isMenuCollapsed = true"
      />
    </n-layout>
  </n-layout>
</template>

<style lang="less" scoped>
.main-layout {
  position: relative;
  height: 100vh;
}

.app-sider {
  &.is-mobile-open {
    z-index: 500 !important;
    box-shadow: 6px 0 28px rgba(0, 0, 0, 0.45);
    background-color: var(--n-color, #18181c) !important;
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 100;
  cursor: pointer;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.content {
  position: relative;
  ::v-deep(.n-layout-scroll-container) {
    padding: 26px;
  }
  @media (max-width: 700px) {
    ::v-deep(.n-layout-scroll-container) {
      padding: 16px 12px;
    }
  }
}
</style>
