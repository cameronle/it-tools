<script setup lang="ts">
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-vue';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { mode, isSmallScreen } = toRefs(styleStore);

const currentThemeLabel = computed(() => {
  if (mode.value === 'auto') {
    return 'Auto';
  }
  return mode.value === 'light' ? 'Light' : 'Dark';
});
</script>

<template>
  <c-tooltip
    :tooltip="
      !isSmallScreen
        ? mode === 'auto'
          ? $t('home.nav.autoMode')
          : mode === 'light'
            ? $t('home.nav.lightMode')
            : $t('home.nav.darkMode')
        : undefined
    "
    position="bottom"
  >
    <c-button
      circle
      variant="text"
      :aria-label="currentThemeLabel"
      @click="styleStore.cycleTheme"
    >
      <n-icon v-if="mode === 'auto'" size="22" :component="IconDeviceDesktop" />
      <n-icon v-else-if="mode === 'light'" size="24" :component="IconSun" />
      <n-icon v-else size="24" :component="IconMoon" />
    </c-button>
  </c-tooltip>
</template>
