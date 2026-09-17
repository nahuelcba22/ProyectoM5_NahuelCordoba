import { z } from "zod";

export const CreateRepositorySchema = z.object({
  name: z.string()
    .min(1, "El nombre del repositorio es obligatorio")
    .max(100, "El nombre es demasiado largo")
    .regex(/^[A-Za-z0-9_.-]+$/, "Solo letras, números, guiones y puntos")
    .describe("El nombre exacto que tendrá el nuevo repositorio."),
  description: z.string().optional()
    .describe("Una breve descripción del propósito del repositorio."),
  private: z.boolean().default(false)
    .describe("Si es true, el repositorio será privado. Por defecto es falso (público)."),
});

export type CreateRepositoryInput = z.infer< typeof CreateRepositorySchema >;

export const ListRepositoriesSchema = z.object({
  type: z.enum(["all", "owner", "public", "private", "member"]).default("owner")
    .describe("El tipo de repositorios a listar (ej. 'owner' para los propios, 'public' o 'private')."),
  sort: z.enum(["created", "updated", "pushed", "full_name"]).default("updated")
    .describe("Criterio para ordenar la lista de repositorios."),
  per_page: z.number().int().min(1).max(100).default(30)
    .describe("Cantidad de resultados por página (máximo 100)."),
  page: z.number().int().min(1).default(1)
    .describe("Número de página para la paginación."),
});

export type ListRepositoriesInput = z.infer< typeof ListRepositoriesSchema >;

export const CreateIssueSchema = z.object({
  owner: z.string().min(1, "El owner es obligatorio")
    .describe("El nombre de usuario o de la organización dueña del repositorio."),
  repo: z.string().min(1, "El repo es obligatorio")
    .describe("El nombre del repositorio donde se creará el issue."),
  title: z.string().min(1, "El título es obligatorio")
    .describe("El título del issue a crear."),
  body: z.string().optional()
    .describe("El contenido o descripción extendida del issue."),
});

export type CreateIssueInput = z.infer< typeof CreateIssueSchema >;

export const ListIssuesSchema = z.object({
  owner: z.string().min(1, "El owner es obligatorio")
    .describe("Dueño del repositorio."),
  repo: z.string().min(1, "El repo es obligatorio")
    .describe("Nombre del repositorio del que se leerán los issues."),
  state: z.enum(["open", "closed", "all"]).default("open")
    .describe("Filtra los issues por su estado: abiertos, cerrados o todos."),
});

export type ListIssuesInput = z.infer< typeof ListIssuesSchema >;

export const CreateCommitSchema = z.object({
  owner: z.string().min(1).describe("Dueño del repositorio."),
  repo: z.string().min(1).describe("Nombre del repositorio."),
  branch: z.string().min(1).describe("Nombre de la rama donde se hará el commit, ej: 'main'."),
  path: z.string().min(1).describe("La ruta y nombre del archivo a crear o modificar, ej: 'src/index.js'."),
  content: z.string().describe("El contenido exacto del archivo en texto plano."),
  message: z.string().min(1).describe("El mensaje del commit que explica el cambio."),
});

export type CreateCommitInput = z.infer< typeof CreateCommitSchema >;