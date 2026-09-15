// src/errors/index.ts

// Clase base para nuestros errores
export class AppError extends Error {
  constructor(public message: string, public code: string) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Token de autenticación inválido o ausente.") {
    super(message, "AUTH_ERROR");
    this.name = "AuthenticationError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string = "Error transitorio de red al conectar con GitHub.") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class GitHubAPIError extends AppError {
  constructor(message: string, public status?: number) {
    super(message, "GITHUB_API_ERROR");
    this.name = "GitHubAPIError";
  }
}

/**
 * Esta función transforma un error técnico en un mensaje de lenguaje natural
 * para que el LLM pueda explicárselo al usuario de forma clara.
 */
export function formatErrorForLLM(error: unknown): string {
  if (error instanceof ValidationError) {
    return `Error de validación: ${error.message}. Por favor, corrige los datos e intenta de nuevo.`;
  }
  if (error instanceof AuthenticationError) {
    return `Error de autenticación: Verifica que el GITHUB_TOKEN esté configurado correctamente en el archivo .env y tenga los permisos necesarios.`;
  }
  if (error instanceof NetworkError) {
    return `Error de red: Tuvimos un problema temporal conectando con GitHub. Sugiero esperar unos segundos y reintentar.`;
  }
  if (error instanceof GitHubAPIError) {
    if (error.status === 404) {
      return `Error en GitHub: El repositorio o recurso no fue encontrado (404). Verifica que el nombre esté bien escrito y tengas acceso.`;
    }
    if (error.status === 403) {
      return `Error en GitHub: Permisos insuficientes o límite de peticiones (rate limit) excedido (403).`;
    }
    if (error.status === 422) {
      return `Error en GitHub: GitHub rechazó la solicitud (422). Es probable que el repositorio ya exista o los datos sean inválidos.`;
    }
    return `Error en la API de GitHub: ${error.message}`;
  }
  
  // Fallback para errores desconocidos
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `Ocurrió un error inesperado: ${errorMessage}`;
}