<script setup lang="ts">
import { storeToRefs } from 'pinia';
import _ from 'lodash';
import { useCommandPaletteStore } from './command-palette.store';
import type { PaletteOption } from './command-palette.types';
import { useToolStore } from '@/tools/tools.store';

const isModalOpen = ref(false);
const inputRef = ref<{ focus: () => void }>();
const resultsRef = ref<HTMLElement>();
const previousActiveElement = shallowRef<HTMLElement | null>(null);
const selectedOptionIndex = ref(0);
const router = useRouter();
const { t } = useI18n();
const isMac = computed(() => typeof navigator !== 'undefined' && /mac/i.test(navigator.platform || navigator.userAgent));

const commandPaletteStore = useCommandPaletteStore();
const toolStore = useToolStore();
const { searchPrompt, filteredSearchResult } = storeToRefs(commandPaletteStore);

const initialOptions = computed<PaletteOption[]>(() => {
  const recentTools = toolStore.recentTools;
  const favoriteTools = toolStore.favoriteTools;
  const source = recentTools.length > 0
    ? recentTools
    : favoriteTools.length > 0
      ? favoriteTools
      : toolStore.newTools.length > 0
        ? toolStore.newTools
        : toolStore.tools;

  return _.uniqBy(source, tool => tool.path)
    .slice(0, 6)
    .map(tool => ({
      ...tool,
      to: tool.path,
      toolCategory: tool.category,
      category: 'Tools',
    }));
});

const initialSectionLabel = computed(() => {
  if (toolStore.recentTools.length > 0) {
    return t('home.categories.recent');
  }

  if (toolStore.favoriteTools.length > 0) {
    return t('home.categories.favoriteTools');
  }

  return t('search.suggested');
});

const displayedSearchResult = computed<Record<string, PaletteOption[]>>(() => {
  if (searchPrompt.value.trim()) {
    return filteredSearchResult.value;
  }

  return initialOptions.value.length > 0
    ? { [initialSectionLabel.value]: initialOptions.value }
    : {};
});

const flatOptions = computed(() => _.chain(displayedSearchResult.value).values().flatten().value());
const resultCount = computed(() => flatOptions.value.length);
const hasResults = computed(() => resultCount.value > 0);

const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' && e.type === 'keydown') {
      e.preventDefault();
    }
  },
});

whenever(keys.ctrl_k, open);
whenever(keys.meta_k, open);
whenever(keys.escape, close);

watch(searchPrompt, () => {
  selectedOptionIndex.value = 0;
});

watch(isModalOpen, async (isOpen) => {
  if (isOpen) {
    document.body.classList.add('command-palette-open');
    await nextTick();
    inputRef.value?.focus();
    return;
  }

  document.body.classList.remove('command-palette-open');
  await nextTick();
  previousActiveElement.value?.focus();
});

onBeforeUnmount(() => {
  document.body.classList.remove('command-palette-open');
});

function open() {
  if (isModalOpen.value) {
    return;
  }

  previousActiveElement.value = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
  selectedOptionIndex.value = 0;
  isModalOpen.value = true;
}

function close() {
  if (!isModalOpen.value) {
    return;
  }

  isModalOpen.value = false;
  searchPrompt.value = '';
  selectedOptionIndex.value = 0;
}

function scrollSelectedOptionIntoView() {
  nextTick(() => {
    resultsRef.value
      ?.querySelector<HTMLElement>(`[data-option-index="${selectedOptionIndex.value}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  });
}

function handleKeydown(event: KeyboardEvent) {
  const { key } = event;

  if (key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }

  if (['ArrowUp', 'ArrowDown'].includes(key)) {
    event.preventDefault();
    const increment = key === 'ArrowDown' ? 1 : -1;
    const maxIndex = Math.max(resultCount.value - 1, 0);
    selectedOptionIndex.value = Math.min(Math.max(selectedOptionIndex.value + increment, 0), maxIndex);
    scrollSelectedOptionIntoView();
    return;
  }

  if (key === 'Enter' && hasResults.value) {
    event.preventDefault();
    activateOption(flatOptions.value[selectedOptionIndex.value]);
  }
}

function getOptionIndex(option: PaletteOption) {
  return flatOptions.value.findIndex(candidate => candidate === option);
}

function activateOption(option?: PaletteOption) {
  if (!option) {
    return;
  }

  const { closeOnSelect } = option;

  if (option.action) {
    option.action();

    if (closeOnSelect) {
      close();
    }

    return;
  }

  const closeAfterNavigation = closeOnSelect || _.isUndefined(closeOnSelect);

  if (option.to) {
    router.push(option.to);

    if (closeAfterNavigation) {
      close();
    }
    return;
  }

  if (option.href) {
    window.open(option.href, '_blank', 'noopener,noreferrer');

    if (closeAfterNavigation) {
      close();
    }
  }
}
</script>

<template>
  <div flex-1>
    <c-button w-full important:justify-start @click="open">
      <span flex items-center gap-3 op-50>
        <icon-mdi-search />
        {{ $t('search.label') }}
        <span hidden flex-1 border border-current border-op-35 rounded border-solid px-5px py-3px sm:inline>
          {{ isMac ? 'Cmd' : 'Ctrl' }}&nbsp;+&nbsp;K
        </span>
      </span>
    </c-button>

    <c-modal
      v-model:open="isModalOpen"
      :centered="false"
      class="palette-modal"
      overlay-class="palette-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="$t('search.dialogLabel')"
      @keydown="handleKeydown"
    >
      <div class="palette-search">
        <c-input-text
          ref="inputRef"
          v-model:value="searchPrompt"
          class="palette-input"
          raw-text
          :placeholder="$t('search.placeholder')"
          autofocus
          clearable
        >
          <template #prefix>
            <icon-mdi-magnify class="palette-search-icon" aria-hidden="true" />
          </template>
          <template #suffix>
            <kbd class="palette-escape">Esc</kbd>
            <button
              type="button"
              class="palette-close"
              :aria-label="$t('search.close')"
              @click.stop="close"
            >
              <icon-mdi-close aria-hidden="true" />
            </button>
          </template>
        </c-input-text>
      </div>

      <div ref="resultsRef" class="no-scrollbar palette-results" role="listbox">
        <template v-if="hasResults">
          <section
            v-for="(options, category) in displayedSearchResult"
            :key="category"
            class="palette-section"
          >
            <h2 class="palette-section-title">
              {{ category }}
            </h2>
            <command-palette-option
              v-for="option in options"
              :id="`command-option-${getOptionIndex(option)}`"
              :key="option.name"
              :data-option-index="getOptionIndex(option)"
              :option="option"
              :selected="selectedOptionIndex === getOptionIndex(option)"
              @mouseenter="selectedOptionIndex = getOptionIndex(option)"
              @activated="activateOption"
            />
          </section>
        </template>

        <div v-else class="palette-empty" role="status">
          <icon-mdi-magnify-close aria-hidden="true" />
          <strong>{{ $t('search.noResults') }}</strong>
          <span>{{ $t('search.noResultsHint') }}</span>
        </div>
      </div>

      <div class="palette-footer" aria-hidden="true">
        <span class="palette-footer-hint">
          <kbd>↑</kbd><kbd>↓</kbd>
          {{ $t('search.navigate') }}
        </span>
        <span class="palette-footer-hint">
          <kbd>↵</kbd>
          {{ $t('search.open') }}
        </span>
        <span class="palette-result-count">
          {{ resultCount }}
        </span>
      </div>
    </c-modal>
  </div>
</template>

<style scoped lang="less">
:global(body.command-palette-open) {
  overflow: hidden;
  overscroll-behavior: none;
}

:global(.palette-overlay) {
  align-items: flex-start;
  padding: clamp(64px, 10vh, 104px) 16px 24px !important;
  background-color: rgba(15, 23, 42, 0.32) !important;
  backdrop-filter: blur(2px) !important;
  -webkit-backdrop-filter: blur(2px) !important;
}

:global(.palette-modal) {
  width: min(680px, calc(100vw - 32px)) !important;
  max-width: 680px !important;
  max-height: min(74dvh, 620px);
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden;
  background-color: #ffffff !important;
  border: 1px solid rgba(15, 23, 42, 0.13) !important;
  border-radius: 16px !important;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28), 0 8px 24px rgba(0, 0, 0, 0.14) !important;
}

:global(.palette-modal:focus-within) {
  border-color: rgba(16, 185, 129, 0.55) !important;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.14), 0 28px 80px rgba(0, 0, 0, 0.28) !important;
}

:global(.dark .palette-modal) {
  background-color: #18181b !important;
  border-color: rgba(148, 163, 184, 0.22) !important;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.58), 0 8px 24px rgba(0, 0, 0, 0.32) !important;
}

.palette-search {
  padding: 12px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.14);
  background: rgba(148, 163, 184, 0.07);
}

.palette-input {
  font-size: 16px;

  :deep(.input-wrapper) {
    min-height: 54px;
    gap: 10px;
    padding: 0 8px 0 15px;
    border: 1px solid rgba(100, 116, 139, 0.2);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.76);
    transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
  }

  :deep(.input-wrapper:hover) {
    border-color: rgba(16, 185, 129, 0.42);
  }

  :deep(.input-wrapper:focus-within) {
    border-color: rgba(16, 185, 129, 0.78);
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
  }

  :deep(.input) {
    min-height: 52px;
    padding: 0;
    font-size: 16px;
  }
}

:global(.dark .palette-input .input-wrapper) {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.72);
}

:global(.dark .palette-input .input-wrapper:focus-within) {
  border-color: rgba(52, 211, 153, 0.66);
  background: rgba(15, 23, 42, 0.94);
}

.palette-search-icon {
  width: 21px;
  height: 21px;
  flex: 0 0 auto;
  color: #64748b;
}

.palette-escape,
.palette-footer kbd {
  display: inline-flex;
  min-width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(100, 116, 139, 0.2);
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  color: #64748b;
  font-family: inherit;
  font-size: 11px;
  line-height: 1;
  box-shadow: 0 1px 1px rgba(15, 23, 42, 0.05);
}

.palette-escape {
  padding: 0 7px;
}

.palette-close {
  width: 40px;
  height: 40px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: color 0.16s ease, background-color 0.16s ease;

  &:hover,
  &:focus-visible {
    outline: none;
    background: rgba(148, 163, 184, 0.16);
    color: #0f172a;
  }
}

:global(.dark .palette-close:hover),
:global(.dark .palette-close:focus-visible) {
  color: #f8fafc;
}

.palette-results {
  min-height: 120px;
  max-height: min(54dvh, 430px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 8px;
}

.palette-section + .palette-section {
  margin-top: 7px;
  padding-top: 7px;
  border-top: 1px solid rgba(128, 128, 128, 0.12);
}

.palette-section-title {
  margin: 0;
  padding: 8px 10px 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.2;
  text-transform: uppercase;
}

.palette-empty {
  min-height: 190px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 24px;
  color: #64748b;
  text-align: center;

  svg {
    width: 30px;
    height: 30px;
    margin-bottom: 5px;
    opacity: 0.55;
  }

  strong {
    color: #334155;
    font-size: 14px;
  }

  span {
    font-size: 12px;
  }
}

:global(.dark .palette-empty strong) {
  color: #e2e8f0;
}

.palette-footer {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 14px;
  border-top: 1px solid rgba(128, 128, 128, 0.14);
  background: rgba(148, 163, 184, 0.06);
  color: #64748b;
  font-size: 11px;
}

.palette-footer-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.palette-footer-hint kbd + kbd {
  margin-left: -3px;
}

.palette-result-count {
  margin-left: auto;
  min-width: 26px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  font-weight: 700;
}

@media (max-width: 640px) {
  :global(.palette-overlay) {
    padding: max(8px, env(safe-area-inset-top)) 8px max(8px, env(safe-area-inset-bottom)) !important;
    background-color: rgba(15, 23, 42, 0.4) !important;
    backdrop-filter: blur(1px) !important;
    -webkit-backdrop-filter: blur(1px) !important;
  }

  :global(.palette-modal) {
    width: 100% !important;
    max-height: calc(100dvh - 16px - env(safe-area-inset-top));
    border-radius: 14px !important;
  }

  .palette-search {
    padding: 10px;
  }

  .palette-escape {
    display: none;
  }

  .palette-results {
    max-height: calc(100dvh - 144px - env(safe-area-inset-top));
  }

  .palette-footer {
    gap: 12px;
    padding-inline: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :global(.palette-overlay) {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}
</style>
