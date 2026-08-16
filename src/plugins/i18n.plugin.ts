import messages from '@intlify/unplugin-vue-i18n/messages';
import { get } from '@vueuse/core';
import type { Plugin } from 'vue';
import { createI18n } from 'vue-i18n';

function detectInitialLocale(): string {
  try {
    const available = messages ? Object.keys(messages) : [];
    const saved = localStorage.getItem('locale');
    if (saved && available.includes(saved)) {
      return saved;
    }

    const browserLang = window.navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) {
      return 'zh';
    }
    const primary = browserLang.split('-')[0];
    if (available.includes(primary)) {
      return primary;
    }
  }
  catch (_) {
  }
  return 'en';
}

const initialLocale = detectInitialLocale();

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages,
});

if (typeof window !== 'undefined') {
  try {
    watch(
      () => get(i18n.global.locale),
      (newLocale) => {
        if (newLocale) {
          localStorage.setItem('locale', newLocale);
        }
      },
      { immediate: true },
    );
  }
  catch (_) {
  }
}

export const i18nPlugin: Plugin = {
  install: (app) => {
    app.use(i18n);
  },
};

export const translate = function (localeKey: string) {
  const hasKey = i18n.global.te(localeKey, get(i18n.global.locale));
  return hasKey ? i18n.global.t(localeKey) : localeKey;
};
