import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";
import { AuthenticationError } from "../errors/index.js";

dotenv.config();

export function getGithubClient(): Octokit {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new AuthenticationError("GITHUB_TOKEN no está definido en las variables de entorno.");
  }

  return new Octokit({
    auth: token,
    userAgent: "github-mcp-agent/1.0",
  });
}