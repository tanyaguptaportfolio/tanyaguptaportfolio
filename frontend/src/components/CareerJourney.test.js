import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import CareerJourney from './CareerJourney.vue'
import content from '../../../content/portfolio.json'

it('shows the degree, dates, grade, and HK-dir recognition only for the degree', () => {
  const wrapper = mount(CareerJourney, {
    props: { experience: [], education: content.education, certifications: [] },
  })
  const education = wrapper.find('[aria-labelledby="learning-heading"]')
  expect(education.text()).toContain('Education & learning')
  const degree = education.findAll('.career-item')[0]
  expect(degree.text()).toContain('University of Mumbai')
  expect(degree.text()).toContain('Bachelor of Engineering in Information Technology')
  expect(degree.text()).toContain('2017 - 2021')
  expect(degree.text()).toContain('Grade: 80.2%')
  expect(degree.text()).toContain('Recognized by HK-dir')
  expect(education.findAll('.education-recognition')).toHaveLength(1)
})
