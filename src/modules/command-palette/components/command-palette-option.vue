<script setup lang="ts">
import type { PaletteOption } from '../command-palette.types';

const props = withDefaults(defineProps<{ option: PaletteOption; selected?: boolean }>(), {
  selected: false,
});
const emit = defineEmits(['activated']);
const { option, selected } = toRefs(props);
</script>

<template>
  <button
    type="button"
    role="option"
    class="command-option"
    :class="{ 'is-selected': selected }"
    :aria-selected="selected"
    @click="emit('activated', option)"
  >
    <span v-if="option.icon" class="option-icon" aria-hidden="true">
      <component :is="option.icon" />
    </span>

    <span class="option-copy">
      <strong>{{ option.name }}</strong>
      <span v-if="option.description">{{ option.description }}</span>
    </span>

    <span v-if="selected" class="option-enter" aria-hidden="true">↵</span>
  </button>
</template>

<style scoped lang="less">
.command-option {
  width: 100%;
  min-height: 54px;
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.14s ease, box-shadow 0.14s ease, transform 0.14s ease;

  &:hover,
  &.is-selected {
    background: rgba(16, 185, 129, 0.1);
  }

  &.is-selected {
    box-shadow: inset 3px 0 0 #10b981;
  }

  &:focus-visible {
    outline: 2px solid rgba(16, 185, 129, 0.55);
    outline-offset: -2px;
  }
}

.option-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: rgba(148, 163, 184, 0.12);
  color: #64748b;

  svg {
    width: 21px;
    height: 21px;
  }
}

.is-selected .option-icon {
  background: rgba(16, 185, 129, 0.16);
  color: #059669;
}

.option-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #1e293b;
    font-size: 14px;
    font-weight: 650;
    line-height: 1.25;
  }

  span {
    color: #64748b;
    font-size: 12px;
    line-height: 1.25;
  }
}

.option-enter {
  min-width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
  font-size: 13px;
}

:global(.dark .option-copy strong) {
  color: #f1f5f9;
}

:global(.dark .option-copy span),
:global(.dark .option-icon) {
  color: #94a3b8;
}

:global(.dark .command-option:hover),
:global(.dark .command-option.is-selected) {
  background: rgba(16, 185, 129, 0.13);
}

:global(.dark .command-option.is-selected .option-icon) {
  color: #6ee7b7;
}
</style>
