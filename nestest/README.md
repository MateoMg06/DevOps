# Proyecto DevOps - NestJS
   
Proyecto de formación orientado a prácticas básicas de DevOps, CI/CD,
calidad de código, automatización e infraestructura.

## Tecnologías

- Node.js
- NestJS
- Docker
- Jenkins
- SonarQube
- Git
- Husky

## Estructura de ramas

La rama `master` representa la rama desplegable.

Las funcionalidades se desarrollan mediante ramas:

`feature/US-XXX-descripcion`

## Convención de commits

Los commits deben utilizar el formato:

`[US-XXX] tipo: descripción`

Tipos permitidos:

- feat
- fix
- test
- refactor
- docs
- chore

---

# Día 4 — Jenkins y CI

## Qué es Jenkins?
Jenkins es un servidor de automatización de código abierto que permite construir, probar e implementar proyectos de software de manera continua. Proporciona una forma de orquestar las diferentes etapas de un pipeline CI/CD.

## Qué es un Job?
Un Job es una tarea definida en Jenkins que se ejecuta automáticamente. Puede ser un pipeline de integración continua, un despliegue, o cualquier otra tarea automatizada. Los jobs se configuran mediante el interfaz web de Jenkins o mediante archivos de definición declarativa.

## Qué es un Pipeline?
Un Pipeline es una secuencia de etapas o pasos que Jenkins ejecuta en orden. En el contexto de CI, un pipeline define el proceso completo desde que se envía código hasta que se valida la calidad, incluyendo checkout, instalación, pruebas, análisis estático y más. Los pipelines pueden ser scriptados (Groovy) o declarativos.

## Qué es un Jenkinsfile?
Un Jenkinsfile es un archivo de texto (en Groovy) que define la configuración del pipeline en código. Se almacena en el repositorio junto con el proyecto y permite que el versionamiento de la pipeline acompañe al versionamiento del código. El pipeline se lee directamente desde SCM (Source Control Management).

## Qué es CI (Integración Continua)?
CI es la práctica de fusionar cambios de código en un repositorio compartido de manera frecuente, verificando cada integración mediante pruebas automáticas. El objetivo es detectar errores rápidamente y mantener el código en un estado saludable. Cada integración es verificada por una construcción automática y pruebas para detectar errores de inmediato.

## Qué hace cada etapa:

1. **Checkout**: Obtiene el código fuente del repositorio donde está el pipeline. Utiliza `checkout scm` para clonar el proyecto desde Git.

2. **Install**: Instala las dependencias del proyecto utilizando `npm ci`. Este comando instala exactamente las versiones especificadas en package-lock.json, asegurando builds reproducibles. Fallará si las dependencias no pueden instalarse.

3. **Lint**: Ejecuta ESLint para validar la calidad del código y detectar problemas de estilo o posibles errores. Utiliza `npm run lint`. El pipeline se detiene si ESLint encuentra errores, ya que no se ocultan problemas con `|| true`.

4. **Test**: Ejecuta las pruebas unitarias utilizando `npm test` (vitest). El pipeline falla si alguna prueba falla. No se desactivan ni ignoran pruebas para hacer que Jenkins pase.

5. **Coverage**: Genera el reporte de cobertura de pruebas utilizando `npm run test:cov`. El objetivo es producir el reporte en `coverage/lcov.info` para su posterior consumo por SonarQube.

6. **SonarQube**: Realiza un análisis estático del código utilizando el scanner de SonarQube. Se configura utilizando `withSonarQubeEnv("SonarQube")` y el archivo `sonar-project.properties`. El análisis considera código fuente, bugs, vulnerabilidades, code smells, duplicación y coverage. Se excluyen de manera explícita `node_modules`, `coverage` y `dist`.

7. **Quality Gate**: Después del análisis de SonarQube, Jenkins espera el resultado del Quality Gate utilizando `waitForQualityGate abortPipeline: true`. Si el Quality Gate pasa, el pipeline continúa. Si falla, el pipeline se detiene inmediatamente.

## Cómo se conecta GitHub con Jenkins?
GitHub envía eventos de cambio de código a Jenkins mediante Webhook. Cuando un developer hace `git push`, GitHub dispara el webhook, que notifica a Jenkins para iniciar el pipeline CI. El webhook debe configurarse en la configuración del repositorio de GitHub apuntando a la URL de Jenkins que activará el pipeline.

## Cómo se conecta Jenkins con SonarQube?
La conexión se establece mediante la configuración de credenciales en Jenkins. Se instala una instancia de SonarQube en Jenkins y se le asigna el nombre "SonarQube". En el Jenkinsfile, se utiliza `withSonarQubeEnv("${SONARQUBE_SERVER}")` para inyectar las credenciales de autenticación automáticamente. Las credenciales de SonarQube (login/password) deben configurarse en la sección "Credentials" de Jenkins, no en el código del pipeline.

## Qué es Quality Gate?
Quality Gate es una funcionalidad de SonarQube que establece condiciones de calidad para el proyecto. El Quality Gate evalúa si el código cumple con los umbrales de calidad definidos (máximo de bugs, vulnerabilidades, code smells, cobertura de pruebas, duplicación, etc.). Si el Quality Gate pasa, el pipeline CI continúa con las siguientes etapas. Si falla, el pipeline se detiene y el build se marca como fallido, impidiendo que se continúe con deployment.

## Qué ocurre cuando una etapa falla?
Cuando cualquier etapa obligatoria falla (npm ci, lint, tests, cobertura, análisis SonarQube o Quality Gate), el pipeline se detiene inmediatamente y se marca como FAILED. No se ocultan errores con `|| true` ni se convierte errores en éxito con `exit 0`. El pipeline refleja el estado real de la validación del código. En la sección `post` del pipeline, se ejecutan acciones adicionales como la publicación de resultados de prueba (junit) y mensajes de éxito o fallo.

## Cómo configurar el Webhook:
1. En GitHub, ingresar a la configuración del repositorio
2. Seleccionar "Webhooks" y luego "Add webhook"
3. En la URL del payload, ingresar la URL de Jenkins (ejemplo: `http://<jenkins-url>/github-webhook/`)
4. Seleccionar los eventos trigger: "Push requests" y "Pull requests"
5. Guardar la configuración. Cuando ocurran cambios en el repositorio, GitHub disparará el webhook y Jenkins iniciará el pipeline automáticamente.

## Cómo ejecutar el pipeline:
1. Realizar un `git push` al repositorio
2. GitHub disparará el webhook
3. Jenkins detectará la notificación y iniciará el pipeline
4. El pipeline ejecutará las etapas: Checkout, Install, Lint, Test, Coverage, SonarQube, Quality Gate
5. Al finalizar, Jenkins mostrará el resultado: SUCCESS o FAILED

## Cómo comprobar que el pipeline terminó correctamente:
1. En la interfaz de Jenkins, hacer clic en el job ejecutándose
2. Revisar la consola del build para ver el progreso de cada etapa
3. Verificar que todas las etapas completaron sin errores
4. Comprobar el resultado en la parte superior de la build: "SUCCESS" (todos los gates pasaron) o "FAILED" (algununa etapa falló)
5. Revisar los reportes de prueba (junit) y cobertura si corresponde

### Flujo del pipeline:
GitHub
↓
Jenkins
↓
Checkout
↓
Install
↓
Lint
↓
Test
↓
Coverage
↓
SonarQube
↓
Quality Gate

---

## 12. Configuración del Job en Jenkins

Para crear el Job en Jenkins:

1. En la interfaz de Jenkins, hacer clic en "New Item"
2. Nombre del job: `nestest-ci` (o el nombre deseado)
3. Seleccionar "Pipeline" y hacer clic en "OK"
4. Configuración:

**Pipeline:**
- Seleccionar "Pipeline" como tipo de proyecto

**SCM:**
- Git
- Repository: `https://github.com/MateoMg06/DevOps.git`
- Branch: `master`
- Script Path: `nestest/Jenkinsfile`

**Environment:**
- Las variables de entorno del Jenkinsfile se cargarán automáticamente
- `NODE_ENV = 'test'`
- `SONARQUBE_SERVER = 'SonarQube'`

**Credenciales:**
- Credenciales de SonarQube deben configurarse en Jenkins (ver sección 13)
- No colocar tokens o secretos directamente en el job

## 13. Credenciales

### Credenciales que deben configurarse en Jenkins:

1. **SonarQube Credentials:**
   - Tipo: `Username with Password` o `SonarQube Token`
   - ID/Name: `SonarQube` (debe coincidir con el valor de `SONARQUBE_SERVER` en el Jenkinsfile, que es `'SonarQube'`)
   - Username: usuario de SonarQube (o vacío si usa token)
   - Password: token o contraseña de SonarQube

2. **Git Credentials (opcional):**
   - Si el repositorio es privado, configurar credenciales de Git
   - Tipo: `SSH Username with Key` o `Username with Password`
   - Jenkins usará estas credenciales para `checkout scm`

### Cómo configurar:

1. En Jenkins, ir a "Manage Jenkins" → "Credentials"
2. Seleccionar "System" (credenciales de nivel de sistema)
3. Hacer clic en "Add credentials"
4. Elegir el tipo apropiado y configurar los valores
5. El ID/Name debe ser `SonarQube` para que coincida con `withSonarQubeEnv("${SONARQUBE_SERVER}")` en el Jenkinsfile

### Nunca almacenar secretos en el código:

- NO colocar `passwords`, `tokens`, `API keys` ni `secretos de GitHub` directamente en el Jenkinsfile
- NO poner credenciales en el `sonar-project.properties`
- Usar siempre `withSonarQubeEnv("${SONARQUBE_SERVER}")` para que Jenkins inyecte las credenciales automáticamente
- Las credenciales se gestionan mediante la sección "Credentials" de Jenkins, no en el código

## Día 5 — CD y despliegue

### Conceptos

- **Deployment** es publicar y ejecutar una versión de la aplicación en un entorno.
- **Continuous Delivery** automatiza la validación y deja cada versión lista para desplegar; el paso a producción puede requerir aprobación manual.
- **Continuous Deployment** despliega automáticamente cada cambio que supera todas las validaciones. Este pipeline sigue este modelo para la rama configurada en Jenkins.
- **SSH** permite que Jenkins se conecte al servidor de forma cifrada. La clave privada vive en Jenkins Credentials; el servidor debe estar en `known_hosts` para verificar su identidad.
- **Variables de entorno** configuran la aplicación por entorno, por ejemplo `NODE_ENV` y `PORT`.
- **Secrets** son valores sensibles, como claves de API. No se versionan ni se imprimen en logs; se guardan en un archivo `.env` protegido en el servidor.
- **Health check** consulta `/health` después del despliegue. Jenkins espera a que la aplicación responda correctamente y marca como fallido el pipeline si no se recupera.

### Prerrequisitos

1. El agente Jenkins necesita Git, Docker CLI, `ssh`, `tar`, `curl` y el plugin **SSH Agent**. La imagen `Dockerfile.jenkins` ya instala Docker CLI y curl.
2. En Jenkins, crea la credencial `deploy-key` de tipo **SSH Username with private key**. Configura el usuario de despliegue en `DEPLOY_USER` y el destino SSH en `DEPLOY_HOST` y `DEPLOY_PORT` del `Jenkinsfile`.
3. Añade y verifica la clave pública SSH del servidor en `/var/jenkins_home/.ssh/known_hosts`, dentro del volumen persistente de Jenkins. El pipeline exige `StrictHostKeyChecking=yes`.
4. El usuario remoto necesita permiso para ejecutar Docker y escribir en `DEPLOY_COMPOSE_DIR`. El servidor necesita Docker Compose v2 y la red Docker externa `devops_network` (créala una vez con `docker network create devops_network` si aún no existe).
5. Crea `DEPLOY_COMPOSE_DIR/.env` directamente en el servidor y limita sus permisos (`chmod 600`). Debe contener los valores de producción `OBSERVE_APP_KEY`, `OBSERVE_APP_SECRET` y `OBSERVE_APP_NAME`; la aplicación no inicia si faltan. No copies el `.env` de desarrollo al repositorio ni al artefacto de despliegue.

### Flujo automatizado

`Git push → Jenkins → Tests y análisis SonarQube → Quality Gate → Build → Deploy por SSH → Health check`

Tras pasar el Quality Gate, Jenkins empaqueta el commit que acaba de validar y lo envía al directorio remoto. Luego ejecuta `docker compose up -d --build --force-recreate app`. El `.env` del servidor queda intacto y Compose lo inyecta en el contenedor. Finalmente, Jenkins consulta `http://<DEPLOY_HOST>:3000/health` durante un máximo aproximado de 2 minutos; si no obtiene una respuesta satisfactoria, el pipeline falla.

Para activar el despliegue automático, el job debe apuntar a `nestest/Jenkinsfile` y ejecutarse con cada push a la rama desplegable. El orden de las etapas impide desplegar si fallan los tests, SonarQube o el Quality Gate.
