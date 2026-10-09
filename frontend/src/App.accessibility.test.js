import { mount } from '@vue/test-utils'
import axe from 'axe-core'
import { expect, it, vi } from 'vitest'
import App from './App.vue'

it('has no detectable structural accessibility violations', async () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  const wrapper = mount(App, { attachTo: document.body })
  try {
    const results = await axe.run(wrapper.element, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      rules: { 'color-contrast': { enabled: false } },
    })
    expect(
      results.violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map((node) => node.target),
      })),
    ).toEqual([])
  } finally {
    wrapper.unmount()
    vi.unstubAllGlobals()
  }
})
