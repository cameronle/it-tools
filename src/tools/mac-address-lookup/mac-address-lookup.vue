<script setup lang="ts">
import { macAddressValidationRules } from '@/utils/macAddress';
import { useCopy } from '@/composable/copy';

const getVendorValue = (address: string) => address.trim().replace(/[.:-]/g, '').toUpperCase().substring(0, 6);

const macAddress = ref('20:37:06:12:34:56');
const db = shallowRef<Record<string, string> | null>(null);
const isLoadingDb = ref(false);

onMounted(async () => {
  if (!db.value) {
    isLoadingDb.value = true;
    try {
      const module = await import('oui-data');
      db.value = (module.default || module) as Record<string, string>;
    }
    catch (_) {
    }
    finally {
      isLoadingDb.value = false;
    }
  }
});

const details = computed<string | undefined>(() => {
  if (!db.value) {
    return undefined;
  }
  return db.value[getVendorValue(macAddress.value)];
});

const { copy, isJustCopied } = useCopy({ source: () => details.value ?? '', text: 'Vendor info copied to the clipboard' });
</script>

<template>
  <div mx-auto max-w-700px w-full>
    <c-input-text
      v-model:value="macAddress"
      label="MAC address:"
      size="large"
      placeholder="Type a MAC address (e.g. 20:37:06:12:34:56)"
      clearable
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
      :validation-rules="macAddressValidationRules"
      mb-4
    />

    <div mb-2 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400>
      Vendor Information
    </div>

    <c-card mb-5>
      <div v-if="isLoadingDb" flex items-center justify-center gap-2 py-4 text-sm text-neutral-400>
        <n-spin size="small" />
        <span>Loading OUI vendor database...</span>
      </div>

      <div v-else-if="details">
        <div v-for="(detail, index) of details.split('\n')" :key="index" text-sm leading-relaxed font-mono>
          {{ detail }}
        </div>
      </div>

      <div v-else text-sm italic op-60>
        Unknown vendor for this MAC address
      </div>
    </c-card>

    <div flex justify-center>
      <c-button :disabled="!details" :class="isJustCopied ? '!text-emerald-500' : ''" @click="copy()">
        <icon-mdi-check v-if="isJustCopied" mr-1 text-16px />
        <icon-mdi:content-copy v-else mr-1 text-16px />
        {{ isJustCopied ? 'Copied!' : 'Copy Vendor Info' }}
      </c-button>
    </div>
  </div>
</template>
