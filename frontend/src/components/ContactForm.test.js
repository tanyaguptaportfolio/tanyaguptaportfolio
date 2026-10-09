import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import ContactForm from './ContactForm.vue'

afterEach(() => vi.unstubAllGlobals())

it('shows an unavailable banner and greyed-out button while preserving editable fields', () => {
  const wrapper = mount(ContactForm)
  expect(wrapper.find('[role="note"]').text()).toContain('Send message is not available yet')
  expect(wrapper.find('form').attributes('aria-describedby')).toBe('contact-unavailable')
  expect(wrapper.find('button').element.disabled).toBe(true)
  expect(wrapper.find('button').classes()).toContain('contact-disabled')
  expect(wrapper.findAll('input, textarea').every((control) => !control.element.disabled)).toBe(
    true,
  )
  expect(wrapper.text()).not.toContain('stored privately')
})

it('never sends a request or claims success even if submitted programmatically', async () => {
  vi.stubGlobal('fetch', vi.fn())
  const wrapper = mount(ContactForm)
  await wrapper.find('form').trigger('submit')
  expect(fetch).not.toHaveBeenCalled()
  expect(wrapper.find('[role="status"]').exists()).toBe(false)
})

it('retains successful submission behavior when explicitly enabled', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ message: 'Received. Thank you.' }) }),
  )
  const wrapper = mount(ContactForm, { props: { enabled: true } })
  expect(wrapper.find('[role="note"]').exists()).toBe(false)
  await wrapper.find('[name="name"]').setValue('Hiring Manager')
  await wrapper.find('[name="email"]').setValue('hiring@example.com')
  await wrapper.find('[name="subject"]').setValue('Interview')
  await wrapper.find('[name="message"]').setValue('Let us discuss an opportunity next week.')
  await wrapper.find('form').trigger('submit')
  await flushPromises()
  expect(fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST' }))
  expect(wrapper.find('[role="status"]').text()).toContain('Received')
  expect(wrapper.find('[name="name"]').element.value).toBe('')
})

it('preserves entered details if an enabled submission fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')))
  const wrapper = mount(ContactForm, { props: { enabled: true } })
  await wrapper.find('[name="message"]').setValue('An opportunity worth discussing.')
  await wrapper.find('form').trigger('submit')
  await flushPromises()
  expect(wrapper.find('[role="alert"]').text()).toBe('Network unavailable')
  expect(wrapper.find('[name="message"]').element.value).toBe('An opportunity worth discussing.')
})
