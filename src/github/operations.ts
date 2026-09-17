import { getGithubClient } from "./client.js";
import { GitHubAPIError, NetworkError } from "../errors/index.js";
import { logger } from "../utils/logging.js";
import type { 
  CreateRepositoryInput, 
  ListRepositoriesInput, 
  CreateIssueInput, 
  ListIssuesInput, 
  CreateCommitInput 
} from "../schemas/index.js";

function handleGithubError(err: any): never {
  if (err.status) {
    throw new GitHubAPIError(err.message, err.status);
  }
  if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
    throw new NetworkError();
  }
  throw err;
}

export async function createRepository(input: CreateRepositoryInput) {
  // Ya corregido:
  logger.info(`Creando repositorio: ${input.name}`);
  const octokit = getGithubClient();
  try {
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name: input.name,
      description: input.description,
      private: input.private,
    });
    
    return { name: response.data.name, url: response.data.html_url };
  } catch (err) {
    handleGithubError(err);
  }
}

export async function listRepositories(input: ListRepositoriesInput) {
  logger.info(`Listando repositorios tipo: ${input.type}`);
  const octokit = getGithubClient();
  try {
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      type: input.type as any,
      sort: input.sort,
      per_page: input.per_page,
      page: input.page,
    });
    return response.data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url,
      private: repo.private,
    }));
  } catch (err) {
    handleGithubError(err);
  }
}

export async function createIssue(input: CreateIssueInput) {
  // Ya corregido:
  logger.info(`Creando issue en ${input.owner}/${input.repo}`);
  const octokit = getGithubClient();
  try {
    const response = await octokit.rest.issues.create({
      owner: input.owner,
      repo: input.repo,
      title: input.title,
      body: input.body,
    });
    return {
      number: response.data.number,
      title: response.data.title,
      url: response.data.html_url,
    };
  } catch (err) {
    handleGithubError(err);
  }
}

export async function listIssues(input: ListIssuesInput) {
  // Ya corregido:
  logger.info(`Listando issues de ${input.owner}/${input.repo}`);
  const octokit = getGithubClient();
  try {
    const response = await octokit.rest.issues.listForRepo({
      owner: input.owner,
      repo: input.repo,
      state: input.state,
    });
    return response.data.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      url: issue.html_url,
    }));
  } catch (err) {
    handleGithubError(err);
  }
}

export async function createCommit(input: CreateCommitInput) {
  // Ya corregido:
  logger.info(`Creando commit en ${input.owner}/${input.repo} [${input.branch}]`);
  const octokit = getGithubClient();
  try {
    const refResp = await octokit.rest.git.getRef({
      owner: input.owner,
      repo: input.repo,
      ref: `heads/${input.branch}`
    });
    const baseCommitSha = refResp.data.object.sha;

    const baseCommit = await octokit.rest.git.getCommit({
      owner: input.owner,
      repo: input.repo,
      commit_sha: baseCommitSha
    });
    const baseTreeSha = baseCommit.data.tree.sha;

    const blobResp = await octokit.rest.git.createBlob({
      owner: input.owner,
      repo: input.repo,
      content: Buffer.from(input.content, 'utf8').toString('base64'),
      encoding: 'base64'
    });

    const treeResp = await octokit.rest.git.createTree({
      owner: input.owner,
      repo: input.repo,
      base_tree: baseTreeSha,
      tree: [{
        path: input.path,
        mode: '100644', 
        type: 'blob',
        sha: blobResp.data.sha
      }]
    });

    const commitResp = await octokit.rest.git.createCommit({
      owner: input.owner,
      repo: input.repo,
      message: input.message,
      tree: treeResp.data.sha,
      parents: [baseCommitSha]
    });

    await octokit.rest.git.updateRef({
      owner: input.owner,
      repo: input.repo,
      ref: `heads/${input.branch}`,
      sha: commitResp.data.sha
    });

  
    return {
      commitSha: commitResp.data.sha,
      url: `https://github.com/${input.owner}/${input.repo}/commit/${commitResp.data.sha}`
    };
  } catch (err) {
    handleGithubError(err);
  }
}