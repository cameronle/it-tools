import { useMediaQuery, usePreferredDark, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { type Ref, computed, watch } from 'vue';

export type ThemeMode = 'auto' | 'light' | 'dark';

export const useStyleStore = defineStore('style', () => {
  const preferredDark = usePreferredDark();
  const themeMode = useStorage<ThemeMode>('vueuse-color-scheme', 'auto');

  const isSmallScreen = useMediaQuery('(max-width: 700px)');
  const isMenuCollapsed = useStorage('isMenuCollapsed', isSmallScreen.value) as Ref<boolean>;

  watch(isSmallScreen, v => (isMenuCollapsed.value = v));

  const isDarkTheme = computed(() => {
    if (themeMode.value === 'auto') {
      return preferredDark.value;
    }
    return themeMode.value === 'dark';
  });

  // Keep html class in sync
  watch(
    isDarkTheme,
    (dark) => {
      if (typeof document !== 'undefined') {
        const el = document.documentElement;
        if (dark) {
          el.classList.add('dark');
        }
        else {
          el.classList.remove('dark');
        }
      }
    },
    { immediate: true },
  );

  function cycleTheme() {
    if (themeMode.value === 'auto') {
      themeMode.value = 'light';
    }
    else if (themeMode.value === 'light') {
      themeMode.value = 'dark';
    }
    else {
      themeMode.value = 'auto';
    }
  }

  return {
    mode: themeMode,
    isDarkTheme,
    cycleTheme,
    toggleDark: cycleTheme,
    isMenuCollapsed,
    isSmallScreen,
  };
});
