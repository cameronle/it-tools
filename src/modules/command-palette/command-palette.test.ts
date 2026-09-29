import { afterEach, describe, expect, it } from 'vitest';
import { type VueWrapper, mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import CommandPalette from './command-palette.vue';

describe('CommandPalette', () => {
  let wrapper: VueWrapper | undefined;

  afterEach(() => {
    wrapper?.unmount();
    document.body.innerHTML = '';
  });

  it('opens as a complete, accessible command dialog', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div />' } }],
    });
    await router.push('/');
    await router.isReady();

    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      missingWarn: false,
      fallbackWarn: false,
      warnHtmlMessage: false,
      messages: {
        en: {
          search: {
            label: 'Search',
            placeholder: 'Search tools and commands...',
            suggested: 'Suggested',
            close: 'Close search',
            noResults: 'No matching tools or commands',
            noResultsHint: 'Try a tool name, action, or keyword.',
            navigate: 'Navigate',
            open: 'Open',
          },
        },
      },
    });

    wrapper = mount(CommandPalette, {
      attachTo: document.body,
      global: {
        plugins: [createPinia(), router, i18n],
      },
    });

    await wrapper.get('button').trigger('click');
    await wrapper.vm.$nextTick();

    const dialog = document.body.querySelector('[role="dialog"]');
    const input = dialog?.querySelector('input');

    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(input?.getAttribute('placeholder')).toBe('Search tools and commands...');
    expect(dialog?.querySelector('[aria-label="Close search"]')).not.toBeNull();
    expect(dialog?.textContent).toContain('Suggested');
    expect(dialog?.textContent).toContain('Navigate');
    expect(dialog?.textContent).toContain('Open');
    expect(document.body.classList.contains('command-palette-open')).toBe(true);

    if (input) {
      input.value = 'definitely-no-matching-tool';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await wrapper.vm.$nextTick();
    }

    expect(dialog?.textContent).toContain('No matching tools or commands');
    expect(dialog?.textContent).toContain('Try a tool name, action, or keyword.');

    dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(document.body.querySelector('[role="dialog"]')).toBeNull();
    expect(document.body.classList.contains('command-palette-open')).toBe(false);
  });
});
