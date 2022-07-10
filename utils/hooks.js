import useSWR from 'swr'

const fetcher = (url, token) =>
  fetch(url, {
    method: 'GET',
    headers: new Headers({ 'Content-Type': 'application/json', token }),
    credentials: 'same-origin',
  }).then((res) => res.json())

export function useLanguages(token) {
  const { data, mutate, error } = useSWR(
    token ? ['/api/languages', token] : null,
    fetcher
  )

  const loading = !data && !error
  const languages = data?.data
  return [languages, { mutate, loading, error }]
}
export function useUsers(token) {
  const {
    data: users,
    mutate,
    error,
  } = useSWR(token ? ['/api/users', token] : null, fetcher)
  const loading = !users && !error
  return [users, { mutate, loading, error }]
}
export function useProjects({ token, language_code }) {
  const { data, mutate, error } = useSWR(
    token ? [`/api/${language_code}/projects`, token] : null,
    fetcher
  )
  const loading = !data && !error
  const projects = data
  return [projects, { mutate, loading, error }]
}
export function useUserProjects({ token, id }) {
  const { data, mutate, error } = useSWR(
    token ? [`/api/users/${id}/projects`, token] : null,
    fetcher
  )

  const loading = !data && !error
  const projects = data
  return [projects, { mutate, loading, error }]
}
export function useUserProjectRole({ token, id, code }) {
  const { data, mutate, error } = useSWR(
    token ? [`/api/users/${id}/projects/${code}`, token] : null,
    fetcher
  )

  const loading = !data && !error
  const userProjectRoles = data
  return [userProjectRoles, { mutate, loading, error }]
}
export function useMethod(token) {
  const { data, mutate, error } = useSWR(token ? ['/api/methods', token] : null, fetcher)
  const loading = !data && !error
  const methods = data
  return [methods, { mutate, loading, error }]
}
export function useProject({ token, code }) {
  const {
    data: project,
    mutate,
    error,
  } = useSWR(token ? [`/api/[lang]/projects/${code}`, token] : null, fetcher)
  const loading = !project && !error
  return [project, { mutate, loading, error }]
}
export function useCoordinators({ token, code }) {
  const {
    data: coordinators,
    mutate,
    error,
  } = useSWR(token ? [`/api/[id]/projects/${code}/coordinators`, token] : null, fetcher)
  const loading = !coordinators && !error
  return [coordinators, { mutate, loading, error }]
}
export function useModerators({ token, code }) {
  const {
    data: moderators,
    mutate,
    error,
  } = useSWR(token ? [`/api/[id]/projects/${code}/moderators`, token] : null, fetcher)
  const loading = !moderators && !error
  return [moderators, { mutate, loading, error }]
}
export function useTranslators({ token, code }) {
  const {
    data: translators,
    mutate,
    error,
  } = useSWR(token ? [`/api/[id]/projects/${code}/translators`, token] : null, fetcher)
  const loading = !translators && !error
  return [translators, { mutate, loading, error }]
}
export function useCurrentUser({ token, id }) {
  const {
    data: currentUser,
    mutate,
    error,
  } = useSWR(token ? [`/api/users/${id}`, token] : null, fetcher)
  const loading = !currentUser && !error
  return [currentUser, { mutate, loading, error }]
}
export function useRoles({ token, code }) {
  const {
    data: roles,
    mutate,
    error,
  } = useSWR(token ? [`/api/[id]/projects/${code}/roles`, token] : null, fetcher)
  const loading = !roles && !error
  return [roles, { mutate, loading, error }]
}
export function usePermissions({ token, role }) {
  // console.log({ role }, 'hooks')
  const {
    data: permissions,
    mutate,
    error,
  } = useSWR(token ? [`/api/permissions/${role}`, token] : null, fetcher)
  const loading = !permissions && !error
  return [permissions, { mutate, loading, error }]
}
