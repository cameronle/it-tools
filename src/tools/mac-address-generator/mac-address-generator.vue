<script setup lang="ts">
import _ from 'lodash';
import { generateRandomMacAddress } from './mac-adress-generator.models';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { usePartialMacAddressValidation } from '@/utils/macAddress';

const amount = useStorage('mac-address-generator-amount', 1);
const macAddressPrefix = useStorage('mac-address-generator-prefix', '64:16:7F');

const prefixValidation = usePartialMacAddressValidation(macAddressPrefix);

const casesTransformers = [
  { label: 'Uppercase', value: (value: string) => value.toUpperCase() },
  { label: 'Lowercase', value: (value: string) => value.toLowerCase() },
];
const caseTransformer = ref(casesTransformers[0].value);

const separators = [
  {
    label: ':',
    value: ':',
  },
  {
    label: '-',
    value: '-',
  },
  {
    label: '.',
    value: '.',
  },
  {
    label: 'None',
    value: '',
  },
];
const separator = useStorage('mac-address-generator-separator', separators[0].value);

const [macAddresses, refreshMacAddresses] = computedRefreshable(() => {
  if (!prefixValidation.isValid) {
    return '';
  }

  const ids = _.times(amount.value, () => caseTransformer.value(generateRandomMacAddress({
    prefix: macAddressPrefix.value,
    separator: separator.value,
  })));
  return ids.join('\n');
});

const { copy } = useCopy({ source: macAddresses, text: 'MAC addresses copied to the clipboard' });
</script>

<template>
  <div mx-auto max-w-700px w-full flex flex-col justify-center gap-3>
    <div flex flex-col gap-1 sm:flex-row sm:items-center>
      <label w-150px pr-12px text-left text-sm text-neutral-600 font-medium sm:text-right dark:text-neutral-300>Quantity:</label>
      <n-input-number v-model:value="amount" min="1" max="100" flex-1 />
    </div>

    <c-input-text
      v-model:value="macAddressPrefix"
      label="MAC address prefix:"
      placeholder="Set a prefix, e.g. 64:16:7F"
      clearable
      label-position="left"
      spellcheck="false"
      :validation="prefixValidation"
      raw-text
      label-width="150px"
      label-align="right"
    />

    <c-buttons-select
      v-model:value="caseTransformer"
      :options="casesTransformers"
      label="Case:"
      label-width="150px"
      label-align="right"
    />

    <c-buttons-select
      v-model:value="separator"
      :options="separators"
      label="Separator:"
      label-width="150px"
      label-align="right"
    />

    <c-card mt-3 flex data-test-id="ulids">
      <pre m-0 w-full overflow-x-auto text-left text-sm leading-relaxed font-mono>{{ macAddresses }}</pre>
    </c-card>

    <div flex flex-col justify-center gap-3 sm:flex-row>
      <c-button class="flex-1 sm:flex-initial" data-test-id="refresh" @click="refreshMacAddresses()">
        <icon-mdi:refresh mr-1 text-16px />
        Refresh
      </c-button>
      <c-button class="flex-1 sm:flex-initial" @click="copy()">
        <icon-mdi:content-copy mr-1 text-16px />
        Copy
      </c-button>
    </div>
  </div>
</template>
