<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  PanelsTopLeft,
  Cloud,
  GitBranch,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Database,
  Code2,
  Workflow,
  Check,
} from '@lucide/vue'
import portfolioContent from '../../content/portfolio.json'
import ContactForm from './components/ContactForm.vue'
import ContactLinks from './components/ContactLinks.vue'
import CareerJourney from './components/CareerJourney.vue'

const { portfolio } = defineProps({
  portfolio: { type: Object, default: () => portfolioContent },
})
const workspaceImage = `${import.meta.env.BASE_URL}images/workspace.jpg`
const portraitImage = `${import.meta.env.BASE_URL}images/image.png`
const skillRole = ref(portfolio.roles[0]?.id ?? '')
const menuOpen = ref(false)
const menuButton = ref(null)
const mobileNavigation = ref(null)
const activeSection = ref('home')
const roleIcons = {
  frontend: PanelsTopLeft,
  salesforce: Cloud,
  devops: GitBranch,
  analytics: BarChart3,
  'data-engineering': Database,
  java: Code2,
  operations: Workflow,
}
const selectedSkills = computed(() => portfolio.roles.find((role) => role.id === skillRole.value))
const hasJourney = computed(() =>
  Boolean(
    portfolio.experience.length || portfolio.education.length || portfolio.certifications.length,
  ),
)
let observer
const navigationLinks = computed(() => [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Expertise' },
  ...(hasJourney.value ? [{ id: 'experience', label: 'Journey' }] : []),
])

watch(
  () => portfolio.roles,
  (roles) => {
    if (!roles.some((role) => role.id === skillRole.value)) skillRole.value = roles[0]?.id ?? ''
  },
)

async function toggleMenu() {
  menuOpen.value = !menuOpen.value
  if (menuOpen.value) {
    await nextTick()
    mobileNavigation.value?.querySelector('a')?.focus()
  }
}

function closeMenu(restoreFocus = false) {
  if (!menuOpen.value) return
  menuOpen.value = false
  if (restoreFocus) menuButton.value?.focus()
}

function handleResize() {
  if (window.innerWidth > 760) closeMenu()
}

async function navigateSkills(event) {
  const roles = portfolio.roles
  if (!roles.length) return
  let index = roles.findIndex((role) => role.id === skillRole.value)
  if (['ArrowRight', 'ArrowDown'].includes(event.key)) index = (index + 1) % roles.length
  else if (['ArrowLeft', 'ArrowUp'].includes(event.key))
    index = (index - 1 + roles.length) % roles.length
  else if (event.key === 'Home') index = 0
  else if (event.key === 'End') index = roles.length - 1
  else return
  event.preventDefault()
  skillRole.value = roles[index].id
  await nextTick()
  document.getElementById(`tab-${skillRole.value}`)?.focus()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  if (typeof window.IntersectionObserver !== 'function') return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection.value = entry.target.id
      })
    },
    { rootMargin: '-20% 0px -55% 0px' },
  )
  document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section))
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  observer?.disconnect()
})
</script>

<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" @keydown.esc.prevent="closeMenu(true)">
    <a href="#home" class="wordmark" aria-label="Tanya, home">tanya<span>.</span></a>
    <nav class="desktop-nav" aria-label="Main navigation">
      <a
        v-for="link in navigationLinks"
        :key="link.id"
        :href="`#${link.id}`"
        :class="{ current: activeSection === link.id }"
        :aria-current="activeSection === link.id ? 'location' : undefined"
        >{{ link.label }}</a
      >
    </nav>
    <div class="header-actions">
      <a class="header-contact" href="#contact" @click="closeMenu()"
        >Let's connect <ArrowUpRight :size="17" /></a
      ><button
        ref="menuButton"
        class="icon-button mobile-toggle"
        :aria-expanded="menuOpen"
        aria-controls="mobile-navigation"
        :aria-label="menuOpen ? 'Close navigation' : 'Open navigation'"
        @click="toggleMenu"
      >
        <X v-if="menuOpen" :size="23" /><Menu v-else :size="23" />
      </button>
    </div>
    <nav
      v-show="menuOpen"
      id="mobile-navigation"
      ref="mobileNavigation"
      class="mobile-nav"
      aria-label="Mobile navigation"
    >
      <a
        v-for="link in [...navigationLinks, { id: 'contact', label: 'Contact' }]"
        :key="link.id"
        :href="`#${link.id}`"
        @click="closeMenu()"
        >{{ link.label }}</a
      >
    </nav>
  </header>

  <main id="main" tabindex="-1">
    <section id="home" class="hero-section isolate">
      <img
        class="hero-image"
        :src="workspaceImage"
        alt="A bright workspace with a laptop, notebook, and plants"
        fetchpriority="high"
        width="2000"
        height="1333"
      />
      <div class="hero-wash"></div>
      <div class="hero-content container">
        <div class="hero-topline">
          <span class="eyebrow"><span class="status-dot"></span> Technology · Possibility</span
          ><span class="hero-index">PORTFOLIO / 2026</span>
        </div>
        <p class="hero-intro">Hello, I'm</p>
        <h1>Tanya<span class="hero-period">.</span></h1>
        <p class="hero-headline">A curious mind.<br />A connected perspective.</p>
        <p class="hero-description">
          Software developer with a diverse skill set.<br class="desktop-break" />
          A new chapter in Norway. A chance to contribute and belong.
        </p>
        <div class="hero-buttons">
          <a :href="hasJourney ? '#experience' : '#about'" class="button button-dark"
            >Explore my journey <ArrowUpRight :size="19" /></a
          ><a href="#skills" class="button button-light">
            Explore expertise <ArrowRight :size="17" />
          </a>
        </div>
        <a class="hero-scroll" href="#about"><ArrowDown :size="17" /> A little more about me</a>
      </div>
      <div class="hero-side-note">ALWAYS CURIOUS. ALWAYS CONNECTING.</div>
    </section>

    <div class="discipline-strip" aria-label="Career perspectives">
      <span>Frontend</span><Sparkles :size="17" /><span>Salesforce</span
      ><Sparkles :size="17" /><span>DevOps</span><Sparkles :size="17" /> <span>Analytics</span
      ><Sparkles :size="17" /><span>Data engineering</span><Sparkles :size="17" /><span
        >Software development</span
      ><Sparkles :size="17" /><span>Operations</span>
    </div>

    <template v-if="portfolio">
      <section id="about" class="section container about-section">
        <div class="section-label">
          <span class="section-number">01 /</span><span>Behind the work</span>
        </div>
        <div class="about-layout">
          <div>
            <h2>Different disciplines.<br /><em>One thoughtful approach.</em></h2>
            <p class="about-copy">{{ portfolio.about }}</p>
            <a class="text-link" href="#skills"
              >Explore the perspectives <ArrowRight :size="18"
            /></a>
          </div>
          <div class="about-person">
            <figure class="about-portrait">
              <img
                :src="portraitImage"
                alt="Portrait of Tanya"
                width="1646"
                height="2010"
                loading="lazy"
                decoding="async"
              />
              <figcaption>Tanya <span>Software developer · Norway</span></figcaption>
            </figure>
            <div class="about-note">
              <Sparkles :size="30" stroke-width="1.3" />
              <p>
                Understand the problem.<br />Connect the dots.<br /><strong
                  >Build with purpose.</strong
                >
              </p>
              <span>THE WAY I THINK</span>
            </div>
          </div>
        </div>
      </section>

      <section id="skills" class="section container skills-section">
        <div class="section-label">
          <span class="section-number">02 /</span><span>Tools &amp; perspectives</span>
        </div>
        <div class="section-heading">
          <h2>A versatile toolkit.<br /><em>A focused mindset.</em></h2>
        </div>
        <div class="skills-layout">
          <div class="skill-tabs" role="tablist" aria-label="Skill perspectives">
            <button
              v-for="role in portfolio.roles"
              :id="`tab-${role.id}`"
              :key="role.id"
              role="tab"
              :aria-selected="skillRole === role.id"
              :tabindex="skillRole === role.id ? 0 : -1"
              aria-controls="skill-panel"
              :class="{ active: skillRole === role.id }"
              @click="skillRole = role.id"
              @keydown="navigateSkills"
            >
              <component :is="roleIcons[role.id] || Code2" :size="21" aria-hidden="true" /><span>{{
                role.label
              }}</span
              ><ArrowUpRight :size="18" />
            </button>
          </div>
          <div
            v-if="selectedSkills"
            id="skill-panel"
            class="skill-panel"
            role="tabpanel"
            tabindex="0"
            :aria-labelledby="`tab-${skillRole}`"
          >
            <p class="eyebrow">{{ selectedSkills.label }}</p>
            <h3>{{ selectedSkills.description }}</h3>
            <div class="skill-list">
              <span v-for="skill in selectedSkills.skills" :key="skill"
                ><Check :size="16" />{{ skill }}</span
              >
            </div>
          </div>
        </div>
      </section>

      <section v-if="hasJourney" id="experience" class="section container experience-section">
        <div class="section-label">
          <span class="section-number">03 /</span><span>The journey</span>
        </div>
        <CareerJourney
          :experience="portfolio.experience"
          :education="portfolio.education"
          :certifications="portfolio.certifications"
        />
      </section>

      <section id="contact" class="section contact-section">
        <div class="container contact-layout">
          <div>
            <div class="section-label">
              <span class="section-number">{{ hasJourney ? '04' : '03' }} /</span
              ><span>The next conversation</span>
            </div>
            <h2>Great things start<br />with <em>a hello.</em></h2>
            <p class="contact-copy">
              A meaningful opportunity. An interesting challenge.<br />A different perspective.
              Let's talk.
            </p>
            <ContactLinks :contact="portfolio.contact" />
          </div>
          <ContactForm />
        </div>
      </section>
    </template>
  </main>

  <footer class="site-footer container">
    <a href="#home" class="wordmark">tanya<span>.</span></a
    ><span>A little curiosity goes a long way.</span
    ><a href="#home" class="text-link">Back to top <ArrowUpRight :size="17" /></a
    ><small>© {{ new Date().getFullYear() }} Tanya</small>
  </footer>
</template>
