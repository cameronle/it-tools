<script setup lang="ts">
import { v1 as generateUuidV1, v3 as generateUuidV3, v4 as generateUuidV4, v5 as generateUuidV5, NIL as nilUuid } from 'uuid';
import { useCopy } from '@/composable/copy';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { withDefaultOnError } from '@/utils/defaults';

const versions = ['NIL', 'v1', 'v3', 'v4', 'v5'] as const;

const version = useStorage<typeof versions[number]>('uuid-generator:version', 'v4');
const count = useStorage('uuid-generator:quantity', 1);
const v35Args = ref({ namespace: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', name: '' });

const validUuidRules = [
  {
    message: 'Invalid UUID',
    validator: (value: string) => {
      if (value === nilUuid) {
        return true;
      }

      return Boolean(value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
    },
  },
];

const generators = {
  NIL: () => nilUuid,
  v1: (index: number) => generateUuidV1({
    clockseq: index,
    msecs: Date.now(),
    nsecs: Math.floor(Math.random() * 10000),
    node: Array.from({ length: 6 }, () => Math.floor(Math.random() * 256)),
  }),
  v3: () => generateUuidV3(v35Args.value.name, v35Args.value.namespace),
  v4: () => generateUuidV4(),
  v5: () => generateUuidV5(v35Args.value.name, v35Args.value.namespace),
};

const [uuids, refreshUUIDs] = computedRefreshable(() => withDefaultOnError(() =>
  Array.from({ length: count.value }, (_ignored, index) => {
    const generator = generators[version.value] ?? generators.NIL;
    return generator(index);
  }).join('\n'), ''));

const { copy } = useCopy({ source: uuids, text: 'UUIDs copied to the clipboard' });
</script>

<template>
  <div mx-auto max-w-700px w-full>
    <c-buttons-select v-model:value="version" :options="versions" label="UUID version:" label-width="110px" mb-3 />

    <div mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3>
      <span w-110px shrink-0 text-sm text-neutral-600 font-medium dark:text-neutral-300>Quantity:</span>
      <n-input-number v-model:value="count" flex-1 :min="1" :max="50" placeholder="UUID quantity" />
    </div>

    <div v-if="version === 'v3' || version === 'v5'">
      <div>
        <c-buttons-select
          v-model:value="v35Args.namespace"
          :options="{
            DNS: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
            URL: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
            OID: '6ba7b812-9dad-11d1-80b4-00c04fd430c8',
            X500: '6ba7b814-9dad-11d1-80b4-00c04fd430c8',
          }"
          label="Namespace:"
          label-width="110px"
          mb-2
        />
      </div>
      <div flex-1>
        <c-input-text
          v-model:value="v35Args.namespace"
          placeholder="Namespace"
          label-width="110px"
          label-position="left"
          label="Custom NS:"
          :validation-rules="validUuidRules"
          mb-2
        />
      </div>

      <c-input-text
        v-model:value="v35Args.name"
        placeholder="Name"
        label="Name:"
        label-width="110px"
        label-position="left"
        mb-2
      />
    </div>

    <c-input-text
      :value="uuids"
      multiline
      placeholder="Your uuids"
      autosize
      rows="1"
      readonly
      raw-text
      monospace
      my-3
      class="uuid-display"
    />

    <div flex flex-col justify-center gap-3 sm:flex-row>
      <c-button class="flex-1 sm:flex-initial" autofocus @click="copy()">
        <icon-mdi:content-copy mr-1 text-16px />
        Copy
      </c-button>
      <c-button class="flex-1 sm:flex-initial" @click="refreshUUIDs">
        <icon-mdi:refresh mr-1 text-16px />
        Refresh
      </c-button>
    </div>
  </div>
</template>

<style scoped lang="less">
::v-deep(.uuid-display) {
  textarea {
    text-align: left;
    word-break: break-all;
    font-size: 14px;
    line-height: 1.6;
    padding: 10px;
  }
}
</style>
