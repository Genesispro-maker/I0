type Push = {
  name: string
  description?: string
  isPrivate?: boolean
  branch?: string
  files: Array<{ path: string, content: string }>
  message?: string
}

type params = {
  owner: string
  repo: string
  branch?: string
  message: string
  files: Array<{ path: string, content: string }>
}

type info = {
  fullname: string
  owner: string
  repo: string
  cloneUrl: string
  htmlUrl: string
  defaultBranch: string
}

type result = info & {
  commitSha: string
  branch: string
}

export class Git {
  private apiKey: string
  private baseUrl: string

  constructor({ apiKey }: { apiKey: string }) {
    if (!apiKey) throw new Error("GitHub Personal Access Token is required.")
    this.apiKey = apiKey
    this.baseUrl = "https://api.github.com"
  }

  private async request<T = unknown>(endpoint: string, method = "GET", body?: Record<string, unknown> | null,): Promise<T>{
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Authorization": `token ${this.apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
        "X-Github-Api-Version": "2022-11-28",
      },
      body: body != null ? JSON.stringify(body) : undefined
    })

    if(res.status === 204) return null as T
    if(!res.ok){
      throw new Error(`error ${res.status}: ${res.statusText}`)
    }

    return res.json() as T
  }

  private repo(owner: string, repo: string){
    return <T = unknown>(endpoint: string, method = "GET", body?: Record<string, unknown> | null) => {
      return this.request<T>(`/repos/${owner}/${repo}${endpoint}`, method, body)
    }
  }

  private encode(content: string): string {
    return btoa(unescape(encodeURIComponent(content)))
  }

  private async init(owner: string, repo: string, files: Array<{ path: string, content: string }>, branch = "main", message = "Initial fking commit"){
    const req = this.repo(owner, repo)
    const ref = await req<{ object: { sha: string }}>(`/git/refs/heads/${branch}`)
    const parentsha = ref.object.sha
    const commits = await req<{ tree: { sha: string }}>(`/git/commits/${parentsha}`)
    const base = commits.tree.sha

    const items = await Promise.all(files.map(async (file) => {
      const blob = await req<{ sha: string }>(`/git/blobs`, "POST", {
        content: this.encode(file.content),
        encoding: "base64",
      })

      return {
        path: file.path.replace(/^\//, ""),
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      }
    }))

    const tree = await req<{ sha: string }>("/git/trees", "POST", {
      base_tree: base,
      tree: items,
    })

    const commit = await req<{ sha: string }>("/git/commits", "POST", {
      message,
      tree: tree.sha,
      parents: [parentsha],
    })

    await req<{ sha: string }>(`/git/refs/heads/${branch}`, "PATCH", {
      sha: commit.sha,
    })

    return commit.sha;
  }

  async push({owner, repo, branch = "main", message, files}: params){
    const req = this.repo(owner, repo)

    const ref = await req<{ object: { sha: string } }>(`/git/refs/heads/${branch}`)
    const latest = ref.object.sha
    const commits = await req<{ tree: { sha: string }}>(`/git/commits/${latest}`)
    const base = commits.tree.sha

    const items = await Promise.all(
      files.map(async (file) => {
        const blob = await req<{ sha: string }>(`/git/blobs`, "POST", {
          content: this.encode(file.content),
          encoding: "base64",
        })

        return {
          path: file.path.replace(/^\//, ""),
          mode: "100644",
          type: "blob",
          sha: blob.sha
        }
      }))

      const tree = await req<{ sha: string }>("/git/trees", "POST", {
        base_tree: base,
        tree: items
      })

      const commit = await req<{ sha: string }>("/git/commits", "POST", {
        message,
        tree: tree.sha,
        parents: [latest]
      })

      await req(`/git/refs/heads/${branch}`, "PATCH", {
        sha: commit.sha,
      })

      return {
        sha: commit.sha
      }
  }

  async create({name, description = '', isPrivate = false,}: {name: string, description: string, isPrivate: boolean,}): Promise<info>{
    const data = await this.request<{full_name: string, owner: { login: string }, name: string, clone_url: string, html_url: string, default_branch: string }>("/user/repos", "POST", {
      name,
      description,
      private: isPrivate,
      auto_init: true,
    })

    return {
      fullname: data.full_name,
      owner: data.owner.login,
      repo: data.name, 
      cloneUrl: data.clone_url,
      htmlUrl: data.html_url,
      defaultBranch: data.default_branch,
    }
  }

   async origin({name, description = "", isPrivate = false, branch = "main", files, message = "Initial fking commit",}: Push): Promise<result> {
     const info = await this.create({name, description, isPrivate})
     await new Promise(r => setTimeout(r, 1000))
     const commit = await this.init(info.owner, info.repo, files, branch, message)

     return {
      ...info,
      commitSha: commit,
      branch,
     }
   }
}
