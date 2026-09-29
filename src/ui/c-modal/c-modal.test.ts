import { afterEach, describe, expect, it } from 'vitest';
import { type VueWrapper, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import CModal from './c-modal.vue';

describe('CModal', () => {
  let wrapper: VueWrapper | undefined;

  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = '';
  });

  it('top-aligns the dialog container when centered is false', () => {
    wrapper = mount(CModal, {
      attachTo: document.body,
      global: {
        plugins: [createPinia()],
      },
      props: {
        open: true,
        centered: false,
      },
      slots: {
        default: 'Dialog content',
      },
    });

    const overlay = document.body.querySelector('.c-modal--overlay');
    const container = document.body.querySelector('.c-modal--container');

    expect(overlay?.classList.contains('items-center')).toBe(false);
    expect(container?.classList.contains('c-modal--container--top')).toBe(true);
    expect((container as HTMLElement | null)?.style.backgroundColor).toBe('rgb(255, 255, 255)');
  });
});
