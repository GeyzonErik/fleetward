# Fleetward

Backend de uma plataforma de gestão de frotas: cadastro de veículos, modelos e marcas, com autenticação JWT, cache de leitura via Redis, mensageria assíncrona via RabbitMQ e auditoria de interações via MongoDB.

## Stack

- **Node.js** + **NestJS** (arquitetura em camadas: Controller → UseCase → Repository)
- **TypeORM** + **SQL Server**
- **Redis** (cache de consultas)
- **RabbitMQ** (eventos de domínio assíncronos)
- **MongoDB** (auditoria de interações)
- **JWT** (autenticação)
- **Jest** (testes unitários)
- **Docker Compose** (infraestrutura completa, incluindo a própria aplicação)

## Como rodar

Existem dois jeitos de rodar o projeto: **tudo containerizado** (mais rápido pra validar, um comando só) ou **API local + infra em container** (melhor pra desenvolvimento ativo, com hot reload).

### Opção A — Tudo containerizado (recomendado para avaliação rápida)

Pré-requisitos: Docker + Docker Compose.

```bash
git clone <repo-url>
cd fleetward
cp .env.example .env
docker compose up -d --build
```

Isso sobe SQL Server, Redis, RabbitMQ, MongoDB e a própria API, todos containerizados. A aplicação, ao iniciar, automaticamente:

1. Roda as migrations pendentes
2. Popula o banco (usuário padrão, marcas, modelos e veículos de exemplo)
3. Sobe o servidor

Acompanhe a subida com:

```bash
docker compose logs -f app
```

Espere aparecer `Nest application successfully started`. A API estará em `http://localhost:3000`.

### Opção B — API local + infraestrutura em container

Pré-requisitos: Node.js 18+, pnpm, Docker + Docker Compose.

```bash
git clone <repo-url>
cd fleetward
pnpm install
cp .env.example .env
docker compose up -d sqlserver redis rabbitmq mongodb
pnpm migration:run
pnpm seed
pnpm start:dev
```

### Autenticação

Usuário criado pelo seed:

```
nickname: aivacol
password: Aivacol@2026
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nickname":"aivacol","password":"Aivacol@2026"}'
```

A resposta traz um `accessToken`. Todas as demais rotas exigem o header:

```
Authorization: Bearer <accessToken>
```

## Variáveis de ambiente

| Variável                         | Descrição                                         |
| -------------------------------- | ------------------------------------------------- |
| `PORT`                           | Porta em que a API sobe                           |
| `DB_HOST`                        | Host do SQL Server                                |
| `DB_PORT`                        | Porta do SQL Server                               |
| `DB_USERNAME`                    | Usuário do banco (fixo em `sa` no Docker Compose) |
| `DB_PASSWORD`                    | Senha do banco                                    |
| `DB_DATABASE`                    | Nome do banco de dados                            |
| `JWT_SECRET`                     | Chave de assinatura do token JWT                  |
| `JWT_EXPIRES_IN`                 | Tempo de expiração do token (ex: `1d`)            |
| `REDIS_HOST`                     | Host do Redis                                     |
| `REDIS_PORT`                     | Porta do Redis                                    |
| `CACHE_TTL_SECONDS`              | Tempo de vida do cache de veículos, em segundos   |
| `RABBITMQ_USER`                  | Usuário do RabbitMQ                               |
| `RABBITMQ_PASSWORD`              | Senha do RabbitMQ                                 |
| `RABBITMQ_HOST`                  | Host do RabbitMQ                                  |
| `RABBITMQ_PORT`                  | Porta AMQP do RabbitMQ                            |
| `RABBITMQ_QUEUE_VEHICLE_CREATED` | Nome da fila de eventos de criação de veículo     |
| `RABBITMQ_QUEUE_VEHICLE_DELETED` | Nome da fila de eventos de remoção de veículo     |
| `MONGO_USER`                     | Usuário root do MongoDB                           |
| `MONGO_PASSWORD`                 | Senha root do MongoDB                             |
| `MONGO_HOST`                     | Host do MongoDB                                   |
| `MONGO_PORT`                     | Porta do MongoDB                                  |
| `MONGO_DATABASE`                 | Banco usado para os logs de auditoria             |

**Nota**: existe um `.env.docker` separado, usado apenas pelo serviço `app` dentro do `docker-compose.yml`. Ele contém os mesmos valores do `.env`, exceto que os campos `*_HOST` apontam para o nome dos serviços Docker (`sqlserver`, `redis`, `rabbitmq`, `mongodb`) em vez de `localhost`, isso é necessário porque, dentro da rede interna do Compose, os containers se enxergam pelo nome do serviço, não por `localhost`.

Diferente do `.env`, o `.env.docker` **é versionado no repositório**, propositalmente. As credenciais nele são valores fixos de desenvolvimento local (não segredos reais de produção), e mantê-lo commitado permite que o fluxo `git clone` → `docker compose up -d --build` funcione de ponta a ponta sem passos manuais extras, o container `app` depende desse arquivo existir para saber como se conectar aos demais serviços. Em um cenário de produção real, esse arquivo seria substituído por variáveis de ambiente injetadas pela plataforma de deploy (ou um secret manager), nunca versionadas.

## Endpoints

### Auth

| Método | Rota          | Descrição          | Autenticado |
| ------ | ------------- | ------------------ | ----------- |
| POST   | `/auth/login` | Login, retorna JWT | Não         |

### Models

| Método | Rota          | Descrição             |
| ------ | ------------- | --------------------- |
| POST   | `/models`     | Cria um model         |
| GET    | `/models`     | Lista todos os models |
| GET    | `/models/:id` | Busca um model por id |
| PATCH  | `/models/:id` | Atualiza um model     |
| DELETE | `/models/:id` | Remove um model       |

### Vehicles

| Método | Rota            | Descrição                                                            |
| ------ | --------------- | -------------------------------------------------------------------- |
| POST   | `/vehicles`     | Cria um vehicle (publica evento `vehicle.created`)                   |
| GET    | `/vehicles`     | Lista todos os vehicles (cacheado)                                   |
| GET    | `/vehicles/:id` | Busca um vehicle por id (cacheado)                                   |
| PATCH  | `/vehicles/:id` | Atualiza um vehicle (invalida cache)                                 |
| DELETE | `/vehicles/:id` | Remove um vehicle (invalida cache, publica evento `vehicle.deleted`) |

### Brands

| Método | Rota          | Descrição              |
| ------ | ------------- | ---------------------- |
| POST   | `/brands`     | Cria uma brand         |
| GET    | `/brands`     | Lista todas as brands  |
| GET    | `/brands/:id` | Busca uma brand por id |
| PATCH  | `/brands/:id` | Atualiza uma brand     |
| DELETE | `/brands/:id` | Remove uma brand       |

Todas as rotas acima (exceto `/auth/login`) exigem autenticação via `Bearer token`.

## Arquitetura

Cada módulo segue o fluxo:

```
Controller → UseCase → Repository Interface → Repository (TypeORM)
```

- **Controller**: recebe a requisição HTTP, valida o DTO, delega ao UseCase.
- **UseCase**: contém a regra de negócio. Depende de interfaces, nunca de implementações concretas.
- **Repository Interface**: contrato de acesso a dados, definido na camada de aplicação.
- **Repository (TypeORM)**: implementação concreta, isolada na camada de infraestrutura.

Essa separação torna os UseCases testáveis sem depender de banco de dados real (veja a seção de Testes).

### Cache

O cache de `vehicles` é implementado como um **decorator** sobre o repository real (`VehicleCachedRepository`), não como lógica misturada dentro do repository TypeORM. O UseCase injeta `VEHICLE_REPOSITORY` normalmente e não sabe se está falando com cache ou com o banco.

Estratégia: cache-aside simples. Leitura primeiro consulta o Redis; se não encontrar, busca no banco e popula o cache. Qualquer escrita (`create`, `update`, `delete`) invalida todo o cache de `vehicles`, em vez de invalidação seletiva por chave (decisão consciente de simplicidade para o volume de dados esperado neste escopo).

### Mensageria (RabbitMQ)

A criação e remoção de `vehicles` publicam eventos de domínio (`vehicle.created`, `vehicle.deleted`) em filas duráveis do RabbitMQ. Cada fila tem um consumer próprio, rodando no mesmo processo da API (via `OnModuleInit`), que apenas loga o recebimento, o suficiente para demonstrar o fluxo pub/sub funcionando ponta a ponta.

**Decisões de design:**

- **Publicação acontece no UseCase, não no repository.** Publicar um evento de domínio é decisão de fluxo de negócio ("depois que o vehicle for criado, avise o sistema"), não responsabilidade de acesso a dados, por isso vive na camada de aplicação, não na de infraestrutura.
- **Resiliência via `try/catch`:** se o RabbitMQ estiver indisponível, a criação/remoção do vehicle não falha por causa disso. O evento é um efeito colateral best-effort, não parte do contrato principal da operação.
- **Escopo limitado a `vehicles`:** o padrão de mensageria não foi replicado para `models`, `brands` ou `auth`. A intenção do bônus é demonstrar a capacidade de integração com um broker de mensagens. Replicar o mesmo código em cada módulo não agregaria evidência técnica adicional, apenas repetição. `vehicles` foi escolhido por ser a entidade central do domínio de gestão de frota.
- **Consumer no mesmo processo da API**, não como worker separado. Separar em processo/deploy próprio é evolução de arquitetura, não requisito do escopo atual.

Painel de management do RabbitMQ disponível em `http://localhost:15672`, com as credenciais definidas em `RABBITMQ_USER`/`RABBITMQ_PASSWORD`.

### Auditoria (MongoDB)

Toda requisição HTTP autenticada é registrada em `MongoDB`, via um `NestInterceptor` global (`AuditInterceptor`), sem exigir nenhuma alteração nos controllers ou UseCases existentes.

Cada documento gravado na collection `audit_logs` contém: método HTTP, rota, status da resposta, usuário autenticado, corpo da requisição (sanitizado), duração em milissegundos, timestamp e, em caso de erro, a mensagem da exceção.

**Decisões de design:**

- **Campos sensíveis são removidos antes da gravação.** O campo `password` (presente no body do `/auth/login`) nunca é persistido em texto puro no log de auditoria.
- **Gravação não bloqueia a resposta HTTP.** O log é escrito de forma assíncrona e "dispare e esqueça" (`fire-and-forget`); se a gravação falhar, o erro é logado no console da aplicação, mas nunca impede a resposta de chegar ao cliente.
- **Requisições não autenticadas não são auditadas.** Como o interceptor roda depois dos guards no ciclo de vida do Nest, requisições bloqueadas pelo `JwtAuthGuard` (ex: token inválido) não passam pelo interceptor. Este mecanismo audita interações autenticadas com o sistema, não tentativas de acesso não autorizado — que seria escopo de um mecanismo de segurança separado.

#### Como consultar os logs de auditoria

Com os containers no ar, acesse o Mongo diretamente:

```bash
docker exec -it fleetward-mongodb mongosh \
  -u fleetward -p fleetward123 --authenticationDatabase admin fleetward_audit \
  --eval "db.audit_logs.find().sort({ timestamp: -1 }).limit(20).pretty()"
```

Isso retorna os 20 registros mais recentes, do mais novo para o mais antigo. Para entrar num shell interativo e explorar livremente:

```bash
docker exec -it fleetward-mongodb mongosh \
  -u fleetward -p fleetward123 --authenticationDatabase admin fleetward_audit
```

Dentro do shell, alguns exemplos úteis:

```javascript
// Todos os logs de um endpoint específico
db.audit_logs.find({ url: '/vehicles' }).pretty();

// Apenas requisições que resultaram em erro
db.audit_logs.find({ statusCode: { $gte: 400 } }).pretty();

// Todas as ações de um usuário específico
db.audit_logs.find({ user: 'aivacol' }).pretty();

// Contagem total de logs
db.audit_logs.countDocuments();
```

(Ajuste `fleetward`/`fleetward123` caso tenha alterado `MONGO_USER`/`MONGO_PASSWORD` no `.env`.)

## Decisões técnicas e trade-offs

### `created_by` como texto livre, não FK

O campo `created_by`, presente em todas as entidades, guarda o `nickname` do usuário autenticado como `varchar`, não como chave estrangeira para `users`.

**Trade-off assumido**: se um usuário mudar de nickname no futuro, registros antigos de `created_by` continuam referenciando o nickname anterior — não há rastreabilidade automática via join. A alternativa (FK com `userId`) resolveria isso, mas acoplaria toda entidade do sistema ao módulo de usuários, que neste projeto é opcional. Optou-se pela simplicidade e desacoplamento entre módulos.

### Escopo de testes: unit tests, sem end-to-end

A suíte de testes cobre UseCases, services e validação de DTOs com testes unitários (mocks de repository, sem infraestrutura real). Não há testes end-to-end.

**Motivo**: dado o volume de trabalho e o tempo disponível, unit tests oferecem o melhor retorno por esforço — validam as regras de negócio de forma rápida e isolada. Como consequência, a cobertura de código total do projeto não é 100% (controllers, guards, filters, interceptors e módulos de configuração não são cobertos), mas as regras de negócio (UseCases, services, DTOs) estão com cobertura completa.

### Violação de constraint de FK (erro 547) tratada na camada de infraestrutura

Ao tentar remover um `Model` com `Vehicle`s associados (ou uma `Brand` com `Model`s associados), o SQL Server rejeita a operação por violação de chave estrangeira. Esse erro é capturado no repository e traduzido para uma resposta HTTP 409, via checagem do código de erro específico do driver (`547`).

Essa lógica vive na camada de infraestrutura, não é coberta por unit test (exigiria um banco real rodando) — é validada manualmente e por inspeção de código.

### Sem endpoint de cadastro (signup)

A aplicação não expõe rota pública de criação de usuários. Autenticação acontece com um usuário padrão, criado via seed. A decisão reflete o escopo do projeto: uma API de gestão interna, não uma plataforma de auto-registro.

### CRUD de `users` não implementado

Apenas a entidade `User` e a autenticação foram implementadas. Um CRUD completo de usuários (criar, listar, atualizar, remover) não foi priorizado, dado que era o item de menor prioridade no planejamento do projeto.

### Seed executável, não apenas dado estático

`pnpm seed` popula o banco com um usuário padrão, marcas, modelos e veículos de exemplo, resolvendo relacionamentos (`brand → model → vehicle`) automaticamente a partir do arquivo `seed_vehicles.json`. O script é idempotente: pode ser executado múltiplas vezes sem duplicar dados. Dentro do container Docker, ele roda automaticamente a cada inicialização, junto com as migrations.

## Testes

```bash
pnpm test           # roda todos os testes
pnpm test:cov       # roda com relatório de cobertura
```

Testes ficam centralizados em `/test`, espelhando a estrutura de `src/modules`, com mocks reutilizáveis em `/test/mocks` para evitar duplicação entre specs.

## Scripts disponíveis

| Comando                          | Descrição                                      |
| -------------------------------- | ---------------------------------------------- |
| `pnpm start:dev`                 | Sobe a aplicação em modo watch                 |
| `pnpm migration:generate <nome>` | Gera uma nova migration a partir das entidades |
| `pnpm migration:run`             | Aplica migrations pendentes                    |
| `pnpm migration:revert`          | Reverte a última migration                     |
| `pnpm seed`                      | Popula o banco com dados de exemplo            |
| `pnpm test`                      | Roda os testes unitários                       |
| `pnpm test:cov`                  | Roda os testes com cobertura                   |

## Docker

| Comando                                                 | Descrição                                                      |
| ------------------------------------------------------- | -------------------------------------------------------------- |
| `docker compose up -d --build`                          | Sobe toda a infraestrutura + aplicação containerizada          |
| `docker compose up -d sqlserver redis rabbitmq mongodb` | Sobe apenas a infraestrutura (para rodar a API local)          |
| `docker compose logs -f app`                            | Acompanha os logs da aplicação containerizada                  |
| `docker compose down`                                   | Derruba os containers, mantendo os volumes (dados preservados) |
| `docker compose down -v`                                | Derruba os containers e remove os volumes (reset completo)     |
