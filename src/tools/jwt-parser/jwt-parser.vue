<script setup lang="ts">
import { decodeJwt } from './jwt-parser.service';
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const defaultJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImFkbWluIjp0cnVlfQ.4S15e_2-sTj-k425n5l_45JdKk5f58L3M93L2D4sw5c';

const rawJwt = ref(defaultJwt);

function loadSample() {
  rawJwt.value = defaultJwt;
}

function clearJwt() {
  rawJwt.value = '';
}

const decodedJWT = computed(() =>
  withDefaultOnError(() => decodeJwt({ jwt: rawJwt.value }), { header: [], payload: [] }),
);

const sections = [
  { key: 'header', title: 'Header' },
  { key: 'payload', title: 'Payload' },
] as const;

const validation = useValidation({
  source: rawJwt,
  rules: [
    {
      validator: value => value.length > 0 && isNotThrowing(() => decodeJwt({ jwt: rawJwt.value })),
      message: 'Invalid JWT',
    },
  ],
});
</script>

<template>
  <c-card>
    <div mb-2 flex items-center justify-between>
      <span text-sm text-neutral-600 font-medium dark:text-neutral-300>JWT to decode</span>
      <div flex items-center gap-2>
        <c-button size="small" variant="text" @click="loadSample">
          <icon-mdi:flask-outline mr-1 />
          Sample
        </c-button>
        <c-button size="small" variant="text" @click="clearJwt">
          <icon-mdi:trash-can-outline mr-1 />
          Clear
        </c-button>
      </div>
    </div>
    <c-input-text v-model:value="rawJwt" :validation="validation" placeholder="Put your token here..." rows="5" multiline raw-text autofocus mb-3 />

    <n-table v-if="validation.isValid">
      <tbody>
        <template v-for="section of sections" :key="section.key">
          <th colspan="2" class="table-header">
            {{ section.title }}
          </th>
          <tr v-for="{ claim, claimDescription, friendlyValue, value } in decodedJWT[section.key]" :key="claim + value">
            <td class="claims" style="vertical-align: top;">
              <span font-bold>
                {{ claim }}
              </span>
              <span v-if="claimDescription" ml-2 op-70>
                ({{ claimDescription }})
              </span>
            </td>
            <td style="word-wrap: break-word;word-break: break-all;">
              <span>{{ value }}</span>
              <span v-if="friendlyValue" ml-2 op-70>
                ({{ friendlyValue }})
              </span>
            </td>
          </tr>
        </template>
      </tbody>
    </n-table>
  </c-card>
</template>

<style lang="less" scoped>
.table-header {
  text-align: center;
}
</style>
