// src/utils/logging.ts

/**
 * Logger seguro para MCP.
 * Imprime siempre por stderr (console.error) para no interrumpir 
 * la comunicación JSON-RPC en stdout.
 */
export const logger = {
  info: (msg: string) => console.error(`[INFO] ${msg}`),
  warn: (msg: string) => console.error(`[WARN] ${msg}`),
  error: (msg: string, err?: any) => {
    if (err) {
      console.error(`[ERROR] ${msg}`, err);
    } else {
      console.error(`[ERROR] ${msg}`);
    }
  }
};