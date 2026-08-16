<script lang="ts" setup>
import { toRefs } from 'vue';
import type { CLabelProps } from './c-label.types';

const props = withDefaults(defineProps<CLabelProps>(), { label: undefined, labelAlign: 'left', labelFor: undefined, labelPosition: 'top', labelWidth: 'auto' });
const { label, labelAlign, labelFor, labelPosition, labelWidth } = toRefs(props);
</script>

<template>
  <div
    class="c-label-wrapper"
    :class="{
      'is-top': labelPosition === 'top',
      'is-left': labelPosition === 'left',
    }"
  >
    <label
      v-if="label" :for="labelFor" :style="{ flex: `0 0 ${labelWidth}` }"
      class="c-label"
      :class="{
        'text-left': labelAlign === 'left',
        'text-center': labelAlign === 'center',
        'text-right': labelAlign === 'right',
      }"
    >
      {{ label }}
    </label>
    <div class="c-label-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="less">
.c-label-wrapper {
  display: flex;
  align-items: baseline;
  width: 100%;

  &.is-top {
    flex-direction: column;
    align-items: stretch;
    .c-label {
      margin-bottom: 6px;
    }
  }

  &.is-left {
    flex-direction: row;
    .c-label {
      margin-bottom: 5px;
      padding-right: 12px;
    }

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: stretch;
      .c-label {
        flex: 0 0 auto !important;
        text-align: left !important;
        padding-right: 0 !important;
        margin-bottom: 6px;
      }
    }
  }

  .c-label-content {
    flex: 1 1 auto;
    min-width: 0;
  }
}
</style>
