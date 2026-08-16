<script lang="ts" setup>
import { useTheme } from './c-card.theme';

const props = defineProps<{
  title?: string
}>();

const { title } = toRefs(props);

const theme = useTheme();
</script>

<template>
  <div class="c-card">
    <div v-if="title" class="c-card-title">
      {{ title }}
    </div>
    <slot />
  </div>
</template>

<style lang="less" scoped>
.c-card {
  background-color: v-bind('theme.backgroundColor');
  border: 1px solid v-bind('theme.borderColor');
  border-radius: 12px;
  padding: 20px 24px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02);

  &-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
}
</style>
