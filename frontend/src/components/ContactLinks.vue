<script setup>
import { Mail, Phone, ExternalLink, ArrowUpRight } from '@lucide/vue'
defineProps({ contact: { type: Object, required: true } })
</script>

<template>
  <nav class="contact-links" aria-label="Direct contact options">
    <a class="contact-link" :href="`mailto:${contact.email}`"
      ><Mail :size="19" /><span
        ><small>Email</small><strong>{{ contact.email }}</strong></span
      ><ArrowUpRight :size="17"
    /></a>
    <a class="contact-link" :href="`tel:${contact.phone}`"
      ><Phone :size="19" /><span
        ><small>Phone</small><strong>{{ contact.phone_display }}</strong></span
      ><ArrowUpRight :size="17"
    /></a>
    <a class="contact-link" :href="contact.linkedin_url" target="_blank" rel="noopener noreferrer"
      ><ExternalLink :size="19" /><span
        ><small>LinkedIn</small><strong>View LinkedIn profile</strong
        ><span class="sr-only">(opens in a new tab)</span></span
      ><ArrowUpRight :size="17"
    /></a>
    <a class="contact-link" :href="contact.github_url" target="_blank" rel="noopener noreferrer"
      ><ExternalLink :size="19" /><span
        ><small>GitHub</small><strong>View GitHub repository</strong
        ><span class="sr-only">(opens in a new tab)</span></span
      ><ArrowUpRight :size="17"
    /></a>
  </nav>
</template>

<style scoped>
.contact-links {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
}
.contact-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-block: 16px;
  border-top: 1px solid #d7bac3;
  transition: color 0.2s;
}
.contact-link:last-child {
  border-bottom: 1px solid #d7bac3;
}
.contact-link:hover {
  color: #85455a;
}
.contact-link > svg {
  flex-shrink: 0;
}
.contact-link > svg:last-child {
  margin-left: auto;
}
.contact-link > span {
  min-width: 0;
}
.contact-link small {
  display: block;
  font-size: 10px;
  color: #725b63;
  margin-bottom: 5px;
}
.contact-link strong {
  display: block;
  font-size: 13px;
  font-weight: 550;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
@media (max-width: 760px) {
  .contact-links {
    margin-top: 23px;
  }
  .contact-link strong {
    font-size: 12px;
  }
}
</style>
