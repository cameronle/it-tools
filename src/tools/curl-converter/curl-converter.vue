<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { parseCurl, toGolang, toJavaScriptFetch, toPythonRequests } from './curl-converter.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';

const sampleCurl = `curl -X POST "https://api.example.com/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-secret123456" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'`;

const inputCurl = useStorage('curl-converter:input', sampleCurl);
const targetLanguage = ref<'python' | 'javascript' | 'go'>('python');

const parsedResult = computed(() => {
  try {
    return parseCurl(inputCurl.value);
  }
  catch (_) {
    return { method: 'GET', url: '', headers: {} };
  }
});

const outputCode = computed(() => {
  const p = parsedResult.value;
  if (targetLanguage.value === 'python') {
    return toPythonRequests(p);
  }
  if (targetLanguage.value === 'javascript') {
    return toJavaScriptFetch(p);
  }
  if (targetLanguage.value === 'go') {
    return toGolang(p);
  }
  return '';
});

const codeLanguage = computed(() => {
  if (targetLanguage.value === 'python') {
    return 'python';
  }
  if (targetLanguage.value === 'javascript') {
    return 'javascript';
  }
  if (targetLanguage.value === 'go') {
    return 'go';
  }
  return 'txt';
});

function loadSample() {
  inputCurl.value = sampleCurl;
}

function clearInput() {
  inputCurl.value = '';
}
</script>

<template>
  <div mx-auto max-w-1000px w-full>
    <div mb-3 flex flex-wrap items-center justify-between gap-2>
      <div flex items-center gap-2>
        <span text-xs text-neutral-400 font-medium>Target:</span>
        <n-radio-group v-model:value="targetLanguage" size="small">
          <n-radio-button value="python">
            Python (requests)
          </n-radio-button>
          <n-radio-button value="javascript">
            JavaScript (fetch)
          </n-radio-button>
          <n-radio-button value="go">
            Go (net/http)
          </n-radio-button>
        </n-radio-group>
      </div>

      <div flex items-center gap-2>
        <c-button size="small" variant="text" @click="loadSample">
          <icon-mdi:flask-outline mr-1 />
          Sample
        </c-button>
        <c-button size="small" variant="text" @click="clearInput">
          <icon-mdi:trash-can-outline mr-1 />
          Clear
        </c-button>
      </div>
    </div>

    <div grid grid-cols-1 gap-4 lg:grid-cols-2>
      <div>
        <div mb-2 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400>
          cURL Command Input
        </div>
        <c-input-text
          v-model:value="inputCurl"
          placeholder="Paste your cURL command here..."
          rows="16"
          multiline
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          monospace
        />
      </div>

      <div>
        <div mb-2 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400>
          Generated {{ targetLanguage }} Code
        </div>
        <TextareaCopyable :value="outputCode" :language="codeLanguage" />
      </div>
    </div>
  </div>
</template>
