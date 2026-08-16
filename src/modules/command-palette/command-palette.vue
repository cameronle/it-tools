<script setup lang="ts">
import { storeToRefs } from 'pinia';
import _ from 'lodash';
import { useCommandPaletteStore } from './command-palette.store';
import type { PaletteOption } from './command-palette.types';

const isModalOpen = ref(false);
const inputRef = ref();
const router = useRouter();
const isMac = computed(() => window.navigator.userAgent.toLowerCase().includes('mac'));

const commandPaletteStore = useCommandPaletteStore();
const { searchPrompt, filteredSearchResult } = storeToRefs(commandPaletteStore);

const keys = useMagicKeys({
  passive: false,
  onEventFired(e) {
    if (e.ctrlKey && e.key === 'k' && e.type === 'keydown') {
      e.preventDefault();
    }

    if (e.metaKey && e.key === 'k' && e.type === 'keydown') {
      e.preventDefault();
    }
  },
});

whenever(isModalOpen, () => inputRef.value?.focus());

whenever(keys.ctrl_k, open);
whenever(keys.meta_k, open);
whenever(keys.escape, close);

function open() {
  return isModalOpen.value = true;
}

function close() {
  isModalOpen.value = false;
  searchPrompt.value = '';
}

const selectedOptionIndex = ref(0);

function handleKeydown(event: KeyboardEvent) {
  const { key } = event;
  const isEnterPressed = key === 'Enter';
  const isArrowUpOrDown = ['ArrowUp', 'ArrowDown'].includes(key);
  const isArrowDown = key === 'ArrowDown';

  if (isArrowUpOrDown) {
    const increment = isArrowDown ? 1 : -1;
    const maxIndex = Math.max(_.chain(filteredSearchResult.value).values().flatten().size().value() - 1, 0);

    selectedOptionIndex.value = Math.min(Math.max(selectedOptionIndex.value + increment, 0), maxIndex);

    return;
  }

  if (isEnterPressed) {
    const option = _.chain(filteredSearchResult.value)
      .values()
      .flatten()
      .nth(selectedOptionIndex.value)
      .value();

    activateOption(option);
  }
}

function getOptionIndex(option: PaletteOption) {
  return _.chain(filteredSearchResult.value)
    .values()
    .flatten()
    .findIndex(o => o === option)
    .value();
}

function activateOption(option: PaletteOption) {
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
    window.open(option.href, '_blank');

    if (closeAfterNavigation) {
      close();
    }
  }
}
</script>

<template>
  <div flex-1>
    <c-button w-full important:justify-start @click="isModalOpen = true">
      <span flex items-center gap-3 op-40>
        <icon-mdi-search />
        {{ $t('search.label') }}
        <span hidden flex-1 border border-current border-op-40 rounded border-solid px-5px py-3px sm:inline>
          {{ isMac ? 'Cmd' : 'Ctrl' }}&nbsp;+&nbsp;K
        </span>
      </span>
    </c-button>

    <c-modal
      v-model:open="isModalOpen"
      :centered="false"
      class="palette-modal !important:max-w-650px !important:pa-16px"
      overlay-class="!pt-6 sm:!pt-20 !px-3 sm:!px-4"
      @keydown="handleKeydown"
    >
      <c-input-text
        ref="inputRef"
        v-model:value="searchPrompt"
        raw-text
        placeholder="Type to search a tool or command..."
        autofocus
        clearable
      />

      <div class="no-scrollbar mt-3 max-h-60vh overflow-y-auto">
        <div v-for="(options, category) in filteredSearchResult" :key="category" class="mb-2">
          <div class="mb-1 ml-2 text-11px text-emerald-500 font-bold tracking-wider uppercase op-80">
            {{ category }}
          </div>
          <command-palette-option
            v-for="option in options"
            :key="option.name"
            :option="option"
            :selected="selectedOptionIndex === getOptionIndex(option)"
            @activated="activateOption"
          />
        </div>
      </div>
    </c-modal>
  </div>
</template>

<style scoped lang="less">
.c-input-text {
  font-size: 16px;

  ::v-deep(.input-wrapper) {
    padding: 6px 14px;
    border-radius: 8px;
  }
}
</style>
