<script setup lang="ts">
import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-vue';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { mode } = toRefs(styleStore);
</script>

<template>
  <c-tooltip
    :tooltip="
      mode === 'auto'
        ? `${$t('home.nav.autoMode')} (${styleStore.isDarkTheme ? $t('home.nav.darkMode') : $t('home.nav.lightMode')})`
        : mode === 'light'
          ? $t('home.nav.lightMode')
          : $t('home.nav.darkMode')
    "
    position="bottom"
  >
    <c-button
      circle
      variant="text"
      :aria-label="$t('home.nav.mode')"
      @click="styleStore.cycleTheme"
    >
      <n-icon v-if="mode === 'auto'" size="22" :component="IconDeviceDesktop" />
      <n-icon v-else-if="mode === 'light'" size="24" :component="IconSun" />
      <n-icon v-else size="24" :component="IconMoon" />
    </c-button>
  </c-tooltip>
</template>
