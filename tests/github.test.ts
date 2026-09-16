import { describe, it, expect, vi } from "vitest";
import { listRepositories, createIssue } from "../src/github/operations.js";
import * as client from "../src/github/client.js";
import { AuthenticationError, GitHubAPIError } from "../src/errors/index.js";

describe("Operaciones de GitHub (Octokit Mockeado)", () => {
  
  it("Debe listar repositorios exitosamente (Caso feliz)", async () => {
    const mockOctokit = {
      rest: {
        repos: {
          listForAuthenticatedUser: vi.fn().mockResolvedValue({
            data: [{ name: "repo-mock", full_name: "user/repo-mock", html_url: "url", private: false }]
          })
        }
      }
    };
    vi.spyOn(client, 'getGithubClient').mockReturnValue(mockOctokit as any);

    const result = await listRepositories({ type: "all", sort: "updated", per_page: 10, page: 1 });
    
    expect(result).toBeDefined();
    expect(result![0].name).toBe("repo-mock");
  });

  it("Debe crear un issue exitosamente", async () => {
    const mockOctokit = {
      rest: {
        issues: {
          create: vi.fn().mockResolvedValue({
            data: { number: 1, title: "Bug fix", html_url: "url" }
          })
        }
      }
    };
    vi.spyOn(client, 'getGithubClient').mockReturnValue(mockOctokit as any);

    const result = await createIssue({ owner: "user", repo: "repo", title: "Bug fix" });
    expect(result!.number).toBe(1);
  });

  it("Debe fallar si no hay credenciales (Caso Edge / Credenciales inválidas)", async () => {
    vi.spyOn(client, 'getGithubClient').mockImplementation(() => {
      throw new AuthenticationError("Sin token");
    });

    await expect(listRepositories({ type: "all", sort: "updated", per_page: 10, page: 1 }))
      .rejects.toThrowError(AuthenticationError);
  });

  it("Debe lanzar GitHubAPIError cuando la API devuelve un error (Caso Edge / Repo no existe)", async () => {
    const mockOctokit = {
      rest: {
        repos: {
          listForAuthenticatedUser: vi.fn().mockRejectedValue({
            status: 404,
            message: "Not Found"
          })
        }
      }
    };
    vi.spyOn(client, 'getGithubClient').mockReturnValue(mockOctokit as any);

    await expect(listRepositories({ type: "all", sort: "updated", per_page: 10, page: 1 }))
      .rejects.toThrowError(GitHubAPIError);
  });
});