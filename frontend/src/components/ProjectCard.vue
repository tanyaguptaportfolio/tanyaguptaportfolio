<script setup>
import { ArrowUpRight, Database, Check, Code2, Layers, ArrowRight } from '@lucide/vue'
defineProps({ project: { type: Object, required: true } })
defineEmits(['open'])
</script>

<template>
  <article class="project-card">
    <button
      class="project-open"
      :aria-label="`Read ${project.title}`"
      @click="$emit('open', project)"
    >
      <div class="project-art" :class="project.color" aria-hidden="true">
        <span class="art-caption">{{ project.tags[0] }} / Sample concept</span>
        <div v-if="project.kind === 'dashboard'" class="mini-dashboard">
          <div class="mini-top">
            <span>Performance overview</span><span class="mini-dot"></span>
          </div>
          <div class="mini-stats">
            <div><small>Revenue</small><strong>128.4k</strong></div>
            <div><small>Growth</small><strong>+18.6%</strong></div>
            <div><small>Conversion</small><strong>4.2%</strong></div>
          </div>
          <div class="mini-bars">
            <span
              v-for="(height, index) in [35, 52, 43, 68, 58, 78, 70, 91, 82, 100]"
              :key="index"
              :style="{ height: `${height}%` }"
            ></span>
          </div>
          <div class="mini-axis"><span>JAN</span><span>JUN</span><span>DEC</span></div>
        </div>
        <div v-else-if="project.kind === 'pipeline'" class="pipeline-art">
          <div class="pipeline-node"><Database :size="30" /><span>Extract</span></div>
          <ArrowRight :size="20" />
          <div class="pipeline-node"><Layers :size="30" /><span>Transform</span></div>
          <ArrowRight :size="20" />
          <div class="pipeline-node"><Check :size="30" /><span>Validate</span></div>
          <span class="pipeline-tag">raw data → meaningful information</span>
        </div>
        <div v-else-if="project.kind === 'code'" class="code-art">
          <div class="code-title">
            <span class="window-dots">● ● ●</span><span>service-design.java</span
            ><Code2 :size="15" />
          </div>
          <pre><span>public class</span> ThoughtfulService {
  <span>private final</span> Repository data;

  Result handle(Request request) {
    validate(request);
    <span>return</span> data.process(request);
  }
}</pre>
        </div>
        <div v-else class="operations-art">
          <div
            v-for="(label, index) in ['Plan', 'In progress', 'Complete']"
            :key="label"
            class="workflow-column"
          >
            <span>{{ label }}</span>
            <div v-for="item in index === 1 ? 2 : 3" :key="item" class="workflow-item">
              <i></i><b></b><small></small>
            </div>
          </div>
        </div>
        <span class="project-art-arrow"><ArrowUpRight :size="23" /></span>
      </div>
      <div class="project-meta">
        <span>{{ project.tags[0] }}</span
        ><span>Illustrative project</span>
      </div>
      <h3>{{ project.title }}</h3>
      <p>{{ project.subtitle }}</p>
      <div class="tag-list">
        <span v-for="tag in project.tags" :key="tag">{{ tag }}</span>
      </div>
    </button>
  </article>
</template>
