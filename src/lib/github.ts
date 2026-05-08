export interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  fork: boolean
  archived: boolean
  pushed_at: string | null
}

export const GITHUB_USER = 'aircrushin'

export async function fetchAllUserRepos(user: string = GITHUB_USER): Promise<GithubRepo[]> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'user-agent': `${user}-portfolio-site`,
    'x-github-api-version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) {
    headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  const all: GithubRepo[] = []
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `https://api.github.com/users/${user}/repos?per_page=100&sort=updated&page=${page}`,
      { headers },
    )
    if (!res.ok) {
      const txt = await res.text()
      throw new Error(`GitHub fetch failed (${res.status}): ${txt.slice(0, 200)}`)
    }
    const batch = (await res.json()) as GithubRepo[]
    all.push(...batch)
    if (batch.length < 100) break
  }
  return all
}
