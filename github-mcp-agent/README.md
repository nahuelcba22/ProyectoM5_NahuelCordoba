# GitHub MCP Agent - AutomateHub

Servidor **Model Context Protocol (MCP)** que permite a agentes de Inteligencia Artificial como Claude, Gemini y otros modelos compatibles interactuar de forma segura y directa con la **API de GitHub mediante lenguaje natural**.

Desarrollado como un **MVP para AutomateHub**, este agente automatiza tareas repetitivas de desarrollo, interpretando las intenciones del usuario y transformándolas en acciones concretas sobre repositorios, issues y commits.

El servidor incorpora validaciones estrictas de entrada mediante **Zod**, manejo de errores orientado a la experiencia conversacional de la IA y una comunicación compatible con el protocolo MCP mediante `stdio`.

---

## Índice

* [Requisitos del Sistema](#requisitos-del-sistema)
* [Instalación y Configuración Local](#instalación-y-configuración-local)

  * [1. Clonar el repositorio](#1-clonar-el-repositorio)
  * [2. Instalar dependencias](#2-instalar-dependencias)
  * [3. Configurar variables de entorno](#3-configurar-variables-de-entorno)
  * [4. Compilar el proyecto](#4-compilar-el-proyecto)
* [Autenticación con GitHub](#autenticación-con-github)

  * [Crear un token](#crear-un-token)
* [Configuración en Antigravity](#configuración-en-antigravity)
* [Arquitectura del Sistema](#arquitectura-del-sistema)

  * [Separación de responsabilidades](#separación-de-responsabilidades)
  * [Comunicación mediante `stdio`](#comunicación-mediante-stdio)
  * [Manejo de Errores y UX para IA](#manejo-de-errores-y-ux-para-ia)
* [Tools Disponibles](#tools-disponibles)

  * [`create_repository`](#1-create_repository)
  * [`list_repositories`](#2-list_repositories)
  * [`create_issue`](#3-create_issue)
  * [`list_issues`](#4-list_issues)
  * [`create_commit`](#5-create_commit)
* [Testing](#testing)
* [Troubleshooting](#troubleshooting)
* [Estructura General del Proyecto](#estructura-general-del-proyecto)
* [Tecnologías Utilizadas](#tecnologías-utilizadas)
* [Objetivo del Proyecto](#objetivo-del-proyecto)
* [Autor](#autor)

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

Esto generará la carpeta `dist/`, que contiene los archivos JavaScript compilados necesarios para ejecutar el servidor MCP.

---

## Autenticación con GitHub

El MCP Server utiliza un **GitHub Personal Access Token (PAT)** para autenticarse ante la API de GitHub.

### Crear un token

1. Ingresa a **GitHub**.
2. Ve a **Settings → Developer settings → Personal access tokens**.
3. Selecciona **Tokens (classic)**.
4. Haz clic en **Generate new token (classic)**.
5. Configura los permisos necesarios para las operaciones que realizará el agente.

Para este proyecto se utilizan los siguientes scopes:

* `repo` — acceso a repositorios y operaciones sobre su contenido, incluyendo repositorios privados.
* `user` — acceso a información del usuario autenticado.

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

La configuración permite que Antigravity inicie el servidor MCP mediante Node.js y establezca la comunicación utilizando `stdio`.

---

## Arquitectura del Sistema

El proyecto utiliza una arquitectura basada en **Model Context Protocol (MCP)**, con una separación clara de responsabilidades para mantener el código organizado, testeable y fácil de mantener.

El flujo principal del sistema es:

```text
┌───────────────┐
│    Usuario    │
│ Lenguaje      │
│ natural       │
└───────┬───────┘
        │ Prompt
        ▼
┌────────────────────┐
│    Antigravity     │
│      Host MCP      │
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
│     MCP Server     │
│      Node.js       │
│                    │
│ - Routing / Tools  │
│ - Validación Zod   │
│ - Lógica GitHub    │
│ - Manejo de errores│
└─────────┬──────────┘
          │ Octokit
          ▼
┌────────────────────┐
│     GitHub API     │
└────────────────────┘
```

### Separación de responsabilidades

La lógica está dividida en módulos especializados siguiendo principios de separación de responsabilidades similares a **Clean Architecture**:

```text
src/
├── server.ts
├── schemas/
│   └── index.ts
├── github/
│   └── operations.ts
└── errors/
    └── index.ts
```

#### `server.ts` — Enrutador y registro de tools

Es el punto de entrada del MCP Server.

Sus responsabilidades principales son:

* Inicializar el servidor MCP.
* Registrar las 5 tools disponibles.
* Recibir las solicitudes provenientes del LLM.
* Ejecutar la validación correspondiente.
* Delegar las operaciones de GitHub al módulo correspondiente.
* Devolver las respuestas al cliente MCP.

El archivo funciona principalmente como **capa de orquestación**, evitando concentrar toda la lógica de negocio en un único archivo.

#### `schemas/index.ts` — Validación y prompts descriptivos

Contiene los esquemas de validación desarrollados con **Zod**.

Sus responsabilidades son:

* Definir los tipos esperados por cada tool.
* Validar los parámetros recibidos.
* Aplicar restricciones como campos obligatorios, campos opcionales, booleanos y valores `enum`.
* Proporcionar descripciones claras de los parámetros para ayudar al LLM a comprender cómo utilizar cada herramienta.

De esta manera, la definición de cada tool no solamente establece qué datos son válidos, sino que también proporciona **contexto descriptivo para el modelo de IA**.

#### `github/operations.ts` — Lógica pura de Octokit

Contiene la lógica encargada de comunicarse con GitHub mediante **Octokit**.

Sus responsabilidades son:

* Ejecutar las operaciones contra la GitHub REST API.
* Crear repositorios.
* Consultar repositorios.
* Crear y consultar issues.
* Crear commits.
* Mantener la lógica de comunicación con GitHub separada del servidor MCP.

Esta separación permite testear las operaciones de manera aislada y evita mezclar la lógica específica de GitHub con la capa de transporte MCP.

#### `errors/index.ts` — Manejo de errores

Centraliza la transformación de errores técnicos en mensajes comprensibles.

Permite manejar de forma consistente:

* Errores HTTP de GitHub.
* Errores de autenticación.
* Errores de permisos.
* Recursos inexistentes.
* Errores de validación de Zod.
* Fallos de conexión o red.

Esto evita que cada tool tenga que implementar su propia lógica de tratamiento de errores.

### Comunicación mediante `stdio`

El servidor MCP utiliza `stdio` como mecanismo de transporte:

* `stdout` se utiliza exclusivamente para la comunicación del protocolo JSON-RPC.
* `stderr` se utiliza para logs y mensajes de diagnóstico.

Esto evita que mensajes de `console.log()` interfieran con la comunicación MCP.

En un servidor basado en `stdio`, cualquier salida inesperada en `stdout` puede romper o interferir con el intercambio de mensajes JSON-RPC.

### Manejo de Errores y UX para IA

El servidor incorpora una capa de manejo de errores orientada específicamente a la experiencia de uso con Inteligencia Artificial.

Cuando GitHub devuelve errores como **404, 403 o 422**, cuando ocurre un fallo de red o cuando los parámetros no superan la validación de **Zod**, el servidor intercepta estos errores y los transforma en mensajes escritos en **lenguaje natural**.

De esta manera, el LLM no recibe directamente un `stack trace` técnico o información interna innecesaria. En su lugar, recibe una explicación comprensible del problema que puede utilizar para continuar la conversación, pedir información faltante al usuario o explicar por qué una operación no pudo realizarse.

Esto permite mantener una experiencia conversacional fluida y evita exponer detalles técnicos innecesarios al usuario final.

---

## Tools Disponibles

El servidor expone **5 herramientas principales** que el agente puede seleccionar según la intención expresada mediante lenguaje natural.

### 1. `create_repository`

#### Nombre

`create_repository`

#### Descripción

Crea un nuevo repositorio en la cuenta de GitHub del usuario autenticado.

Permite definir el nombre, descripción, visibilidad y configuración inicial del repositorio.

#### Parámetros

| Parámetro     | Tipo      | Obligatorio | Descripción                                                             |
| ------------- | --------- | ----------: | ----------------------------------------------------------------------- |
| `name`        | `string`  |          Sí | Nombre del nuevo repositorio.                                           |
| `description` | `string`  |          No | Descripción del repositorio.                                            |
| `private`     | `boolean` |          No | Define si el repositorio será privado (`true`) o público (`false`).     |
| `autoInit`    | `boolean` |          No | Indica si GitHub debe inicializar el repositorio con un commit inicial. |

#### Ejemplo de Prompt

> "Crea un repositorio privado llamado `mvp-automatehub` con la descripción `Backend para automatización de tareas`."

---

### 2. `list_repositories`

#### Nombre

`list_repositories`

#### Descripción

Obtiene los repositorios asociados al usuario autenticado.

Permite consultar repositorios y aplicar filtros de visibilidad u ordenamiento.

#### Parámetros

| Parámetro    | Tipo   | Obligatorio | Descripción                                                                                              |
| ------------ | ------ | ----------: | -------------------------------------------------------------------------------------------------------- |
| `visibility` | `enum` |          No | Filtra los repositorios por visibilidad: `all`, `public` o `private`.                                    |
| `sort`       | `enum` |          No | Define el criterio de ordenamiento de los resultados, como `created`, `updated`, `pushed` o `full_name`. |
| `direction`  | `enum` |          No | Define la dirección del orden: `asc` o `desc`.                                                           |

#### Ejemplo de Prompt

> "Muéstrame todos mis repositorios públicos, ordenados por los que actualicé más recientemente."

---

### 3. `create_issue`

#### Nombre

`create_issue`

#### Descripción

Crea un nuevo issue en un repositorio específico del usuario.

Permite enviar un título y un cuerpo descriptivo para registrar una tarea, problema o mejora.

#### Parámetros

| Parámetro | Tipo     | Obligatorio | Descripción                                         |
| --------- | -------- | ----------: | --------------------------------------------------- |
| `owner`   | `string` |          Sí | Nombre del propietario de la cuenta u organización. |
| `repo`    | `string` |          Sí | Nombre del repositorio donde se creará el issue.    |
| `title`   | `string` |          Sí | Título del nuevo issue.                             |
| `body`    | `string` |          No | Descripción o contenido del issue.                  |

#### Ejemplo de Prompt

> "Abre un issue en `nahuelcba22/ProyectoM5_NahuelCordoba`. El título debe ser `Refactor` y la descripción `Manejar rate limits de la API`."

---

### 4. `list_issues`

#### Nombre

`list_issues`

#### Descripción

Obtiene los issues de un repositorio específico.

Permite consultar los issues y filtrar los resultados según su estado.

#### Parámetros

| Parámetro | Tipo     | Obligatorio | Descripción                                                 |
| --------- | -------- | ----------: | ----------------------------------------------------------- |
| `owner`   | `string` |          Sí | Nombre del propietario de la cuenta u organización.         |
| `repo`    | `string` |          Sí | Nombre del repositorio cuyos issues se desean consultar.    |
| `state`   | `enum`   |          No | Estado de los issues a consultar: `open`, `closed` o `all`. |

#### Ejemplo de Prompt

> "¿Cuáles son los issues abiertos actualmente en mi repositorio `nahuelcba22/ProyectoM5_NahuelCordoba`?"

---

### 5. `create_commit`

#### Nombre

`create_commit`

#### Descripción

Crea o actualiza un archivo dentro de un repositorio y genera un commit directamente sobre una rama determinada.

Esta herramienta permite automatizar cambios simples en archivos sin necesidad de realizar manualmente las operaciones mediante Git.

#### Parámetros

| Parámetro | Tipo     | Obligatorio | Descripción                                         |
| --------- | -------- | ----------: | --------------------------------------------------- |
| `owner`   | `string` |          Sí | Nombre del propietario de la cuenta u organización. |
| `repo`    | `string` |          Sí | Nombre del repositorio.                             |
| `path`    | `string` |          Sí | Ruta del archivo que se desea crear o modificar.    |
| `message` | `string` |          Sí | Mensaje del commit.                                 |
| `content` | `string` |          Sí | Contenido que tendrá el archivo.                    |
| `branch`  | `string` |          No | Rama sobre la cual se realizará el commit.          |

#### Ejemplo de Prompt

> "Haz un commit en mi repositorio `mi-nuevo-repo` en la rama `main`. Crea el archivo `config.json` con un contenido vacío y usa el mensaje de commit `chore: setup inicial`."

---

## Testing

El proyecto cuenta con **un mínimo de 8 tests unitarios con Vitest pasando**, cubriendo las principales operaciones y escenarios de éxito y error del sistema.

Los tests están diseñados para aislar completamente las comunicaciones con GitHub. Para ello se utiliza `vi.spyOn` sobre las operaciones de **Octokit**, permitiendo interceptar las llamadas a la API y controlar sus respuestas durante la ejecución de las pruebas.

Esto permite simular tanto casos exitosos como diferentes escenarios de error sin realizar solicitudes reales a GitHub.

Entre los escenarios que pueden aislarse mediante mocks se encuentran:

* Operaciones exitosas.
* Repositorios inexistentes.
* Errores de permisos.
* Errores de validación.
* Errores provenientes de la API.
* Fallos de red.

El aislamiento de la red tiene además una ventaja importante: **evita consumir el rate limit de GitHub durante la ejecución de los tests**.

Las pruebas son:

* Rápidas.
* Deterministas.
* Independientes de la conexión a Internet.
* Independientes del estado real de una cuenta de GitHub.
* Seguras respecto al token de autenticación.
* Reproducibles en diferentes entornos.

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

### `Forbidden (403)`

Puede ocurrir cuando GitHub rechaza la operación por falta de permisos o por restricciones de la API.

Verifica que el token utilizado tenga los scopes necesarios y que la cuenta tenga permisos sobre el repositorio correspondiente.

---

### `Unprocessable Entity (422)`

Indica normalmente que GitHub recibió la solicitud pero alguno de sus datos no cumple las condiciones requeridas.

Verifica los parámetros enviados a la tool, como nombres de repositorios, ramas, archivos o títulos.

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
│   ├── server.ts
│   ├── schemas/
│   │   └── index.ts
│   ├── github/
│   │   └── operations.ts
│   └── errors/
│       └── index.ts
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

La estructura puede variar ligeramente según la organización final de los archivos, pero la separación de responsabilidades se mantiene entre el servidor MCP, los schemas, las operaciones de GitHub y el manejo de errores.

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

El objetivo de este MVP para **AutomateHub** es demostrar cómo un agente de Inteligencia Artificial puede utilizar **Model Context Protocol** para interactuar con servicios externos de forma estructurada, segura y comprensible para el usuario.

En lugar de que el usuario tenga que ejecutar manualmente múltiples operaciones sobre GitHub, puede expresar una intención utilizando lenguaje natural y permitir que el agente:

1. Interprete la solicitud.
2. Seleccione la herramienta adecuada.
3. Valide los parámetros mediante Zod.
4. Ejecute la operación mediante Octokit y la API de GitHub.
5. Intercepte posibles errores técnicos.
6. Transforme esos errores en mensajes comprensibles.
7. Devuelva el resultado al usuario mediante el protocolo MCP.

De esta forma, MCP funciona como una capa estandarizada entre el agente de IA y las herramientas externas, mientras que la arquitectura interna mantiene separadas las responsabilidades de validación, orquestación, comunicación con GitHub y manejo de errores.

---

## Autor

**Nahuel Córdoba**
