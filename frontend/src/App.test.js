import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import content from '../../content/portfolio.json'
import App from './App.vue'

let wrapper

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => content }))
})

afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

async function render(data = content) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }))
  wrapper = mount(App, { attachTo: document.body, props: { portfolio: data } })
  await flushPromises()
}

it('removes resume controls and hides empty career history', async () => {
  await render({ ...content, experience: [], education: [], certifications: [] })
  expect(wrapper.text()).not.toMatch(/resume|\bCVs?\b/i)
  expect(wrapper.find('#experience').exists()).toBe(false)
  expect(wrapper.find('a[href="#experience"]').exists()).toBe(false)
  await wrapper.find('.mobile-toggle').trigger('click')
  expect(wrapper.find('#mobile-navigation a[href="#experience"]').exists()).toBe(false)
  expect(wrapper.find('a[href="#skills"].button').text()).toBe('Explore expertise')
})

it('introduces a software developer building a career in Norway', async () => {
  await render()
  expect(wrapper.find('.hero-description').text()).toContain(
    'Software developer with a diverse skill set',
  )
  expect(wrapper.find('.hero-description').text()).toContain('A new chapter in Norway')
  expect(wrapper.find('.hero-description').text()).toContain('contribute and belong')
  const about = wrapper.find('.about-copy').text()
  expect(about).toContain('September 2025')
  expect(about).toContain('Norwegian culture')
  expect(about).toContain('local working environment')
  expect(about).toContain('build a meaningful career')
})

it('includes frontend, Salesforce, and DevOps expertise', async () => {
  await render()
  for (const role of ['frontend', 'salesforce', 'devops']) {
    await wrapper.find(`#tab-${role}`).trigger('click')
    const expected = content.roles.find((item) => item.id === role)
    expect(wrapper.find('[role="tabpanel"]').text()).toContain(expected.description)
    for (const skill of expected.skills) {
      expect(wrapper.find('[role="tabpanel"]').text()).toContain(skill)
    }
  }
})

it('shows Databricks and Azure Data Factory in Data Engineering and AWS in Java', async () => {
  await render()
  await wrapper.find('#tab-data-engineering').trigger('click')
  expect(wrapper.find('[role="tabpanel"]').text()).toContain('Databricks')
  expect(wrapper.find('[role="tabpanel"]').text()).toContain('Azure Data Factory')
  await wrapper.find('#tab-java').trigger('click')
  expect(wrapper.find('[role="tabpanel"]').text()).toContain('AWS')
  expect(wrapper.find('[role="tabpanel"]').text()).not.toContain('Azure Data Factory')
})

it('loads bundled portfolio content without making API requests', async () => {
  await render()
  expect(fetch).not.toHaveBeenCalled()
  expect(wrapper.find('.about-copy').text()).toBe(content.about)
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(content.roles.length)
})

it("shows Tanya's portrait in About with lazy loading and reserved dimensions", async () => {
  await render()
  const portrait = wrapper.find('#about .about-portrait img')
  expect(portrait.attributes('src')).toContain('images/image.png')
  expect(portrait.attributes('alt')).toBe('Portrait of Tanya')
  expect(portrait.attributes('loading')).toBe('lazy')
  expect(portrait.attributes('width')).toBe('1646')
  expect(portrait.attributes('height')).toBe('2010')
  expect(wrapper.find('.about-portrait figcaption').text()).toContain('Software developer')
})

it('selects the first configured expertise and handles empty or replaced roles', async () => {
  const salesforce = content.roles.find((role) => role.id === 'salesforce')
  await render({ ...content, roles: [salesforce] })
  expect(wrapper.find('#tab-salesforce').attributes('aria-selected')).toBe('true')
  expect(wrapper.find('[role="tabpanel"]').text()).toContain(salesforce.description)
  await wrapper.setProps({ portfolio: { ...content, roles: [] } })
  expect(wrapper.find('[role="tabpanel"]').exists()).toBe(false)
  await wrapper.setProps({ portfolio: content })
  expect(wrapper.find('#tab-frontend').attributes('aria-selected')).toBe('true')
})

it('removes Ideas in practice and its navigation targets', async () => {
  await render()
  expect(wrapper.find('#work').exists()).toBe(false)
  expect(wrapper.find('.project-card').exists()).toBe(false)
  expect(wrapper.find('a[href="#work"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('Ideas in practice')
  expect(wrapper.find('#skills .section-number').text()).toBe('02 /')
  expect(wrapper.find('#experience .section-number').text()).toBe('03 /')
  expect(wrapper.find('.hero-buttons .button-dark').attributes('href')).toBe('#experience')
})

it('shows general application support and operations with ITIL practices', async () => {
  await render()
  await wrapper.find('#tab-operations').trigger('click')
  const panel = wrapper.find('[role="tabpanel"]')
  expect(panel.text()).toContain('Application support & operations')
  expect(panel.text()).not.toMatch(/Salesforce|CRM/)
  for (const skill of [
    'Incident response',
    'SLA management',
    'ITIL practices',
    'L2/L3 application support',
    'Application troubleshooting',
    'Log analysis',
    'Grafana monitoring',
  ]) {
    expect(panel.text()).toContain(skill)
  }
})

it('removes the data demo and keeps consecutive section numbers', async () => {
  await render()
  expect(wrapper.find('#lab').exists()).toBe(false)
  expect(wrapper.find('canvas').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('Data, a little more alive')
  expect(wrapper.findAll('main .section-number').map((entry) => entry.text())).toEqual([
    '01 /',
    '02 /',
    '03 /',
    '04 /',
  ])
})

it('supports keyboard navigation across all seven expertise tabs', async () => {
  await render()
  await wrapper.find('#tab-frontend').trigger('keydown', { key: 'End' })
  expect(wrapper.find('#tab-operations').attributes('aria-selected')).toBe('true')
  await wrapper.find('#tab-operations').trigger('keydown', { key: 'Home' })
  expect(wrapper.find('#tab-frontend').attributes('aria-selected')).toBe('true')
})

it('moves focus into mobile navigation and restores it on Escape', async () => {
  await render()
  const toggle = wrapper.find('.mobile-toggle')
  await toggle.trigger('click')
  expect(toggle.attributes('aria-expanded')).toBe('true')
  expect(document.activeElement).toBe(wrapper.find('#mobile-navigation a').element)
  await wrapper.find('#mobile-navigation a').trigger('keydown', { key: 'Escape' })
  expect(toggle.attributes('aria-expanded')).toBe('false')
  expect(document.activeElement).toBe(toggle.element)
  expect(wrapper.find('#mobile-navigation').isVisible()).toBe(false)
})

it('closes mobile navigation when resizing to desktop', async () => {
  await render()
  await wrapper.find('.mobile-toggle').trigger('click')
  vi.stubGlobal('innerWidth', 1024)
  window.dispatchEvent(new Event('resize'))
  await flushPromises()
  expect(wrapper.find('.mobile-toggle').attributes('aria-expanded')).toBe('false')
})

it('keeps the page usable without IntersectionObserver', async () => {
  vi.stubGlobal('IntersectionObserver', undefined)
  await render()
  expect(wrapper.find('#about').exists()).toBe(true)
  expect(wrapper.find('[role="tabpanel"]').attributes('tabindex')).toBe('0')
})

it('shows the organizations, verified certifications, and Trailhead achievements', async () => {
  await render()
  const journey = wrapper.find('#experience')
  for (const organization of [
    'Cognizant',
    'AWS re/Start',
    'Oslo, Norway',
    'Norway Cup 2026',
    'Caritas',
    'Norsk kurs',
  ]) {
    expect(journey.text()).toContain(organization)
  }
  const credentials = journey.findAll('.certification-entry')
  expect(credentials).toHaveLength(6)
  for (const [index, credential] of credentials.entries()) {
    expect(credential.text()).toContain(content.certifications[index].name)
    if (index < 4) {
      expect(credential.find('.credential-status').text()).toBe('Verified credential')
      const link = credential.find('.credential-link')
      expect(link.attributes('href')).toBe(content.certifications[index].credential_url)
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    } else {
      expect(credential.find('.credential-status').exists()).toBe(false)
      expect(credential.find('.credential-link').exists()).toBe(false)
    }
  }
  expect(credentials[4].find('.credential-issuer').text()).toContain('Trailhead achievement')
  expect(journey.findAll('.credential-link')).toHaveLength(4)
  expect(credentials[4].find('.credential-link').exists()).toBe(false)
  expect(credentials[5].text()).toContain('Triple Star Ranger')
  expect(journey.text()).not.toContain('Verification link not provided')
  expect(wrapper.text()).not.toMatch(/resume|\bCVs?\b/i)
})

it('provides the exact email, phone, and a safe external LinkedIn link', async () => {
  await render()
  expect(wrapper.find(`a[href="mailto:${content.contact.email}"]`).text()).toContain(
    content.contact.email,
  )
  expect(wrapper.find('a[href="tel:+4740152755"]').text()).toContain('+47 401 52 755')
  const linkedin = wrapper.find(`a[href="${content.contact.linkedin_url}"]`)
  expect(linkedin.attributes('target')).toBe('_blank')
  expect(linkedin.attributes('rel')).toContain('noopener')
})

it('shows supplied dates without confirmation or draft-status notes', async () => {
  await render()
  expect(wrapper.text()).not.toMatch(
    /pending confirmation|awaiting confirmation|after confirmation|Draft skill map|Verification link not provided/i,
  )
  expect(wrapper.find('#experience').text()).toContain('Jul 2021 - Aug 2025')
  const learning = wrapper.find('[aria-labelledby="learning-heading"]')
  expect(learning.text()).toContain('AWS re/Start')
  expect(learning.text()).toContain('Caritas')
  for (const course of content.education) {
    expect(learning.text()).toContain(course.period)
  }
  expect(wrapper.find('.verification-note').exists()).toBe(false)
  expect(wrapper.find('.skills-disclaimer').exists()).toBe(false)
  expect(wrapper.find('.journey-note').exists()).toBe(false)
})
