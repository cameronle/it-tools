<script setup lang="ts">
import { generateKeyPair } from './rsa-key-pair-generator.service';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { withDefaultOnErrorAsync } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';
import { computedRefreshableAsync } from '@/composable/computedRefreshable';

const bits = ref(2048);
const emptyCerts = { publicKeyPem: '', privateKeyPem: '' };

const { attrs: bitsValidationAttrs } = useValidation({
  source: bits,
  rules: [
    {
      message: 'Bits should be 256 <= bits <= 16384 and be a multiple of 8',
      validator: value => value >= 256 && value <= 16384 && value % 8 === 0,
    },
  ],
});

const [certs, refreshCerts] = computedRefreshableAsync(
  () => withDefaultOnErrorAsync(() => generateKeyPair({ bits: bits.value }), emptyCerts),
  emptyCerts,
);
</script>

<template>
  <div style="flex: 0 0 100%">
    <div style="max-width: 600px" mx-auto mb-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center>
      <n-form-item label="Bits :" v-bind="bitsValidationAttrs as any" label-placement="left" label-width="80" :show-feedback="false" flex-1>
        <n-input-number v-model:value="bits" min="256" max="16384" step="8" w-full />
      </n-form-item>

      <c-button @click="refreshCerts">
        <icon-mdi:refresh mr-1 text-16px />
        Refresh key-pair
      </c-button>
    </div>
  </div>

  <div>
    <h3 mb-1 text-sm text-neutral-600 font-medium dark:text-neutral-300>
      Public key
    </h3>
    <TextareaCopyable :value="certs.publicKeyPem" />
  </div>

  <div>
    <h3 mb-1 text-sm text-neutral-600 font-medium dark:text-neutral-300>
      Private key
    </h3>
    <TextareaCopyable :value="certs.privateKeyPem" />
  </div>
</template>
