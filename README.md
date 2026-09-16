# GitHub MCP Agent - AutomateHub

Servidor **Model Context Protocol (MCP)** que permite a agentes de Inteligencia Artificial como Claude, Gemini y otros modelos compatibles interactuar de forma segura y directa con la **API de GitHub mediante lenguaje natural**.

Desarrollado como un **MVP para AutomateHub**, este agente automatiza tareas repetitivas de desarrollo, interpretando las intenciones del usuario y transformándolas en acciones concretas sobre repositorios, issues y commits.

El servidor incorpora validaciones de entrada, manejo de errores y una comunicación compatible con el protocolo MCP mediante `stdio`.

---

## Requisitos del Sistema

* **Node.js:** v18 o superior.
* **Cuenta de GitHub:** activa y con permisos suficientes para realizar las operaciones requeridas.
* **IDE / Host MCP:** Antigravity o cualquier otro host compatible con Model Context Protocol.
* **Git:** para clonar el repositorio.

---

## Instalación y Configuración Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/nahuelcba22/ProyectoM5_NahuelCordoba.git
cd ProyectoM5_NahuelCordoba
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo para crear tu configuración local:

```bash
cp .env.example .env
```

Luego completa el archivo `.env` con tu token de GitHub:

```env
GITHUB_TOKEN=ghp_tu_token_generado_aqui
```

> **Importante:** El archivo `.env` está incluido en `.gitignore`. Nunca subas tu token real al repositorio.

### 4. Compilar el proyecto

El proyecto está desarrollado con TypeScript. Para generar los archivos compilados:

```bash
npm run build
```

Esto generará la carpeta `dist/`, que contiene el servidor listo para ser ejecutado.

---

## Autenticación con GitHub

El MCP Server utiliza un **GitHub Personal Access Token (PAT)** para autenticarse ante la API de GitHub.

### Crear un token

1. Ingresa a **GitHub**.
2. Ve a **Settings → Developer settings → Personal access tokens**.
3. Selecciona **Tokens (classic)**.
4. Haz clic en **Generate new token (classic)**.
5. Configura los permisos necesarios para las operaciones que realizará el agente.

Para este proyecto se contemplan los siguientes scopes:

* `repo` — acceso y administración de repositorios.
* `user` — acceso a información del usuario autenticado.
* `admin:org` — administración de organizaciones, si corresponde.

Finalmente, agrega el token al archivo `.env`:

```env
GITHUB_TOKEN=ghp_tu_token_generado_aqui
```

> **Seguridad:** nunca compartas ni publiques este token. Si un token se filtra, debe revocarse inmediatamente desde GitHub.

---

## Configuración en Antigravity

Una vez compilado el proyecto, el servidor MCP debe registrarse en el host MCP apuntando al archivo `dist/server.js`.

Ejemplo de configuración:

```json
{
  "mcpServers": {
    "github-agent": {
      "command": "node",
      "args": [
        "/ruta/absoluta/a/tu/ProyectoM5_NahuelCordoba/dist/server.js"
      ]
    }
  }
}
```

Reemplaza:

```text
/ruta/absoluta/a/tu/
```

por la ubicación real del proyecto en tu computadora.

Por ejemplo:

```text
C:/Proyectos/ProyectoM5_NahuelCordoba/dist/server.js
```

---

## Arquitectura del Sistema

El proyecto utiliza la arquitectura estándar de **Model Context Protocol (MCP)** y se comunica mediante `stdio`.

El flujo principal es:

```text
┌───────────────┐
│    Usuario    │
│ Lenguaje      │
│ natural       │
└───────┬───────┘
        │ Prompt
        ▼
┌────────────────────┐
│     Antigravity    │
│       Host MCP     │
└─────────┬──────────┘
          │ Gestión de sesión
          ▼
┌────────────────────┐
│    LLM / Agente    │
│       de IA        │
└─────────┬──────────┘
          │ Selección de Tool
          │ + parámetros
          ▼
┌────────────────────┐
│    MCP Server      │
│     Node.js        │
│                    │
│ - Validación Zod   │
│ - Lógica           │
│ - Manejo de errores│
└─────────┬──────────┘
          │ Octokit
          ▼
┌────────────────────┐
│     GitHub API     │
└────────────────────┘
```

### Comunicación mediante `stdio`

El servidor MCP utiliza:

* `stdout` para la comunicación del protocolo JSON-RPC.
* `stderr` para los logs y mensajes de diagnóstico.

Esto evita que mensajes de `console.log()` interfieran con la comunicación MCP.

---

## Tools Disponibles

El servidor expone **5 herramientas principales** que el agente puede utilizar según la intención del usuario.

### 1. `list_repositories`

Lista los repositorios asociados al usuario autenticado.

**Ejemplo de prompt:**

> "Muéstrame todos mis repositorios públicos, ordenados por los que actualicé más recientemente."

---

### 2. `create_repository`

Crea un nuevo repositorio en la cuenta de GitHub del usuario.

**Ejemplo de prompt:**

> "Crea un nuevo repositorio privado llamado `mvp-automatehub` con la descripción `Backend para automatización de tareas`."

---

### 3. `list_issues`

Obtiene los issues abiertos de un repositorio específico.

**Ejemplo de prompt:**

> "¿Cuáles son los issues abiertos actualmente en mi repositorio `nahuelcba22/ProyectoM5_NahuelCordoba`?"

---

### 4. `create_issue`

Crea un nuevo issue en un repositorio especificado.

**Ejemplo de prompt:**

> "Abre un issue en `nahuelcba22/ProyectoM5_NahuelCordoba`. El título debe ser `Refactor` y la descripción `Manejar rate limits de la API`."

---

### 5. `create_commit`

Crea un archivo y genera un commit directamente en una rama determinada.

**Ejemplo de prompt:**

> "Haz un commit en mi repositorio `mi-nuevo-repo` en la rama `main`. Crea el archivo `config.json` con un mensaje que diga `chore: setup inicial` y envíalo vacío."

---

## Testing

El proyecto cuenta con una suite de **8 pruebas unitarias** implementadas utilizando **Vitest**.

Para evitar depender de la API real de GitHub durante los tests, se utiliza un mock de las llamadas mediante `vi.mock`.

Esto permite que las pruebas sean:

* Rápidas.
* Deterministas.
* Independientes de la conexión a Internet.
* Independientes del estado real de una cuenta de GitHub.
* Seguras respecto al token de autenticación.

### Ejecutar las pruebas

```bash
npm run test
```

---

## Troubleshooting

### `Bad credentials (401)`

El token de GitHub puede estar vencido, ser incorrecto o no haberse cargado correctamente.

Verifica que exista:

```env
GITHUB_TOKEN=tu_token
```

y que el archivo `.env` se encuentre correctamente configurado.

---

### `Not Found (404)`

Puede ocurrir cuando:

* El repositorio indicado no existe.
* El nombre del propietario o repositorio es incorrecto.
* El token no tiene permisos suficientes para acceder al repositorio.
* Se intenta acceder a un repositorio privado sin los permisos correspondientes.

---

### El agente no responde / falla la conexión MCP

Comprueba que:

1. El proyecto haya sido compilado correctamente:

```bash
npm run build
```

2. La configuración del host apunte al archivo correcto:

```text
dist/server.js
```

3. No existan `console.log()` u otras salidas inesperadas en `stdout`.

En un servidor MCP basado en `stdio`, escribir información adicional en `stdout` puede interferir con el protocolo JSON-RPC.

Los logs de diagnóstico deben enviarse por `stderr`.

---

## Estructura General del Proyecto

```text
ProyectoM5_NahuelCordoba/
│
├── src/
│   └── server.ts
│
├── tests/
│   └── ...
│
├── dist/
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

> La estructura puede variar según la organización final de los archivos del proyecto.

---

## Tecnologías Utilizadas

* **Node.js**
* **TypeScript**
* **Model Context Protocol (MCP)**
* **Zod**
* **Octokit**
* **GitHub REST API**
* **Vitest**
* **Antigravity**

---

## Objetivo del Proyecto

El objetivo de este MVP es demostrar cómo un agente de Inteligencia Artificial puede utilizar **Model Context Protocol** para interactuar con servicios externos de forma estructurada.

En lugar de que el usuario tenga que ejecutar manualmente múltiples operaciones sobre GitHub, puede expresar una intención utilizando lenguaje natural y permitir que el agente:

1. Interprete la solicitud.
2. Seleccione la herramienta adecuada.
3. Valide los parámetros.
4. Ejecute la operación mediante la API de GitHub.
5. Transforme los posibles errores técnicos en respuestas comprensibles.

De esta forma, MCP funciona como una capa estandarizada entre el agente de IA y las herramientas externas.

---

## Autor

**Nahuel Córdoba**