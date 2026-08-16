<script setup lang="ts">
import cronstrue from 'cronstrue/i18n';
import { isValidCron } from 'cron-validator';
import { addMinutes, format, setMilliseconds, setSeconds } from 'date-fns';

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const cron = ref('*/15 * * * *');
const cronLanguage = ref<'zh_CN' | 'en'>('zh_CN');

const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

const quickPresets = [
  { label: '每 5 分钟', value: '*/5 * * * *' },
  { label: '每小时整点', value: '0 * * * *' },
  { label: '每天凌晨 2 点', value: '0 2 * * *' },
  { label: '工作日早 9 点', value: '0 9 * * 1-5' },
  { label: '每周日午夜', value: '0 0 * * 0' },
  { label: '每月 1 号凌晨', value: '0 0 1 * *' },
];

function matchCronField(val: number, field: string, min: number, max: number): boolean {
  if (field === '*' || field === '?') {
    return true;
  }
  const parts = field.split(',');
  for (const part of parts) {
    if (part.includes('/')) {
      const [startStr, stepStr] = part.split('/');
      const step = Number.parseInt(stepStr, 10);
      const start = startStr === '*' ? min : Number.parseInt(startStr, 10);
      if (Number.isNaN(step) || step <= 0) {
        continue;
      }
      if (val >= start && (val - start) % step === 0 && val <= max) {
        return true;
      }
    }
    else if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Number.parseInt(startStr, 10);
      const end = Number.parseInt(endStr, 10);
      if (val >= start && val <= end) {
        return true;
      }
    }
    else {
      const num = Number.parseInt(part, 10);
      if (val === num) {
        return true;
      }
    }
  }
  return false;
}

const nextExecutions = computed(() => {
  const expr = cron.value.trim();
  if (!isCronValid(expr)) {
    return [];
  }
  const fields = expr.split(/\s+/);
  if (fields.length < 5) {
    return [];
  }

  const [minField, hourField, domField, monthField, dowField] = fields.length === 5 ? fields : fields.slice(1, 6);

  const results: string[] = [];
  let curr = new Date();
  curr = setSeconds(setMilliseconds(curr, 0), 0);
  curr = addMinutes(curr, 1);

  const maxIterations = 60 * 24 * 366;
  let count = 0;

  while (results.length < 5 && count < maxIterations) {
    count++;
    const m = curr.getMinutes();
    const h = curr.getHours();
    const dom = curr.getDate();
    const mon = curr.getMonth() + 1;
    const dow = curr.getDay();

    if (
      matchCronField(m, minField, 0, 59)
      && matchCronField(h, hourField, 0, 23)
      && matchCronField(dom, domField, 1, 31)
      && matchCronField(mon, monthField, 1, 12)
      && matchCronField(dow, dowField, 0, 6)
    ) {
      results.push(format(curr, 'yyyy-MM-dd HH:mm (EEEE)'));
    }
    curr = addMinutes(curr, 1);
  }

  return results;
});

const cronString = computed(() => {
  if (isCronValid(cron.value)) {
    try {
      return cronstrue.toString(cron.value, {
        ...cronstrueConfig,
        locale: cronLanguage.value,
      });
    }
    catch (_) {
      return 'Invalid cron expression';
    }
  }
  return ' ';
});

const cronValidationRules = [
  {
    validator: (value: string) => isCronValid(value),
    message: 'This cron expression is invalid',
  },
];
</script>

<template>
  <div mx-auto max-w-900px w-full>
    <c-card mb-4>
      <div mb-3 flex flex-wrap items-center justify-between gap-2>
        <div flex flex-wrap items-center gap-1.5>
          <span mr-1 text-xs text-neutral-400 font-medium>Presets:</span>
          <button
            v-for="p in quickPresets"
            :key="p.label"
            class="cursor-pointer border border-neutral-200 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-700 font-medium transition-colors dark:border-neutral-800 hover:border-emerald-500/50 dark:bg-neutral-800/80 hover:bg-emerald-50 dark:text-neutral-300 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
            @click="cron = p.value"
          >
            {{ p.label }}
          </button>
        </div>

        <div flex items-center gap-2>
          <n-radio-group v-model:value="cronLanguage" size="small">
            <n-radio-button value="zh_CN">
              中文
            </n-radio-button>
            <n-radio-button value="en">
              EN
            </n-radio-button>
          </n-radio-group>
          <c-button size="small" variant="text" @click="cron = '* * * * *'">
            <icon-mdi:trash-can-outline mr-1 />
            Clear
          </c-button>
        </div>
      </div>

      <div mx-auto my-4 max-w-md>
        <c-input-text
          v-model:value="cron"
          size="large"
          placeholder="* * * * *"
          :validation-rules="cronValidationRules"
          raw-text
        />
      </div>

      <div class="cron-string text-emerald-600 font-semibold dark:text-emerald-400">
        {{ cronString }}
      </div>

      <!-- Next Executions Forecast -->
      <div v-if="nextExecutions.length > 0" class="mt-4 border border-neutral-200 rounded-lg bg-neutral-50 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/50">
        <div class="mb-2 flex items-center gap-1.5 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400">
          <icon-mdi:calendar-clock text-15px class="text-emerald-500" />
          <span>{{ cronLanguage === 'zh_CN' ? '未来 5 次执行时间预估' : 'Next 5 Scheduled Runs' }}</span>
        </div>
        <div class="grid grid-cols-1 gap-2 text-xs text-neutral-700 font-mono sm:grid-cols-2 dark:text-neutral-300">
          <div
            v-for="(time, idx) in nextExecutions"
            :key="time"
            class="flex items-center gap-2 border border-neutral-100 rounded bg-white px-2 py-1.5 shadow-sm dark:border-neutral-700/50 dark:bg-neutral-800"
          >
            <span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-10px text-emerald-600 font-bold dark:bg-emerald-500/20 dark:text-emerald-400">#{{ idx + 1 }}</span>
            <span>{{ time }}</span>
          </div>
        </div>
      </div>
    </c-card>

    <c-card>
      <div class="mb-2 text-sm text-neutral-600 font-semibold dark:text-neutral-300">
        Cron Format Schema
      </div>
      <pre class="rounded-lg bg-neutral-900 p-3 text-xs text-neutral-200 leading-relaxed">
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
::v-deep(input) {
  font-size: 26px !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.05em;
}

.cron-string {
  text-align: center;
  font-size: 18px;
  line-height: 1.4;
  margin: 12px 0;
  min-height: 28px;
}
</style>
