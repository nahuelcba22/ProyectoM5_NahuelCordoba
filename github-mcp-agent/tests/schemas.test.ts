import { describe, it, expect } from "vitest";
import { CreateRepositorySchema } from "../src/schemas/index.js";

describe("Validación de Schemas con Zod", () => {
  it("Debe aceptar un input válido para crear repositorio", () => {
    const result = CreateRepositorySchema.safeParse({ 
      name: "mi-nuevo-repo", 
      private: true 
    });
    expect(result.success).toBe(true);
  });

  it("Debe rechazar si falta el nombre del repositorio (input inválido)", () => {
    const result = CreateRepositorySchema.safeParse({ 
      private: true 
      
    });
    
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("name");
    }
  });
});