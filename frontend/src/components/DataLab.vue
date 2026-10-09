<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js'
import { ArrowUpRight } from '@lucide/vue'

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)
const period = ref('year')
const canvas = ref(null)
const values = [28, 42, 36, 55, 49, 64, 60, 78, 71, 89, 82, 96]
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const visible = computed(() => (period.value === 'quarter' ? 3 : period.value === 'half' ? 6 : 12))
const total = computed(() => values.slice(0, visible.value).reduce((sum, value) => sum + value, 0))
let chart

function updateChart() {
  if (!chart) return
  chart.data.labels = labels.slice(0, visible.value)
  chart.data.datasets[0].data = values.slice(0, visible.value)
  chart.update()
}

watch(period, updateChart)
onMounted(() => {
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: '#2c775b',
          hoverBackgroundColor: '#f1b9c8',
          borderRadius: 3,
          maxBarThickness: 36,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500 },
      plugins: {
        tooltip: { callbacks: { label: (context) => `${context.parsed.y}k sample revenue` } },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: {
          beginAtZero: true,
          border: { display: false },
          grid: { color: '#edf0ec' },
          ticks: { callback: (value) => `${value}k` },
        },
      },
    },
  })
})
onUnmounted(() => chart?.destroy())
</script>

<template>
  <div class="data-lab">
    <div class="lab-top">
      <div>
        <p class="eyebrow">The insight workspace</p>
        <h3>Performance, in perspective.</h3>
      </div>
      <div class="segmented" role="group" aria-label="Chart time range">
        <button
          v-for="option in [
            { id: 'quarter', label: 'Q1' },
            { id: 'half', label: 'H1' },
            { id: 'year', label: 'Year' },
          ]"
          :key="option.id"
          :aria-pressed="period === option.id"
          :class="{ active: period === option.id }"
          @click="period = option.id"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="lab-metric">
      <span>Sample revenue</span><strong>{{ total }}<small>k</small></strong
      ><span class="lab-indicator"><ArrowUpRight :size="16" /> Synthetic dataset</span>
    </div>
    <div class="chart-container">
      <canvas
        ref="canvas"
        role="img"
        :aria-label="`Synthetic revenue chart showing ${visible} months, totaling ${total} thousand`"
      ></canvas>
    </div>
    <details class="chart-table">
      <summary>View data table</summary>
      <table>
        <caption>
          Synthetic revenue, in thousands
        </caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Revenue</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, index) in values.slice(0, visible)" :key="index">
            <th scope="row">{{ labels[index] }}</th>
            <td>{{ value }}k</td>
          </tr>
        </tbody>
      </table>
    </details>
  </div>
</template>
