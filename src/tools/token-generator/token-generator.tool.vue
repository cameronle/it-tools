<script setup lang="ts">
import { createToken } from './token-generator.service';
import { useCopy } from '@/composable/copy';
import { useQueryParam } from '@/composable/queryParams';
import { computedRefreshable } from '@/composable/computedRefreshable';

const length = useQueryParam({ name: 'length', defaultValue: 64 });
const withUppercase = useQueryParam({ name: 'uppercase', defaultValue: true });
const withLowercase = useQueryParam({ name: 'lowercase', defaultValue: true });
const withNumbers = useQueryParam({ name: 'numbers', defaultValue: true });
const withSymbols = useQueryParam({ name: 'symbols', defaultValue: false });
const { t } = useI18n();

const lengthPresets = [16, 32, 64, 128, 256];

const [token, refreshToken] = computedRefreshable(() =>
  createToken({
    length: length.value,
    withUppercase: withUppercase.value,
    withLowercase: withLowercase.value,
    withNumbers: withNumbers.value,
    withSymbols: withSymbols.value,
  }),
);

const { copy, isJustCopied } = useCopy({ source: token, text: t('tools.token-generator.copied') });
</script>

<template>
  <div class="mx-auto max-w-700px w-full">
    <c-card>
      <!-- Switches Grid (Mobile 1 column, Desktop 2 columns) -->
      <div class="grid grid-cols-1 mb-4 gap-x-6 gap-y-2 sm:grid-cols-2">
        <div class="flex items-center justify-between rounded-md px-1 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
          <span class="text-sm text-neutral-700 font-medium dark:text-neutral-300">
            {{ t('tools.token-generator.uppercase') }}
          </span>
          <n-switch v-model:value="withUppercase" />
        </div>

        <div class="flex items-center justify-between rounded-md px-1 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
          <span class="text-sm text-neutral-700 font-medium dark:text-neutral-300">
            {{ t('tools.token-generator.numbers') }}
          </span>
          <n-switch v-model:value="withNumbers" />
        </div>

        <div class="flex items-center justify-between rounded-md px-1 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
          <span class="text-sm text-neutral-700 font-medium dark:text-neutral-300">
            {{ t('tools.token-generator.lowercase') }}
          </span>
          <n-switch v-model:value="withLowercase" />
        </div>

        <div class="flex items-center justify-between rounded-md px-1 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/40">
          <span class="text-sm text-neutral-700 font-medium dark:text-neutral-300">
            {{ t('tools.token-generator.symbols') }}
          </span>
          <n-switch v-model:value="withSymbols" />
        </div>
      </div>

      <!-- Length Slider & Preset Buttons -->
      <div class="mb-5 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
          <span class="text-sm text-neutral-700 font-medium dark:text-neutral-300">
            {{ t('tools.token-generator.length') }}: <span class="text-emerald-600 font-bold font-mono dark:text-emerald-400">{{ length }}</span>
          </span>

          <div class="flex items-center gap-1.5">
            <button
              v-for="preset in lengthPresets"
              :key="preset"
              class="cursor-pointer border border-neutral-200 rounded px-2 py-0.5 text-xs text-neutral-600 font-medium transition-colors dark:border-neutral-800 hover:border-emerald-500/50 dark:bg-neutral-800/80 hover:bg-emerald-50 dark:text-neutral-300 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
              :class="{ '!border-emerald-500 !bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 font-bold': length === preset }"
              @click="length = preset"
            >
              {{ preset }}
            </button>
          </div>
        </div>

        <n-slider v-model:value="length" :step="1" :min="1" :max="512" />
      </div>

      <!-- Token Result Box -->
      <div class="mb-4">
        <c-input-text
          v-model:value="token"
          multiline
          :placeholder="t('tools.token-generator.tokenPlaceholder')"
          readonly
          rows="3"
          autosize
          monospace
          class="token-display"
        />
      </div>

      <!-- Action Buttons (Responsive width) -->
      <div class="flex flex-col justify-center gap-3 sm:flex-row">
        <c-button
          class="flex-1 sm:flex-initial"
          :class="isJustCopied ? '!text-emerald-500' : ''"
          @click="copy()"
        >
          <icon-mdi-check v-if="isJustCopied" mr-1 text-16px />
          <icon-mdi:content-copy v-else mr-1 text-16px />
          {{ isJustCopied ? 'Copied!' : t('tools.token-generator.button.copy') }}
        </c-button>

        <c-button class="flex-1 sm:flex-initial" @click="refreshToken">
          <icon-mdi:refresh mr-1 text-16px />
          {{ t('tools.token-generator.button.refresh') }}
        </c-button>
      </div>
    </c-card>
  </div>
</template>

<style scoped lang="less">
::v-deep(.token-display) {
  textarea {
    text-align: left;
    word-break: break-all;
    font-size: 14px;
    line-height: 1.5;
    padding: 10px;
  }
}
</style>
