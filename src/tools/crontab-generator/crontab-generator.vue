<script setup lang="ts">
import cronstrue from 'cronstrue/i18n';
import { isValidCron } from 'cron-validator';
import { addMinutes, addSeconds, format, setMilliseconds, setSeconds } from 'date-fns';
import { useCopy } from '@/composable/copy';

// Dialects: Standard Linux (5-fields: Min Hour Day Month Week) vs Java / Spring / Quartz (6-fields: Sec Min Hour Day Month Week)
type CronDialect = 'linux' | 'java';
const dialect = ref<CronDialect>('linux');
const cronLanguage = ref<'zh_CN' | 'en'>('zh_CN');

// Visual Builder Mode
type VisualMode = 'presets' | 'interval' | 'daily' | 'weekly' | 'monthly' | 'custom';
const activeMode = ref<VisualMode>('presets');

// Interval state
const intervalType = ref<'minutes' | 'hours' | 'seconds'>('minutes');
const intervalValue = ref<number>(15);

// Daily state
const dailyTime = ref<string>('09:00');

// Weekly state
const weeklyDays = ref<number[]>([1, 2, 3, 4, 5]); // 1-5 = Mon-Fri
const weeklyTime = ref<string>('09:00');

// Monthly state
const monthlyDays = ref<number[]>([1]);
const monthlyTime = ref<string>('00:00');

// Custom fields state (Seconds, Minutes, Hours, Day of Month, Month, Day of Week)
const customSec = ref('*');
const customMin = ref('0');
const customHour = ref('*');
const customDom = ref('*');
const customMonth = ref('*');
const customDow = ref('*');

// Raw cron string
const cron = ref('*/15 * * * *');

// Flag to prevent cyclic updates
let isSyncing = false;

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const { copy, isJustCopied } = useCopy({ source: cron, text: 'Cron 表达式已复制到剪贴板' });

const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

const quickPresetsLinux = [
  { label: '每 5 分钟', en: 'Every 5 mins', value: '*/5 * * * *' },
  { label: '每 15 分钟', en: 'Every 15 mins', value: '*/15 * * * *' },
  { label: '每小时整点', en: 'Hourly', value: '0 * * * *' },
  { label: '每天凌晨 2 点', en: 'Daily at 02:00', value: '0 2 * * *' },
  { label: '工作日早 9 点', en: 'Weekdays 09:00', value: '0 9 * * 1-5' },
  { label: '每周日午夜', en: 'Sunday midnight', value: '0 0 * * 0' },
  { label: '每月 1 号凌晨', en: '1st of month', value: '0 0 1 * *' },
];

const quickPresetsJava = [
  { label: '每 10 秒', en: 'Every 10 secs', value: '*/10 * * * * ?' },
  { label: '每 5 分钟', en: 'Every 5 mins', value: '0 */5 * * * ?' },
  { label: '每小时整点', en: 'Hourly', value: '0 0 * * * ?' },
  { label: '每天凌晨 2 点', en: 'Daily at 02:00', value: '0 0 2 * * ?' },
  { label: '工作日早 9 点', en: 'Weekdays 09:00', value: '0 0 9 ? * MON-FRI' },
  { label: '每周日午夜', en: 'Sunday midnight', value: '0 0 0 ? * SUN' },
  { label: '每月 1 号凌晨', en: '1st of month', value: '0 0 0 1 * ?' },
];

const currentPresets = computed(() => (dialect.value === 'linux' ? quickPresetsLinux : quickPresetsJava));

// Generate Cron from Visual Builder
function generateFromVisual() {
  if (isSyncing) {
    return;
  }
  isSyncing = true;

  const isJava = dialect.value === 'java';

  if (activeMode.value === 'interval') {
    if (intervalType.value === 'seconds') {
      cron.value = isJava ? `*/${intervalValue.value} * * * * ?` : `*/${intervalValue.value} * * * *`;
    }
    else if (intervalType.value === 'minutes') {
      cron.value = isJava ? `0 */${intervalValue.value} * * * ?` : `*/${intervalValue.value} * * * *`;
    }
    else {
      cron.value = isJava ? `0 0 */${intervalValue.value} * * ?` : `0 */${intervalValue.value} * * *`;
    }
  }
  else if (activeMode.value === 'daily') {
    const [h, m] = dailyTime.value.split(':');
    cron.value = isJava ? `0 ${Number.parseInt(m, 10)} ${Number.parseInt(h, 10)} * * ?` : `${Number.parseInt(m, 10)} ${Number.parseInt(h, 10)} * * *`;
  }
  else if (activeMode.value === 'weekly') {
    const [h, m] = weeklyTime.value.split(':');
    const days = weeklyDays.value.length > 0 ? weeklyDays.value.sort((a, b) => a - b).join(',') : '*';
    cron.value = isJava ? `0 ${Number.parseInt(m, 10)} ${Number.parseInt(h, 10)} ? * ${days}` : `${Number.parseInt(m, 10)} ${Number.parseInt(h, 10)} * * ${days}`;
  }
  else if (activeMode.value === 'monthly') {
    const [h, m] = monthlyTime.value.split(':');
    const days = monthlyDays.value.length > 0 ? monthlyDays.value.sort((a, b) => a - b).join(',') : '*';
    cron.value = isJava ? `0 ${Number.parseInt(m, 10)} ${Number.parseInt(h, 10)} ${days} * ?` : `${Number.parseInt(m, 10)} ${Number.parseInt(h, 10)} ${days} * *`;
  }
  else if (activeMode.value === 'custom') {
    if (isJava) {
      cron.value = `${customSec.value || '0'} ${customMin.value || '*'} ${customHour.value || '*'} ${customDom.value || '*'} ${customMonth.value || '*'} ${customDow.value || '?'}`;
    }
    else {
      cron.value = `${customMin.value || '*'} ${customHour.value || '*'} ${customDom.value || '*'} ${customMonth.value || '*'} ${customDow.value || '*'}`;
    }
  }

  isSyncing = false;
}

// Watchers for visual controls
watch([activeMode, intervalType, intervalValue, dailyTime, weeklyDays, weeklyTime, monthlyDays, monthlyTime, customSec, customMin, customHour, customDom, customMonth, customDow], () => {
  if (activeMode.value !== 'presets') {
    generateFromVisual();
  }
}, { deep: true });

// Switch dialect
function setDialect(d: CronDialect) {
  if (dialect.value === d) {
    return;
  }
  dialect.value = d;
  if (d === 'java') {
    if (cron.value === '*/15 * * * *') {
      cron.value = '0 */15 * * * ?';
    }
    else if (cron.value.trim().split(/\s+/).length === 5) {
      cron.value = `0 ${cron.value}`;
    }
  }
  else {
    const parts = cron.value.trim().split(/\s+/);
    if (parts.length === 6) {
      cron.value = parts.slice(1).join(' ').replace(/\?/g, '*');
    }
  }
}

// Next executions calculation
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

  const isSixFields = fields.length >= 6;
  const secField = isSixFields ? fields[0] : '0';
  const minField = isSixFields ? fields[1] : fields[0];
  const hourField = isSixFields ? fields[2] : fields[1];
  const domField = isSixFields ? fields[3] : fields[2];
  const monthField = isSixFields ? fields[4] : fields[3];
  const dowField = isSixFields ? fields[5] : fields[4];

  const results: string[] = [];
  let curr = new Date();
  curr = setMilliseconds(curr, 0);
  curr = isSixFields ? addSeconds(curr, 1) : addMinutes(setSeconds(curr, 0), 1);

  const maxIterations = isSixFields ? 60 * 60 * 24 * 60 : 60 * 24 * 366;
  let count = 0;

  while (results.length < 5 && count < maxIterations) {
    count++;
    const s = curr.getSeconds();
    const m = curr.getMinutes();
    const h = curr.getHours();
    const dom = curr.getDate();
    const mon = curr.getMonth() + 1;
    const dow = curr.getDay();

    if (
      matchCronField(s, secField, 0, 59)
      && matchCronField(m, minField, 0, 59)
      && matchCronField(h, hourField, 0, 23)
      && matchCronField(dom, domField, 1, 31)
      && matchCronField(mon, monthField, 1, 12)
      && matchCronField(dow, dowField, 0, 6)
    ) {
      results.push(format(curr, 'yyyy-MM-dd HH:mm:ss (EEEE)'));
    }
    curr = isSixFields ? addSeconds(curr, 1) : addMinutes(curr, 1);
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

const weekOptions = [
  { label: '周一 (Mon)', value: 1 },
  { label: '周二 (Tue)', value: 2 },
  { label: '周三 (Wed)', value: 3 },
  { label: '周四 (Thu)', value: 4 },
  { label: '周五 (Fri)', value: 5 },
  { label: '周六 (Sat)', value: 6 },
  { label: '周日 (Sun)', value: 0 },
];

function toggleWeekDay(day: number) {
  if (weeklyDays.value.includes(day)) {
    if (weeklyDays.value.length > 1) {
      weeklyDays.value = weeklyDays.value.filter(d => d !== day);
    }
  }
  else {
    weeklyDays.value.push(day);
  }
}

function selectWorkdays() {
  weeklyDays.value = [1, 2, 3, 4, 5];
}

function selectWeekends() {
  weeklyDays.value = [6, 0];
}

function selectAllWeek() {
  weeklyDays.value = [1, 2, 3, 4, 5, 6, 0];
}

function toggleMonthlyDay(day: number) {
  if (monthlyDays.value.includes(day)) {
    if (monthlyDays.value.length > 1) {
      monthlyDays.value = monthlyDays.value.filter(d => d !== day);
    }
  }
  else {
    monthlyDays.value.push(day);
  }
}
</script>

<template>
  <div mx-auto max-w-900px w-full>
    <!-- Main Generator Card -->
    <c-card mb-4>
      <!-- Top Dialect & Language Header -->
      <div mb-4 flex flex-col gap-3 border-b border-neutral-100 pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800>
        <div flex flex-wrap items-center gap-2.5>
          <span text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400>
            {{ cronLanguage === 'zh_CN' ? '标准 / 方言 :' : 'Dialect :' }}
          </span>
          <div class="inline-flex rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
            <button
              class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              :class="dialect === 'linux' ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'"
              @click="setDialect('linux')"
            >
              Linux / 5位
            </button>
            <button
              class="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              :class="dialect === 'java' ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'"
              @click="setDialect('java')"
            >
              Java & Spring / 6位
            </button>
          </div>
        </div>

        <div flex items-center justify-between gap-2.5 sm:justify-end>
          <n-radio-group v-model:value="cronLanguage" size="small">
            <n-radio-button value="zh_CN">
              中文
            </n-radio-button>
            <n-radio-button value="en">
              EN
            </n-radio-button>
          </n-radio-group>
          <c-button size="small" variant="text" @click="cron = dialect === 'linux' ? '* * * * *' : '0 * * * * ?'">
            <icon-mdi:trash-can-outline mr-1 />
            {{ cronLanguage === 'zh_CN' ? '重置' : 'Reset' }}
          </c-button>
        </div>
      </div>

      <!-- Visual Mode Tabs -->
      <div mb-4>
        <div class="flex items-center gap-1.5 overflow-x-auto border-b border-neutral-100 pb-2 dark:border-neutral-800">
          <button
            v-for="mode in [
              { id: 'presets', label: cronLanguage === 'zh_CN' ? '常用预设' : 'Presets', icon: 'mdi:bookmark-outline' },
              { id: 'interval', label: cronLanguage === 'zh_CN' ? '按间隔时间' : 'Interval', icon: 'mdi:timer-sand' },
              { id: 'daily', label: cronLanguage === 'zh_CN' ? '每天定点' : 'Daily', icon: 'mdi:weather-sunny' },
              { id: 'weekly', label: cronLanguage === 'zh_CN' ? '按星期/工作日' : 'Weekly', icon: 'mdi:calendar-week' },
              { id: 'monthly', label: cronLanguage === 'zh_CN' ? '按月份日期' : 'Monthly', icon: 'mdi:calendar-month' },
              { id: 'custom', label: cronLanguage === 'zh_CN' ? '字段高级微调' : 'Custom Fields', icon: 'mdi:tune' },
            ]"
            :key="mode.id"
            class="flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all"
            :class="activeMode === mode.id ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold' : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'"
            @click="activeMode = (mode.id as VisualMode)"
          >
            <span>{{ mode.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tab 1: Presets -->
      <div v-if="activeMode === 'presets'" mb-4>
        <div flex flex-wrap gap-2>
          <button
            v-for="p in currentPresets"
            :key="p.value"
            class="cursor-pointer border border-neutral-200 rounded-lg bg-neutral-50/80 px-3 py-2 text-xs text-neutral-700 font-medium transition-all dark:border-neutral-800 hover:border-emerald-500 dark:bg-neutral-800/80 hover:bg-emerald-50/50 dark:text-neutral-200 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
            @click="cron = p.value"
          >
            <div class="font-semibold">
              {{ cronLanguage === 'zh_CN' ? p.label : p.en }}
            </div>
            <div class="mt-0.5 text-11px text-neutral-400 font-mono">
              {{ p.value }}
            </div>
          </button>
        </div>
      </div>

      <!-- Tab 2: Interval -->
      <div v-else-if="activeMode === 'interval'" mb-4 class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900/50">
        <div flex flex-wrap items-center gap-3>
          <span text-sm text-neutral-600 font-medium dark:text-neutral-300>
            {{ cronLanguage === 'zh_CN' ? '每隔' : 'Every' }}
          </span>
          <n-input-number v-model:value="intervalValue" :min="1" :max="intervalType === 'hours' ? 23 : 59" w-100px />
          <n-radio-group v-model:value="intervalType" size="small">
            <n-radio-button v-if="dialect === 'java'" value="seconds">
              {{ cronLanguage === 'zh_CN' ? '秒 (Seconds)' : 'Seconds' }}
            </n-radio-button>
            <n-radio-button value="minutes">
              {{ cronLanguage === 'zh_CN' ? '分钟 (Minutes)' : 'Minutes' }}
            </n-radio-button>
            <n-radio-button value="hours">
              {{ cronLanguage === 'zh_CN' ? '小时 (Hours)' : 'Hours' }}
            </n-radio-button>
          </n-radio-group>
          <span text-sm text-neutral-600 font-medium dark:text-neutral-300>
            {{ cronLanguage === 'zh_CN' ? '执行一次' : 'execute once' }}
          </span>
        </div>
      </div>

      <!-- Tab 3: Daily -->
      <div v-else-if="activeMode === 'daily'" mb-4 class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900/50">
        <div flex flex-wrap items-center gap-3>
          <span text-sm text-neutral-600 font-medium dark:text-neutral-300>
            {{ cronLanguage === 'zh_CN' ? '每天的' : 'Every day at' }}
          </span>
          <c-input-text v-model:value="dailyTime" type="time" w-140px />
          <span text-sm text-neutral-600 font-medium dark:text-neutral-300>
            {{ cronLanguage === 'zh_CN' ? '执行' : 'run' }}
          </span>
        </div>
      </div>

      <!-- Tab 4: Weekly -->
      <div v-else-if="activeMode === 'weekly'" mb-4 class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900/50">
        <div mb-3 flex flex-wrap items-center gap-2>
          <span mr-2 text-sm text-neutral-600 font-medium dark:text-neutral-300>
            {{ cronLanguage === 'zh_CN' ? '选择星期 :' : 'Select Days :' }}
          </span>
          <c-button size="small" variant="text" @click="selectWorkdays">
            {{ cronLanguage === 'zh_CN' ? '工作日 (一至五)' : 'Weekdays (Mon-Fri)' }}
          </c-button>
          <c-button size="small" variant="text" @click="selectWeekends">
            {{ cronLanguage === 'zh_CN' ? '周末 (六、日)' : 'Weekends (Sat-Sun)' }}
          </c-button>
          <c-button size="small" variant="text" @click="selectAllWeek">
            {{ cronLanguage === 'zh_CN' ? '整周' : 'All Week' }}
          </c-button>
        </div>

        <div mb-4 flex flex-wrap gap-1.5>
          <button
            v-for="w in weekOptions"
            :key="w.value"
            class="cursor-pointer border rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            :class="weeklyDays.includes(w.value) ? 'border-emerald-500 bg-emerald-500 text-white dark:bg-emerald-600 font-semibold shadow-sm' : 'border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'"
            @click="toggleWeekDay(w.value)"
          >
            {{ w.label }}
          </button>
        </div>

        <div flex items-center gap-3>
          <span text-sm text-neutral-600 font-medium dark:text-neutral-300>
            {{ cronLanguage === 'zh_CN' ? '具体执行时间 :' : 'At Time :' }}
          </span>
          <c-input-text v-model:value="weeklyTime" type="time" w-140px />
        </div>
      </div>

      <!-- Tab 5: Monthly -->
      <div v-else-if="activeMode === 'monthly'" mb-4 class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900/50">
        <div mb-2 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400>
          {{ cronLanguage === 'zh_CN' ? '选择每月的执行日期 (1 ~ 31 号) :' : 'Select Days of Month (1 - 31) :' }}
        </div>
        <div grid grid-cols-7 mb-4 gap-1 sm:grid-cols-11>
          <button
            v-for="day in 31"
            :key="day"
            class="cursor-pointer border rounded-md py-1.5 text-center text-xs font-mono transition-all"
            :class="monthlyDays.includes(day) ? 'border-emerald-500 bg-emerald-500 text-white dark:bg-emerald-600 font-bold shadow-sm' : 'border-neutral-200 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'"
            @click="toggleMonthlyDay(day)"
          >
            {{ day }}
          </button>
        </div>

        <div flex items-center gap-3>
          <span text-sm text-neutral-600 font-medium dark:text-neutral-300>
            {{ cronLanguage === 'zh_CN' ? '执行时间 :' : 'At Time :' }}
          </span>
          <c-input-text v-model:value="monthlyTime" type="time" w-140px />
        </div>
      </div>

      <!-- Tab 6: Custom Fields -->
      <div v-else-if="activeMode === 'custom'" mb-4 class="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900/50">
        <div grid grid-cols-2 gap-3 md:grid-cols-6 sm:grid-cols-3>
          <div v-if="dialect === 'java'">
            <div mb-1 text-xs text-neutral-500 font-medium>
              秒 (0-59)
            </div>
            <c-input-text v-model:value="customSec" placeholder="*" monospace />
          </div>
          <div>
            <div mb-1 text-xs text-neutral-500 font-medium>
              分 (0-59)
            </div>
            <c-input-text v-model:value="customMin" placeholder="*" monospace />
          </div>
          <div>
            <div mb-1 text-xs text-neutral-500 font-medium>
              时 (0-23)
            </div>
            <c-input-text v-model:value="customHour" placeholder="*" monospace />
          </div>
          <div>
            <div mb-1 text-xs text-neutral-500 font-medium>
              日 (1-31)
            </div>
            <c-input-text v-model:value="customDom" placeholder="*" monospace />
          </div>
          <div>
            <div mb-1 text-xs text-neutral-500 font-medium>
              月 (1-12)
            </div>
            <c-input-text v-model:value="customMonth" placeholder="*" monospace />
          </div>
          <div>
            <div mb-1 text-xs text-neutral-500 font-medium>
              周 (0-6)
            </div>
            <c-input-text v-model:value="customDow" placeholder="*" monospace />
          </div>
        </div>
      </div>

      <!-- Central Interactive Cron Expression Display Box -->
      <div class="my-4 border border-neutral-200 rounded-xl bg-neutral-50 px-3 py-4 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
        <div mb-1.5 text-center text-xs text-neutral-400 font-semibold tracking-wider uppercase>
          {{ dialect === 'java' ? 'Java / Spring Cron Expression (6-fields)' : 'Standard Linux Cron Expression (5-fields)' }}
        </div>
        <div class="flex items-center justify-center">
          <input
            v-model="cron"
            type="text"
            class="w-full border-0 bg-transparent text-center text-18px text-neutral-900 font-bold tracking-wider font-mono outline-none md:text-26px sm:text-24px dark:text-white"
            placeholder="* * * * *"
            spellcheck="false"
          >
        </div>

        <div class="mt-2 text-center text-sm text-emerald-600 font-semibold leading-relaxed sm:text-base dark:text-emerald-400">
          {{ cronString }}
        </div>

        <div class="mt-3 flex justify-center">
          <c-button
            type="primary"
            :class="isJustCopied ? '!bg-emerald-600' : ''"
            @click="copy()"
          >
            <icon-mdi:check v-if="isJustCopied" mr-1.5 text-16px />
            <icon-mdi:content-copy v-else mr-1.5 text-16px />
            {{ isJustCopied ? (cronLanguage === 'zh_CN' ? '已复制！' : 'Copied!') : (cronLanguage === 'zh_CN' ? '复制 Cron 表达式' : 'Copy Expression') }}
          </c-button>
        </div>
      </div>

      <!-- Next Executions Forecast -->
      <div v-if="nextExecutions.length > 0" class="mt-4 border border-neutral-200 rounded-xl bg-neutral-50 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/50">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold tracking-wider uppercase dark:text-neutral-400">
            <icon-mdi:calendar-clock text-16px class="text-emerald-500" />
            <span>{{ cronLanguage === 'zh_CN' ? '未来 5 次执行时间预估' : 'Next 5 Scheduled Runs' }}</span>
          </div>
          <span text-11px text-neutral-400 font-mono>Realtime forecast</span>
        </div>
        <div class="grid grid-cols-1 gap-2 text-xs text-neutral-700 font-mono sm:grid-cols-2 dark:text-neutral-300">
          <div
            v-for="(time, idx) in nextExecutions"
            :key="time"
            class="shadow-xs flex items-center gap-2 border border-neutral-200/60 rounded-lg bg-white px-3 py-2 dark:border-neutral-700/50 dark:bg-neutral-800"
          >
            <span class="rounded bg-emerald-500/10 px-1.5 py-0.5 text-10px text-emerald-600 font-bold dark:bg-emerald-500/20 dark:text-emerald-400">#{{ idx + 1 }}</span>
            <span>{{ time }}</span>
          </div>
        </div>
      </div>
    </c-card>

    <!-- Syntax Schema Reference Card -->
    <c-card>
      <div class="mb-2 text-sm text-neutral-700 font-semibold dark:text-neutral-200">
        {{ dialect === 'java' ? 'Java / Quartz Cron 语法规范 (6位)' : 'Linux Crontab 语法规范 (5位)' }}
      </div>
      <pre v-if="dialect === 'java'" class="overflow-x-auto rounded-lg bg-neutral-900 p-3 text-xs text-neutral-200 leading-relaxed font-mono">
┌────────────── 秒 Seconds (0 - 59)
| ┌──────────── 分 Minutes (0 - 59)
| | ┌────────── 时 Hours (0 - 23)
| | | ┌──────── 日 Day of month (1 - 31)
| | | | ┌────── 月 Month (1 - 12) 或 JAN-DEC
| | | | | ┌──── 星期 Day of week (1 - 7 或 SUN-SAT, ? 表示不指定)
| | | | | |
* * * * * ?</pre>
      <pre v-else class="overflow-x-auto rounded-lg bg-neutral-900 p-3 text-xs text-neutral-200 leading-relaxed font-mono">
┌──────────── 分 Minutes (0 - 59)
| ┌────────── 时 Hours (0 - 23)
| | ┌──────── 日 Day of month (1 - 31)
| | | ┌────── 月 Month (1 - 12) 或 JAN-DEC
| | | | ┌──── 星期 Day of week (0 - 6, 0=Sunday) 或 SUN-SAT
| | | | |
* * * * * command</pre>
    </c-card>
  </div>
</template>
