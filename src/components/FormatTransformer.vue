<script setup lang="ts">
import _ from 'lodash';
import type { UseValidationRule } from '@/composable/validation';
import CInputText from '@/ui/c-input-text/c-input-text.vue';

const props = withDefaults(
  defineProps<{
    transformer?: (v: string) => string
    inputValidationRules?: UseValidationRule<string>[]
    inputLabel?: string
    inputPlaceholder?: string
    inputDefault?: string
    outputLabel?: string
    outputLanguage?: string
  }>(),
  {
    transformer: _.identity,
    inputValidationRules: () => [],
    inputLabel: 'Input',
    inputDefault: '',
    inputPlaceholder: 'Input...',
    outputLabel: 'Output',
    outputLanguage: '',
  },
);

const { transformer, inputValidationRules, inputLabel, outputLabel, outputLanguage, inputPlaceholder, inputDefault }
  = toRefs(props);

const inputElement = ref<typeof CInputText>();

const input = ref(inputDefault.value);
const output = computed(() => transformer.value(input.value));

function loadSample() {
  if (inputDefault.value) {
    input.value = inputDefault.value;
  }
}

function clearInput() {
  input.value = '';
}
</script>

<template>
  <div class="w-full">
    <div mb-1 flex items-center justify-between>
      <div class="text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400">
        {{ inputLabel }}
      </div>
      <div flex items-center gap-2>
        <c-button v-if="inputDefault" size="small" variant="text" @click="loadSample">
          <icon-mdi:flask-outline mr-1 />
          Sample
        </c-button>
        <c-button size="small" variant="text" @click="clearInput">
          <icon-mdi:trash-can-outline mr-1 />
          Clear
        </c-button>
      </div>
    </div>

    <CInputText
      ref="inputElement"
      v-model:value="input"
      :placeholder="inputPlaceholder"
      rows="18"
      autosize
      raw-text
      multiline
      test-id="input"
      :validation-rules="inputValidationRules"
      monospace
    />
  </div>

  <div overflow-auto class="w-full">
    <div mb-2 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400>
      {{ outputLabel }}
    </div>
    <textarea-copyable :value="output" :language="outputLanguage" :follow-height-of="inputElement?.inputWrapperRef" />
  </div>
</template>
