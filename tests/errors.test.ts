import { describe, it, expect } from "vitest";
import { formatErrorForLLM, GitHubAPIError, NetworkError } from "../src/errors/index.js";

describe("Transformación de Errores a Lenguaje Natural", () => {
  it("Debe transformar un error 404 a un mensaje comprensible", () => {
    const error = new GitHubAPIError("Not found", 404);
    const mensaje = formatErrorForLLM(error);
    expect(mensaje).toContain("no fue encontrado");
  });

  it("Debe explicar un error de red temporal", () => {
    const error = new NetworkError();
    const mensaje = formatErrorForLLM(error);
    expect(mensaje).toContain("problema temporal");
  });
});