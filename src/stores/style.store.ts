import { useColorMode, useCycleList, useMediaQuery, usePreferredDark, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { type Ref, computed, watch } from 'vue';

export const useStyleStore = defineStore('style', () => {
  const preferredDark = usePreferredDark();
  const colorMode = useColorMode({
    emitAuto: true,
    storageKey: 'vueuse-color-scheme',
  });

  const isSmallScreen = useMediaQuery('(max-width: 700px)');
  const isMenuCollapsed = useStorage('isMenuCollapsed', isSmallScreen.value) as Ref<boolean>;

  watch(isSmallScreen, v => (isMenuCollapsed.value = v));

  const isDarkTheme = computed(() => {
    if (colorMode.value === 'auto') {
      return preferredDark.value;
    }
    return colorMode.value === 'dark';
  });

  const { next: cycleTheme } = useCycleList(['auto', 'light', 'dark'], { initialValue: colorMode });

  return {
    mode: colorMode,
    isDarkTheme,
    cycleTheme,
    toggleDark: cycleTheme,
    isMenuCollapsed,
    isSmallScreen,
  };
});
