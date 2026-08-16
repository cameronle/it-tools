<script setup lang="ts">
import JSON5 from 'json5';
import { useStorage } from '@vueuse/core';
import { formatJson } from './json.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const inputElement = ref<HTMLElement>();

const sampleJson = `{
  "id": "usr_948271",
  "name": "Alex Mercer",
  "email": "alex.mercer@example.com",
  "roles": ["admin", "developer"],
  "settings": {
    "theme": "dark",
    "notifications": true,
    "timeoutMs": 5000
  },
  "tags": ["cloud", "devops", "vue3"],
  "active": true,
  "createdAt": "2026-08-16T12:00:00Z"
}`;

const rawJson = useStorage('json-prettify:raw-json', '{"hello": "world", "foo": "bar"}');
const indentSize = useStorage('json-prettify:indent-size', 2);
const sortKeys = useStorage('json-prettify:sort-keys', true);
const cleanJson = computed(() => withDefaultOnError(() => formatJson({ rawJson, indentSize, sortKeys }), ''));

function loadSample() {
  rawJson.value = sampleJson;
}

function minifyJson() {
  try {
    const parsed = JSON5.parse(rawJson.value);
    rawJson.value = JSON.stringify(parsed);
  }
  catch (_) {
  }
}

function clearJson() {
  rawJson.value = '';
}

const rawJsonValidation = useValidation({
  source: rawJson,
  rules: [
    {
      validator: v => v === '' || JSON5.parse(v),
      message: 'Provided JSON is not valid.',
    },
  ],
});
</script>

<template>
  <div style="flex: 0 0 100%">
    <div style="margin: 0 auto; max-width: 800px" flex flex-wrap items-center justify-between gap-3 pb-2>
      <div flex items-center gap-3>
        <n-form-item label="Sort keys :" label-placement="left" label-width="90" :show-feedback="false">
          <n-switch v-model:value="sortKeys" />
        </n-form-item>
        <n-form-item label="Indent :" label-placement="left" label-width="60" :show-feedback="false">
          <n-input-number v-model:value="indentSize" min="0" max="10" style="width: 80px" />
        </n-form-item>
      </div>

      <div flex items-center gap-2>
        <c-button size="small" variant="text" @click="loadSample">
          <icon-mdi:flask-outline mr-1 />
          Sample
        </c-button>
        <c-button size="small" variant="text" @click="minifyJson">
          <icon-mdi:arrow-collapse-horizontal mr-1 />
          Minify
        </c-button>
        <c-button size="small" variant="text" @click="clearJson">
          <icon-mdi:trash-can-outline mr-1 />
          Clear
        </c-button>
      </div>
    </div>
  </div>

  <n-form-item
    label="Your raw JSON"
    :feedback="rawJsonValidation.message"
    :validation-status="rawJsonValidation.status"
  >
    <c-input-text
      ref="inputElement"
      v-model:value="rawJson"
      placeholder="Paste your raw JSON here..."
      rows="20"
      multiline
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </n-form-item>
  <n-form-item label="Prettified version of your JSON">
    <TextareaCopyable :value="cleanJson" language="json" :follow-height-of="inputElement" />
  </n-form-item>
</template>

<style lang="less" scoped>
.result-card {
  position: relative;
  .copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
