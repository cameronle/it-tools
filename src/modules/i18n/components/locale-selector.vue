<script setup lang="ts">
const { availableLocales, locale } = useI18n();

const localesLong: Record<string, string> = {
  en: 'English',
  zh: '中文',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  no: 'Norwegian',
  pt: 'Português',
  ru: 'Русский',
  uk: 'Українська',
  vi: 'Tiếng Việt',
};

const dropdownOptions = computed(() =>
  availableLocales.map(key => ({
    label: localesLong[key] ?? key,
    key,
  })),
);

function handleSelect(key: string) {
  locale.value = key;
}
</script>

<template>
  <n-dropdown
    trigger="click"
    :options="dropdownOptions"
    placement="bottom-end"
    @select="handleSelect"
  >
    <c-button
      circle
      variant="text"
      aria-label="Select language"
      class="locale-btn"
    >
      <icon-mdi:translate text-20px />
    </c-button>
  </n-dropdown>
</template>

<style scoped lang="less">
.locale-btn {
  color: var(--n-text-color, #71717a);
  &:hover {
    color: #10b981;
  }
}
</style>
