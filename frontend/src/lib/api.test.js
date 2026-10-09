import { afterEach, describe, expect, it, vi } from 'vitest'
import { filterProjects, request } from './api'

afterEach(() => vi.unstubAllGlobals())

describe('project filtering', () => {
  const projects = [{ category: 'analytics' }, { category: 'java' }]
  it('keeps all projects when no role is selected', () => {
    expect(filterProjects(projects, 'all')).toEqual(projects)
  })
  it('shows only the requested role', () => {
    expect(filterProjects(projects, 'java')).toEqual([{ category: 'java' }])
  })
})

describe('API client', () => {
  it('returns successful JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: 'ok' }) }),
    )
    expect(await request('/health')).toEqual({ status: 'ok' })
  })
  it('surfaces a readable backend error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ detail: 'Please wait' }) }),
    )
    await expect(request('/contact')).rejects.toThrow('Please wait')
  })
})
