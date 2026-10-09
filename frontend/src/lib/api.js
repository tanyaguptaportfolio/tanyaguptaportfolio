export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: options.signal
      ? AbortSignal.any([options.signal, AbortSignal.timeout(12000)])
      : AbortSignal.timeout(12000),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(
      typeof body.detail === 'string' ? body.detail : 'Please check your details and try again.',
    )
  }
  return response.json()
}

export function filterProjects(projects, role) {
  return role === 'all' ? projects : projects.filter((project) => project.category === role)
}
