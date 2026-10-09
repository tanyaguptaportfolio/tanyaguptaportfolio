<script setup>
import { reactive, ref } from 'vue'
import { Mail, LoaderCircle, CheckCircle2 } from '@lucide/vue'
import { request } from '../lib/api'

const props = defineProps({ enabled: { type: Boolean, default: false } })
const form = reactive({ name: '', email: '', subject: '', message: '', website: '' })
const sending = ref(false)
const error = ref('')
const success = ref('')

async function submit() {
  if (!props.enabled || sending.value) return
  sending.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await request('/contact', { method: 'POST', body: JSON.stringify(form) })
    success.value = response.message
    Object.keys(form).forEach((key) => {
      form[key] = ''
    })
  } catch (failure) {
    error.value = failure.message || 'Unable to send right now. Please try again.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <form
    class="contact-form"
    :aria-describedby="!enabled ? 'contact-unavailable' : undefined"
    @submit.prevent="submit"
  >
    <p v-if="!enabled" id="contact-unavailable" class="contact-banner" role="note">
      Send message is not available yet. Please contact me using the email, phone, or LinkedIn
      links. This form does not send or save any information.
    </p>
    <div class="form-row">
      <label
        >Your name<input
          v-model="form.name"
          name="name"
          autocomplete="name"
          placeholder="Alex Morgan"
          required
          minlength="2"
          maxlength="100"
          :disabled="sending" /></label
      ><label
        >Email address<input
          v-model="form.email"
          name="email"
          autocomplete="email"
          type="email"
          placeholder="alex@company.com"
          required
          :disabled="sending"
      /></label>
    </div>
    <label
      >What brings you here?<input
        v-model="form.subject"
        name="subject"
        placeholder="A role, a project, or a conversation"
        required
        minlength="3"
        maxlength="150"
        :disabled="sending"
    /></label>
    <label
      >Your message<textarea
        v-model="form.message"
        name="message"
        rows="4"
        placeholder="Tell me a little about what you have in mind..."
        required
        minlength="20"
        maxlength="5000"
        :disabled="sending"
      ></textarea>
    </label>
    <div class="honeypot" aria-hidden="true">
      <label
        >Website<input v-model="form.website" name="website" tabindex="-1" autocomplete="off"
      /></label>
    </div>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <p v-if="success" class="form-success" role="status">
      <CheckCircle2 :size="18" />{{ success }}
    </p>
    <button
      class="button button-dark"
      :class="{ 'contact-disabled': !enabled }"
      type="submit"
      :disabled="!enabled || sending"
      :aria-describedby="!enabled ? 'contact-unavailable' : undefined"
    >
      <LoaderCircle v-if="sending" :size="18" class="spin" /><Mail v-else :size="18" /><span>{{
        sending ? 'Sending...' : 'Send message'
      }}</span>
    </button>
  </form>
</template>

<style scoped>
.contact-banner {
  padding: 14px 16px;
  border: 1px solid #bca1a9;
  border-radius: 4px;
  background: #ffffff70;
  color: #594951;
  font-size: 12px;
  line-height: 1.7;
}
.contact-disabled,
.contact-disabled:hover {
  background: #d6d6d6;
  border-color: #b7b7b7;
  color: #565656;
  opacity: 1;
  transform: none;
}
</style>
