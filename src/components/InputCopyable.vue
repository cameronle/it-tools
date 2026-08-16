<script setup lang="ts">
import { useVModel } from '@vueuse/core';
import { useCopy } from '@/composable/copy';

const props = defineProps<{ value: string }>();
const emit = defineEmits(['update:value']);

const value = useVModel(props, 'value', emit);
const { copy, isJustCopied } = useCopy({ source: value, createToast: false });
const tooltipText = computed(() => isJustCopied.value ? 'Copied!' : 'Copy to clipboard');
</script>

<template>
  <c-input-text v-model:value="value">
    <template #suffix>
      <c-tooltip :tooltip="tooltipText">
        <c-button
          circle
          variant="text"
          size="small"
          :class="isJustCopied ? '!text-emerald-500' : ''"
          @click="copy()"
        >
          <icon-mdi-check v-if="isJustCopied" text-16px />
          <icon-mdi-content-copy v-else text-16px />
        </c-button>
      </c-tooltip>
    </template>
  </c-input-text>
</template>
