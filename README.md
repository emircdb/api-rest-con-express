# API REST - Trailerflix

[![Versión del proyecto](https://img.shields.io/github/package-json/v/emircdb/api-rest-con-express)](https://github.com/emircdb/api-rest-con-express)
[![Último commit](https://img.shields.io/github/last-commit/emircdb/api-rest-con-express)](https://github.com/emircdb/api-rest-con-express/commits/main)

API REST de solo lectura para consultar un catálogo local de películas y series. Permite recuperar el catálogo y buscar producciones por título, categoría, reparto o ID para obtener la información de su tráiler. Los datos se leen desde un archivo JSON; no se necesita una base de datos externa.

## Índice

- [Introducción](#introducción)
- [Objetivo y alcance](#objetivo-y-alcance)
- [Tecnologías y requisitos previos](#tecnologías-y-requisitos-previos)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
- [Configuración](#configuración)
- [Uso de la API](#uso-de-la-api)
- [Resumen de endpoints](#resumen-de-endpoints)
- [Detalle de los endpoints](#detalle-de-los-endpoints)
- [Datos y modelos](#datos-y-modelos)
- [Seguridad y limitaciones](#seguridad-y-limitaciones)
- [Pruebas y mantenimiento](#pruebas-y-mantenimiento)

## Introducción

Trailerflix expone por HTTP el catálogo definido en [`database/trailerflix.json`](./database/trailerflix.json). La aplicación está implementada con Express y ofrece rutas para consultar producciones y sus datos, incluidos título, categoría, género, sinopsis, temporadas, reparto y, cuando está disponible, tráiler.

## Objetivo y alcance

Esta documentación está dirigida a quienes deban instalar y ejecutar el servicio o consumirlo desde una aplicación cliente, incluido el equipo frontend. Describe las rutas y respuestas implementadas actualmente, la configuración local y la forma del catálogo. No documenta funcionalidades futuras ni operaciones de escritura: las rutas de la aplicación son de lectura.

## Tecnologías y requisitos previos

- Node.js y npm. El repositorio no fija una versión mínima de Node.js.
- Express (`^5.2.1`) para exponer las rutas HTTP.
- `dotenv` (`^18.0.4`) para cargar variables opcionales desde `.env`.
- Git para clonar el repositorio.

Estructura principal:

```text
.
├── database/
│   └── trailerflix.json
├── .env.example
├── .gitignore
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## Instalación y ejecución local

1. Clona el repositorio y entra en la carpeta:

   ```bash
   git clone https://github.com/emircdb/api-rest-con-express.git
   cd api-rest-con-express
   ```

2. Instala las dependencias declaradas:

   ```bash
   npm install
   ```

3. (Opcional) Crea un archivo `.env` a partir del ejemplo. En PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Inicia el servidor:

   ```bash
   node index.js
   ```

   Con la configuración predeterminada, la consola muestra que la API está disponible en `http://localhost:3008`.

## Configuración

La aplicación carga `.env` mediante `dotenv`. El archivo [`.env.example`](./.env.example) contiene estos valores:

```dotenv
PORT=3008
DB_PATH=database/trailerflix.json
```

| Variable | Uso | Valor predeterminado |
| --- | --- | --- |
| `PORT` | Puerto HTTP del servidor. | `3008` |
| `DB_PATH` | Ruta al archivo JSON del catálogo, relativa a la carpeta del proyecto. | `database/trailerflix.json` |

Ambas variables son opcionales: si no se definen, se usan los valores predeterminados indicados. El catálogo debe existir y ser JSON válido; el servidor lo lee al arrancar. No se requiere una base de datos ni otro servicio externo.

## Uso de la API

La URL base local predeterminada es **`http://localhost:3008`**. Las rutas se encuentran directamente en la raíz y no utilizan prefijo de versión, como `/api/v1`.

Las respuestas de datos y error son JSON, excepto `GET /`, que devuelve HTML. Las rutas de búsqueda requieren su parámetro en la ruta; los espacios y caracteres especiales deben codificarse en la URL (por ejemplo, un espacio como `%20`).

## Resumen de endpoints

Los códigos de la tabla reflejan las respuestas explícitas de cada ruta en la implementación. `200 OK` indica una respuesta exitosa y `404 Not Found` se devuelve cuando una búsqueda o ID no tiene coincidencias. La ruta de bienvenida responde HTML; las demás rutas exitosas responden JSON.

| Método HTTP | Ruta | URL local de ejemplo | Propósito | Parámetros principales | Posibles códigos de respuesta |
| --- | --- | --- | --- | --- | --- |
| `GET` | `/` | `http://localhost:3008/` | Mensaje de bienvenida. | Ninguno. | `200 OK` |
| `GET` | `/catalogo` | `http://localhost:3008/catalogo` | Devuelve el catálogo completo. | Ninguno. | `200 OK` |
| `GET` | `/titulo/:title` | `http://localhost:3008/titulo/The%20Crown` | Busca por coincidencia parcial del título, sin distinguir mayúsculas. | `title` (requerido). | `200 OK`, `404 Not Found` |
| `GET` | `/categoria/:cat` | `http://localhost:3008/categoria/Serie` | Busca por categoría exacta, sin distinguir mayúsculas. | `cat` (requerido). | `200 OK`, `404 Not Found` |
| `GET` | `/reparto/:act` | `http://localhost:3008/reparto/Pedro%20Pascal` | Busca coincidencias parciales en el reparto. | `act` (requerido). | `200 OK`, `404 Not Found` |
| `GET` | `/trailer/:id` | `http://localhost:3008/trailer/1` | Devuelve la información del tráiler de una producción. | `id` (requerido; se convierte a número). | `200 OK`, `404 Not Found` |

No hay endpoints implementados para `POST`, `PUT`, `PATCH` o `DELETE`. Las rutas que no existen devuelven `404 Not Found` con un error JSON.

## Detalle de los endpoints

Todas las solicitudes siguientes pueden ejecutarse desde una terminal con `curl`. Ninguna ruta requiere cuerpo ni parámetros de consulta.

### `GET /` — Bienvenida

- **Parámetros:** ninguno.
- **Cuerpo de solicitud:** no se utiliza.
- **Respuesta:** `200 OK`, HTML.

Solicitud:

```bash
curl http://localhost:3008/
```

Respuesta:

```html
<h1>Bienvenido a Trailerflix</h1>
```

### `GET /catalogo` — Catálogo completo

- **Parámetros:** ninguno.
- **Cuerpo de solicitud:** no se utiliza.
- **Respuesta:** `200 OK`, arreglo JSON con las producciones del archivo de datos.

Solicitud:

```bash
curl http://localhost:3008/catalogo
```

Ejemplo de elemento de la respuesta:

```json
{
  "id": 1,
  "titulo": "The Crown",
  "categoria": "Serie",
  "genero": "Drama, Hechos verídicos",
  "sinopsis": "Recorre el reinado de Isabel II desde su juventud, mostrando cómo la vida privada de la familia real choca con las obligaciones de la Corona y los grandes acontecimientos políticos del siglo XX.",
  "temporadas": 6,
  "reparto": "Claire Foy, Olivia Colman, Imelda Staunton, Matt Smith, Tobias Menzies, Vanessa Kirby",
  "trailer": "https://www.youtube.com/results?search_query=The+Crown+trailer+oficial"
}
```

### `GET /titulo/:title` — Buscar por título

- **Parámetro requerido:** `title`, texto que se busca como coincidencia parcial.
- **Comportamiento:** no distingue mayúsculas de minúsculas.
- **Respuesta exitosa:** `200 OK`, arreglo JSON con las producciones coincidentes.
- **Sin coincidencias:** `404 Not Found`, objeto JSON con `error`.

Solicitud:

```bash
curl "http://localhost:3008/titulo/The%20Crown"
```

Respuesta exitosa:

```json
[
  {
    "id": 1,
    "titulo": "The Crown",
    "categoria": "Serie",
    "genero": "Drama, Hechos verídicos",
    "sinopsis": "Recorre el reinado de Isabel II desde su juventud, mostrando cómo la vida privada de la familia real choca con las obligaciones de la Corona y los grandes acontecimientos políticos del siglo XX.",
    "temporadas": 6,
    "reparto": "Claire Foy, Olivia Colman, Imelda Staunton, Matt Smith, Tobias Menzies, Vanessa Kirby",
    "trailer": "https://www.youtube.com/results?search_query=The+Crown+trailer+oficial"
  }
]
```

Respuesta sin coincidencias:

```json
{
  "error": "No se encontraron producciones con ese título."
}
```

### `GET /categoria/:cat` — Buscar por categoría

- **Parámetro requerido:** `cat`, categoría que debe coincidir exactamente con la del catálogo.
- **Comportamiento:** no distingue mayúsculas de minúsculas. Las categorías presentes son `Serie` y `Película`.
- **Respuesta exitosa:** `200 OK`, arreglo JSON con producciones de esa categoría.
- **Sin coincidencias:** `404 Not Found`, objeto JSON con `error`.

Solicitud:

```bash
curl "http://localhost:3008/categoria/Pel%C3%ADcula"
```

Respuesta exitosa (elemento representativo):

```json
[
  {
    "id": 6,
    "titulo": "Enola Holmes",
    "categoria": "Película",
    "genero": "Aventura, Misterio, Comedia",
    "sinopsis": "La hermana menor de Sherlock Holmes decide buscar por su cuenta a su madre desaparecida y, en el camino, se ve envuelta en una conspiración que involucra a un joven lord.",
    "temporadas": "N/A",
    "reparto": "Millie Bobby Brown, Henry Cavill, Sam Claflin, Helena Bonham Carter",
    "trailer": "https://www.youtube.com/results?search_query=Enola+Holmes+trailer+oficial"
  }
]
```

Respuesta sin coincidencias:

```json
{
  "error": "No se encontraron producciones de esa categoría."
}
```

### `GET /reparto/:act` — Buscar por reparto

- **Parámetro requerido:** `act`, texto que se busca como coincidencia parcial dentro del reparto.
- **Comportamiento:** no distingue mayúsculas de minúsculas.
- **Respuesta exitosa:** `200 OK`, arreglo JSON con solo los campos `titulo` y `reparto`.
- **Sin coincidencias:** `404 Not Found`, objeto JSON con `error`.

Solicitud:

```bash
curl "http://localhost:3008/reparto/Pedro%20Pascal"
```

Respuesta representativa:

```json
[
  {
    "titulo": "The Mandalorian",
    "reparto": "Pedro Pascal, Gina Carano, Giancarlo Esposito, Carl Weathers, Katee Sackhoff"
  },
  {
    "titulo": "The Last of Us",
    "reparto": "Pedro Pascal, Bella Ramsey, Gabriel Luna, Anna Torv, Nick Offerman"
  }
]
```

Respuesta sin coincidencias:

```json
{
  "error": "No se encontraron producciones con ese actor o actriz."
}
```

### `GET /trailer/:id` — Obtener tráiler

- **Parámetro requerido:** `id`, ID numérico de una producción.
- **Respuesta exitosa:** `200 OK`, objeto JSON con `id`, `titulo` y `trailer`.
- **Producción existente sin tráiler:** `200 OK`, objeto JSON con `id`, `titulo` y `mensaje` en lugar de `trailer`.
- **ID inexistente o no numérico:** `404 Not Found`, objeto JSON con `error`.

Solicitud para una producción con tráiler:

```bash
curl http://localhost:3008/trailer/1
```

Respuesta:

```json
{
  "id": 1,
  "titulo": "The Crown",
  "trailer": "https://www.youtube.com/results?search_query=The+Crown+trailer+oficial"
}
```

Solicitud para una producción sin tráiler:

```bash
curl http://localhost:3008/trailer/5
```

Respuesta:

```json
{
  "id": 5,
  "titulo": "Gambito de Dama",
  "mensaje": "El tráiler no está disponible para esta producción."
}
```

Respuesta para un ID sin producción:

```json
{
  "error": "No se encontró una producción con ese ID."
}
```

## Datos y modelos

El catálogo contiene 30 producciones en [`database/trailerflix.json`](./database/trailerflix.json). Cada registro puede incluir los siguientes campos:

| Campo | Descripción | Tipo observado |
| --- | --- | --- |
| `id` | Identificador utilizado para buscar una producción. | Número |
| `titulo` | Título de la producción. | Texto |
| `categoria` | Tipo de producción, por ejemplo `Serie` o `Película`. | Texto |
| `genero` | Género o géneros. | Texto |
| `sinopsis` | Descripción de la producción. | Texto |
| `temporadas` | Número de temporadas en series; para películas se usa el valor de texto `"N/A"`. | Número o texto |
| `reparto` | Reparto de la producción. | Texto |
| `trailer` | URL asociada al tráiler. El campo puede no estar presente. | Texto opcional |

El endpoint `/reparto/:act` devuelve únicamente `titulo` y `reparto`. El endpoint `/trailer/:id` devuelve un objeto reducido y usa `mensaje` cuando el registro no contiene un tráiler.

## Seguridad y limitaciones

- No se implementa autenticación ni autorización; no hay respuestas `401 Unauthorized` ni `403 Forbidden` en las rutas descritas.
- El código no configura middleware de CORS ni rate limiting.
- La API es de solo lectura y carga el catálogo local al iniciar el proceso. Los cambios en el archivo de datos requieren reiniciar el servidor para reflejarse.
- No hay operaciones para modificar el catálogo mediante HTTP.
- Una búsqueda sin resultados y un ID inválido o inexistente producen `404 Not Found`; la implementación no define una respuesta `400 Bad Request` para esos casos.
- La aplicación escucha en el puerto `3008` por defecto, que puede cambiarse con `PORT`.
