import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { logger } from "./utils/logging.js";
import { formatErrorForLLM, ValidationError } from "./errors/index.js";
import * as github from "./github/operations.js";

import {
  CreateRepositorySchema,
  ListRepositoriesSchema,
  CreateIssueSchema,
  ListIssuesSchema,
  CreateCommitSchema
} from "./schemas/index.js";

const server = new Server(
  {
    name: "github-mcp-agent",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_repository",
        description: "Crea un nuevo repositorio en GitHub.",
        inputSchema: zodToJsonSchema(CreateRepositorySchema as any),
      },
      {
        name: "list_repositories",
        description: "Lista los repositorios de GitHub del usuario autenticado.",
        inputSchema: zodToJsonSchema(ListRepositoriesSchema as any),
      },
      {
        name: "create_issue",
        description: "Abre un nuevo issue o tarea en un repositorio de GitHub específico.",
        inputSchema: zodToJsonSchema(CreateIssueSchema as any),
      },
      {
        name: "list_issues",
        description: "Lista los issues abiertos o cerrados de un repositorio.",
        inputSchema: zodToJsonSchema(ListIssuesSchema as any),
      },
      {
        name: "create_commit",
        description: "Realiza un commit avanzado agregando o modificando un archivo.",
        inputSchema: zodToJsonSchema(CreateCommitSchema as any),
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    switch (name) {
      case "create_repository": {
        const parsed = CreateRepositorySchema.safeParse(args);
        if (!parsed.success) throw new ValidationError(parsed.error.message);
        result = await github.createRepository(parsed.data);
        break;
      }
      case "list_repositories": {
        const parsed = ListRepositoriesSchema.safeParse(args);
        if (!parsed.success) throw new ValidationError(parsed.error.message);
        result = await github.listRepositories(parsed.data);
        break;
      }
      case "create_issue": {
        const parsed = CreateIssueSchema.safeParse(args);
        if (!parsed.success) throw new ValidationError(parsed.error.message);
        result = await github.createIssue(parsed.data);
        break;
      }
      case "list_issues": {
        const parsed = ListIssuesSchema.safeParse(args);
        if (!parsed.success) throw new ValidationError(parsed.error.message);
        result = await github.listIssues(parsed.data);
        break;
      }
      case "create_commit": {
        const parsed = CreateCommitSchema.safeParse(args);
        if (!parsed.success) throw new ValidationError(parsed.error.message);
        result = await github.createCommit(parsed.data);
        break;
      }
      default:
        throw new Error(`La herramienta ${name} no existe.`);
    }
    
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
    
  } catch (error) {
    const formattedMessage = formatErrorForLLM(error);
    logger.error(`Error ejecutando tool [${name}]: ${formattedMessage}`);
    
    return {
      content: [{ type: "text", text: formattedMessage }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("GitHub MCP Agent iniciado correctamente.");
}

main().catch((err) => {
  logger.error("Error fatal iniciando el servidor", err);
  process.exit(1);
});