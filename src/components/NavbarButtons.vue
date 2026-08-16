<script setup lang="ts">
import { IconBrandGithub, IconDeviceDesktop, IconInfoCircle, IconMoon, IconSun } from '@tabler/icons-vue';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { mode } = toRefs(styleStore);
</script>

<template>
  <c-tooltip :tooltip="$t('home.nav.github')" position="bottom">
    <c-button
      circle
      variant="text"
      href="https://github.com/cameronle/it-tools"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="$t('home.nav.githubRepository')"
    >
      <n-icon size="25" :component="IconBrandGithub" />
    </c-button>
  </c-tooltip>

  <c-tooltip :tooltip="$t('home.nav.about')" position="bottom">
    <c-button circle variant="text" to="/about" :aria-label="$t('home.nav.aboutLabel')">
      <n-icon size="25" :component="IconInfoCircle" />
    </c-button>
  </c-tooltip>

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
      @click="() => styleStore.cycleTheme()"
    >
      <n-icon v-if="mode === 'auto'" size="22" :component="IconDeviceDesktop" />
      <n-icon v-else-if="mode === 'light'" size="24" :component="IconSun" />
      <n-icon v-else size="24" :component="IconMoon" />
    </c-button>
  </c-tooltip>
</template>

<style lang="less" scoped>
.n-button {
  &:not(:last-child) {
    margin-right: 5px;
  }
}
</style>
