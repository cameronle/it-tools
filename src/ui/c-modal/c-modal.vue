<script setup lang="ts">
import { useTheme } from './c-modal.theme';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{
  open?: boolean
  centered?: boolean
  overlayClass?: string
  teleport?: boolean
}>(), {
  open: false,
  centered: true,
  overlayClass: '',
  teleport: true,
});

const emit = defineEmits(['update:open']);

const isOpen = useVModel(props, 'open', emit, { passive: true });

const { centered, overlayClass, teleport } = toRefs(props);

function close() {
  isOpen.value = false;
}

function open() {
  isOpen.value = true;
}

function toggle() {
  isOpen.value = !isOpen.value;
}

defineExpose({
  close,
  open,
  toggle,
  isOpen,
});

const theme = useTheme();
const modal = ref();

onClickOutside(modal, () => {
  if (isOpen.value) {
    close();
  }
});
</script>

<template>
  <Teleport to="body" :disabled="!teleport">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="c-modal--overlay"
        :class="[{ 'items-center': centered }, overlayClass]"
      >
        <div ref="modal" class="c-modal--container" v-bind="$attrs">
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="less">
.c-modal--overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  overflow-y: auto;
}

.c-modal--container {
  background-color: v-bind('theme.background');
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 12px;
  padding: 20px;
  max-width: 36rem;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  margin: auto 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  .c-modal--container {
    transform: scale(0.97);
  }
}
</style>
