<script setup lang="ts">
import RandExp from 'randexp';
import { render } from '@regexper/render';
import type { ShadowRootExpose } from 'vue-shadow-dom';
import { matchRegex } from './regex-tester.service';
import { useValidation } from '@/composable/validation';
import { useQueryParamOrStorage } from '@/composable/queryParams';

const regex = useQueryParamOrStorage({ name: 'regex', storageName: 'regex-tester:regex', defaultValue: '' });
const text = ref('');
const global = ref(true);
const ignoreCase = ref(false);
const multiline = ref(false);
const dotAll = ref(true);
const unicode = ref(true);
const unicodeSets = ref(false);
const visualizerSVG = ref<ShadowRootExpose>();

const regexValidation = useValidation({
  source: regex,
  rules: [
    {
      message: 'Invalid regex: {0}',
      validator: value => new RegExp(value),
      getErrorMessage: (value) => {
        const _ = new RegExp(value);
        return '';
      },
    },
  ],
});
const results = computed(() => {
  let flags = 'd';
  if (global.value) {
    flags += 'g';
  }
  if (ignoreCase.value) {
    flags += 'i';
  }
  if (multiline.value) {
    flags += 'm';
  }
  if (dotAll.value) {
    flags += 's';
  }
  if (unicode.value) {
    flags += 'u';
  }
  else if (unicodeSets.value) {
    flags += 'v';
  }

  try {
    return matchRegex(regex.value, text.value, flags);
  }
  catch (_) {
    return [];
  }
});

const sample = computed(() => {
  try {
    const randexp = new RandExp(new RegExp(regex.value.replace(/(\?<[^>]*>)/g, '(?:')));
    return randexp.gen();
  }
  catch (_) {
    return '';
  }
});

interface RegexPreset {
  label: string
  pattern: string
  sampleText: string
  flags?: { global?: boolean; ignoreCase?: boolean; multiline?: boolean }
}

const presets: RegexPreset[] = [
  {
    label: 'Email',
    pattern: '^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$',
    sampleText: 'contact@example.com, invalid.email@, user.name+tag@sub.domain.co',
    flags: { global: true, ignoreCase: true },
  },
  {
    label: 'URL',
    pattern: 'https?:\\/\\/[\\w.-]+(?:\\:[0-9]+)?(?:\\/[^\\s]*)?',
    sampleText: 'Visit https://tools.865455.xyz/ or http://localhost:8080/api/v1?page=1 for details.',
    flags: { global: true, ignoreCase: true },
  },
  {
    label: 'IPv4',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    sampleText: 'Server IP: 192.168.1.1, gateway: 10.0.0.254, invalid: 999.1.1.1',
    flags: { global: true },
  },
  {
    label: 'Date (YYYY-MM-DD)',
    pattern: '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b',
    sampleText: 'Start: 2026-08-16, End: 2026-12-31, Invalid: 2026-02-30',
    flags: { global: true },
  },
  {
    label: 'Phone (CN)',
    pattern: '\\b1[3-9]\\d{9}\\b',
    sampleText: 'Call 13800138000 or 18612345678, not 12345678901',
    flags: { global: true },
  },
];

function applyPreset(preset: RegexPreset) {
  regex.value = preset.pattern;
  text.value = preset.sampleText;
  if (preset.flags?.global !== undefined) {
    global.value = preset.flags.global;
  }
  if (preset.flags?.ignoreCase !== undefined) {
    ignoreCase.value = preset.flags.ignoreCase;
  }
  if (preset.flags?.multiline !== undefined) {
    multiline.value = preset.flags.multiline;
  }
}

function clearAll() {
  regex.value = '';
  text.value = '';
}

watchEffect(
  async () => {
    const regexValue = regex.value;
    // shadow root is required:
    // @regexper/render append a <defs><style> that broke svg transparency of icons in the whole site
    const visualizer = visualizerSVG.value?.shadow_root;
    if (visualizer) {
      while (visualizer.lastChild) {
        visualizer.removeChild(visualizer.lastChild);
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      try {
        await render(regexValue, svg);
      }
      catch (_) {
      }
      visualizer.appendChild(svg);
    }
  },
);
</script>

<template>
  <div max-w-700px w-full>
    <!-- Preset Pills -->
    <div mb-3 flex flex-wrap items-center justify-between gap-2>
      <div flex flex-wrap items-center gap-1.5>
        <span mr-1 text-xs text-neutral-400 font-medium>Presets:</span>
        <button
          v-for="p in presets"
          :key="p.label"
          class="cursor-pointer border border-neutral-200 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600 font-medium transition-colors dark:border-neutral-800 hover:border-emerald-500/50 dark:bg-neutral-800/80 hover:bg-emerald-50 dark:text-neutral-300 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </button>
      </div>

      <c-button size="small" variant="text" @click="clearAll">
        <icon-mdi:trash-can-outline mr-1 />
        Clear
      </c-button>
    </div>

    <c-card title="Regex" mb-1>
      <c-input-text
        v-model:value="regex"
        label="Regex to test:"
        placeholder="Put the regex to test"
        multiline
        rows="3"
        :validation="regexValidation"
      />
      <div my-2 flex items-center justify-between>
        <router-link target="_blank" to="/regex-memo" class="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
          See Regular Expression Cheatsheet →
        </router-link>
      </div>
      <n-space>
        <n-checkbox v-model:checked="global">
          <span title="Global search">Global (<code>g</code>)</span>
        </n-checkbox>
        <n-checkbox v-model:checked="ignoreCase">
          <span title="Case-insensitive search">Case-insensitive (<code>i</code>)</span>
        </n-checkbox>
        <n-checkbox v-model:checked="multiline">
          <span title="Allows ^ and $ to match next to newline characters.">Multiline (<code>m</code>)</span>
        </n-checkbox>
        <n-checkbox v-model:checked="dotAll">
          <span title="Allows . to match newline characters.">Singleline (<code>s</code>)</span>
        </n-checkbox>
        <n-checkbox v-model:checked="unicode">
          <span title="Unicode; treat a pattern as a sequence of Unicode code points.">Unicode (<code>u</code>)</span>
        </n-checkbox>
        <n-checkbox v-model:checked="unicodeSets">
          <span title="An upgrade to the u mode with more Unicode features.">Unicode Sets (<code>v</code>)</span>
        </n-checkbox>
      </n-space>

      <n-divider />

      <c-input-text
        v-model:value="text"
        label="Text to match:"
        placeholder="Put the text to match"
        multiline
        rows="5"
      />
    </c-card>

    <c-card title="Matches" mb-1 mt-3>
      <n-table v-if="results?.length > 0">
        <thead>
          <tr>
            <th scope="col">
              Index in text
            </th>
            <th scope="col">
              Value
            </th>
            <th scope="col">
              Captures
            </th>
            <th scope="col">
              Groups
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="match of results" :key="match.index">
            <td>{{ match.index }}</td>
            <td>{{ match.value }}</td>
            <td>
              <ul>
                <li v-for="capture in match.captures" :key="capture.name">
                  "{{ capture.name }}" = {{ capture.value }} [{{ capture.start }} - {{ capture.end }}]
                </li>
              </ul>
            </td>
            <td>
              <ul>
                <li v-for="group in match.groups" :key="group.name">
                  "{{ group.name }}" = {{ group.value }} [{{ group.start }} - {{ group.end }}]
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </n-table>
      <c-alert v-else>
        No match
      </c-alert>
    </c-card>

    <c-card title="Sample matching text" mt-3>
      <pre style="white-space: pre-wrap; word-break: break-all;">{{ sample }}</pre>
    </c-card>

    <c-card title="Regex Diagram" style="overflow-x: scroll;" mt-3>
      <shadow-root ref="visualizerSVG">
&#xa0;
      </shadow-root>
    </c-card>
  </div>
</template>
