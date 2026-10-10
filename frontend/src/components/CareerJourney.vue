<script setup>
import { Award, MapPin, ArrowUpRight } from '@lucide/vue'

defineProps({
  experience: { type: Array, required: true },
  education: { type: Array, required: true },
  certifications: { type: Array, required: true },
})
</script>

<template>
  <div class="experience-layout">
    <div>
      <h2>Experience &amp; learning.<br /><em>A journey in motion.</em></h2>
      <p class="section-description">
        Professional work, community involvement, and continuous learning.
      </p>
    </div>
    <div class="career-content">
      <section v-if="experience.length" class="career-group" aria-labelledby="experience-heading">
        <h3 id="experience-heading" class="career-group-title">Experience &amp; involvement</h3>
        <article v-for="job in experience" :key="`${job.company}-${job.title}`" class="career-item">
          <div class="career-meta">
            <span>{{ job.category }}</span
            ><span>{{ job.period }}</span>
          </div>
          <h4 class="career-name">{{ job.company }}</h4>
          <p>{{ job.title }}</p>
          <p v-if="job.location" class="career-location"><MapPin :size="14" />{{ job.location }}</p>
          <ul v-if="job.highlights.length">
            <li v-for="detail in job.highlights" :key="detail">{{ detail }}</li>
          </ul>
        </article>
      </section>
      <section v-if="education.length" class="career-group" aria-labelledby="learning-heading">
        <h3 id="learning-heading" class="career-group-title">Education &amp; learning</h3>
        <article
          v-for="course in education"
          :key="`${course.institution}-${course.degree}`"
          class="career-item"
        >
          <div class="career-meta">
            <span>{{ course.category || 'Learning' }}</span
            ><span>{{ course.period }}</span>
          </div>
          <h4 class="career-name">{{ course.institution }}</h4>
          <p>{{ course.degree }}</p>
          <p v-if="course.grade" class="education-grade">Grade: {{ course.grade }}</p>
          <p v-if="course.recognition" class="education-recognition">{{ course.recognition }}</p>
          <p v-if="course.location" class="career-location">
            <MapPin :size="14" />{{ course.location }}
          </p>
        </article>
      </section>
    </div>
  </div>
  <div>
    <!--start: Newly added section for certifications and achievements-->
    <section
      v-if="certifications.length"
      class="career-group"
      aria-labelledby="certification-heading"
    >
      <h3 id="certification-heading" class="career-group-title">
        Certifications &amp; achievements
      </h3>
      <div class="carousel">
        <div class="group" :style="{ '--duration': `${certifications.length * 6}s` }">
          <template v-for="copy in 2" :key="copy">
            <article
              v-for="certification in certifications"
              :key="`${copy}-${certification.issuer}-${certification.name}`"
              class="card certification-entry"
              :class="{ 'is-clone': copy === 2 }"
              :aria-hidden="copy === 2 ? 'true' : undefined"
              :inert="copy === 2"
            >
              <Award :size="30" class="credential-icon" aria-hidden="true" />
              <div>
                <span class="credential-issuer"
                  >{{ certification.issuer }} ·
                  {{ certification.category || 'Certification' }}</span
                >
                <h4 class="career-name">{{ certification.name }}</h4>
                <span
                  v-if="
                    certification.verified && certification.category !== 'Trailhead achievement'
                  "
                  class="credential-status"
                  :class="{ verified: certification.verified }"
                  >Verified credential</span
                >
                <p class="credential-details">{{ certification.details }}</p>
                <a
                  v-if="
                    certification.credential_url &&
                    certification.category !== 'Trailhead achievement'
                  "
                  class="text-link credential-link"
                  :href="certification.credential_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  >View credential <ArrowUpRight :size="16" aria-hidden="true" /><span
                    class="sr-only"
                    >(opens in a new tab)</span
                  ></a
                >
              </div>
            </article>
          </template>
        </div>
      </div>
    </section>
    <!--end: Newly added section for certifications and achievements-->
  </div>
</template>

<style scoped>
/*start: Newly added styles for certifications and achievements*/
.carousel {
  display: flex;
  justify-content: flex;
  overflow: hidden;
  gap: 1em;
  width: 100%;
}
.carousel::-webkit-scrollbar {
  display: none;
}
.group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;
  animation: spin var(--duration, 10s) infinite linear;
  padding-right: 1em;
  align-items: stretch;
  flex-shrink: 0;
  width: max-content;
}
.card {
  flex: 0 0 5em;
  padding: 1em;
  background-color: var(--line);
  border-radius: 8px;
  flex: 0 0 min(420px, 85vw);
}
@keyframes spin {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
/*end: Newly added styles for certifications and achievements*/
.journey-note {
  margin-top: 24px;
  max-width: 380px;
  font-size: 11px;
  line-height: 1.8;
  color: var(--muted);
}
.career-group + .career-group {
  margin-top: 36px;
}
.career-group-title {
  font-size: 12px;
  font-weight: 650;
  color: var(--green);
  margin-bottom: 8px;
}
.career-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
  font-size: 10px;
  color: var(--muted);
}
.career-name {
  font-family: 'Manrope', sans-serif;
  margin: 10px 0 0;
  font-size: 22px;
  line-height: 1.4;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.career-item p {
  color: var(--muted);
}
.career-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.certification-entry {
  display: flex;
  align-items: flex-start;
  gap: 17px;
  padding-block: 22px;
  border-block: 1px solid var(--line);
}
.credential-icon {
  flex-shrink: 0;
  color: var(--green);
  margin-top: 2px;
}
.credential-issuer {
  font-size: 10px;
  color: var(--muted);
}
.certification-entry .career-name {
  font-size: 19px;
  margin-top: 5px;
}
.credential-status {
  display: inline-block;
  font-size: 10px;
  color: #626858;
  background: #edf0e7;
  padding: 5px 8px;
  margin-top: 13px;
  border-radius: 3px;
}
.credential-status.verified {
  color: var(--green);
  background: #e1efdf;
}
.credential-details {
  font-size: 11px;
  line-height: 1.8;
  color: var(--muted);
  margin-top: 12px;
}
.credential-link {
  margin-top: 15px;
}
@media (max-width: 760px) {
  .career-name {
    font-size: 20px;
  }
  .journey-note {
    margin-top: 16px;
  }
  .certification-entry {
    gap: 12px;
  }
}
</style>
