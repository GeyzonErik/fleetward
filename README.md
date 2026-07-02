# Fleetward

Backend de uma plataforma de gestão de frotas: cadastro de veículos, modelos e marcas, com autenticação JWT e cache de leitura via Redis.

## Stack

- **Node.js** + **NestJS** (arquitetura em camadas: Controller → UseCase → Repository)
- **TypeORM** + **SQL Server**
- **Redis** (cache de consultas)
- **JWT** (autenticação)
- **Jest** (testes unitários)
- **Docker Compose** (infraestrutura local)

## Como rodar

### Pré-requisitos

- Node.js 18+
- pnpm
- Docker + Docker Compose

### Passo a passo

1. Clone o repositório e instale as dependências:

```bash
git clone <repo-url>
cd fleetward
pnpm install
```

2. Copie o `.env.example` para `.env` e ajuste se necessário (os valores padrão já funcionam com o `docker-compose.yml`):

```bash
cp .env.example .env
```

3. Suba a infraestrutura (SQL Server + Redis):

```bash
docker compose up -d
```

Aguarde o SQL Server ficar `healthy` (leva de 15 a 30 segundos no primeiro boot):

```bash
docker compose ps
```

4. Rode as migrations:

```bash
pnpm migration:run
```

5. Popule o banco com dados de exemplo (usuário padrão, marcas, modelos e veículos):

```bash
pnpm seed
```

6. Suba a aplicação:

```bash
pnpm start:dev
```

A API estará disponível em `http://localhost:3000`.

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

| Variável | Descrição |
|---|---|
| `PORT` | Porta em que a API sobe |
| `DB_HOST` | Host do SQL Server |
| `DB_PORT` | Porta do SQL Server |
| `DB_USERNAME` | Usuário do banco (fixo em `sa` no Docker Compose) |
| `DB_PASSWORD` | Senha do banco |
| `DB_DATABASE` | Nome do banco de dados |
| `JWT_SECRET` | Chave de assinatura do token JWT |
| `JWT_EXPIRES_IN` | Tempo de expiração do token (ex: `1d`) |
| `REDIS_HOST` | Host do Redis |
| `REDIS_PORT` | Porta do Redis |
| `CACHE_TTL_SECONDS` | Tempo de vida do cache de veículos, em segundos |

## Endpoints

### Auth

| Método | Rota | Descrição | Autenticado |
|---|---|---|---|
| POST | `/auth/login` | Login, retorna JWT | Não |

### Models

| Método | Rota | Descrição |
|---|---|---|
| POST | `/models` | Cria um model |
| GET | `/models` | Lista todos os models |
| GET | `/models/:id` | Busca um model por id |
| PATCH | `/models/:id` | Atualiza um model |
| DELETE | `/models/:id` | Remove um model |

### Vehicles

| Método | Rota | Descrição |
|---|---|---|
| POST | `/vehicles` | Cria um vehicle |
| GET | `/vehicles` | Lista todos os vehicles (cacheado) |
| GET | `/vehicles/:id` | Busca um vehicle por id (cacheado) |
| PATCH | `/vehicles/:id` | Atualiza um vehicle (invalida cache) |
| DELETE | `/vehicles/:id` | Remove um vehicle (invalida cache) |

### Brands

| Método | Rota | Descrição |
|---|---|---|
| POST | `/brands` | Cria uma brand |
| GET | `/brands` | Lista todas as brands |
| GET | `/brands/:id` | Busca uma brand por id |
| PATCH | `/brands/:id` | Atualiza uma brand |
| DELETE | `/brands/:id` | Remove uma brand |

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

Essa separação existe por um motivo prático, não só estético: torna os UseCases testáveis sem depender de banco de dados real (veja a seção de Testes).

### Cache

O cache de `vehicles` é implementado como um **decorator** sobre o repository real (`VehicleCachedRepository`), não como lógica misturada dentro do repository TypeORM. O UseCase injeta `VEHICLE_REPOSITORY` normalmente e não sabe se está falando com cache ou com o banco — a troca acontece inteiramente na configuração do módulo (`vehicles.module.ts`).

Estratégia: cache-aside simples. Leitura primeiro consulta o Redis; se não encontrar, busca no banco e popula o cache. Qualquer escrita (`create`, `update`, `delete`) invalida todo o cache de `vehicles` (`invalidateAll`), em vez de invalidação seletiva por chave — decisão consciente de simplicidade, dado o volume de dados esperado para este escopo.

## Decisões técnicas e trade-offs

### `created_by` como texto livre, não FK

O campo `created_by`, presente em todas as entidades, guarda o `nickname` do usuário autenticado como `varchar`, não como chave estrangeira para `users`.

**Trade-off assumido**: se um usuário mudar de nickname no futuro, registros antigos de `created_by` continuam referenciando o nickname anterior — não há rastreabilidade automática via join. A alternativa (FK com `userId`) resolveria isso, mas acoplaria toda entidade do sistema ao módulo de usuários, que neste projeto é opcional. Optou-se pela simplicidade e desacoplamento entre módulos.

### Escopo de testes: unit tests, sem end-to-end

A suíte de testes cobre UseCases, services e validação de DTOs com testes unitários (mocks de repository, sem infraestrutura real). Não há testes end-to-end (subida de servidor HTTP + banco real).

**Motivo**: dado o volume de trabalho e o tempo disponível, unit tests oferecem o melhor retorno por esforço — validam as regras de negócio de forma rápida e isolada. Como consequência, a cobertura de código total do projeto não é 100% (controllers, guards, filters e módulos de configuração não são cobertos), mas as regras de negócio (UseCases, services, DTOs) estão com cobertura completa.

### Violação de constraint de FK (erro 547) tratada na camada de infraestrutura

Ao tentar remover um `Model` com `Vehicles` associados (ou uma `Brand` com `Model`s associados), o SQL Server rejeita a operação por violação de chave estrangeira. Esse erro é capturado no repository e traduzido para uma resposta HTTP 409 amigável, via checagem do código de erro específico do driver (`547`).

Essa lógica vive na camada de infraestrutura (repository), não no UseCase, porque depende de um detalhe do driver do banco. Por consequência, não é coberta por unit test (testar isso exigiria um banco real rodando) — é validada manualmente e por inspeção de código.

### Sem endpoint de cadastro (signup)

A aplicação não expõe rota pública de criação de usuários. Autenticação acontece com um usuário padrão, criado via seed. A decisão reflete o escopo do projeto: uma API de gestão interna, não uma plataforma de auto-registro.

### Seed executável, não apenas dado estático

`pnpm seed` popula o banco com um usuário padrão, marcas, modelos e veículos de exemplo, resolvendo relacionamentos (`brand → model → vehicle`) automaticamente a partir do arquivo `seed_vehicles.json`. O script é idempotente: pode ser executado múltiplas vezes sem duplicar dados.

## Testes

```bash
pnpm test           # roda todos os testes
pnpm test:cov       # roda com relatório de cobertura
```

Testes ficam centralizados em `/test`, espelhando a estrutura de `src/modules`, com mocks reutilizáveis em `/test/mocks` para evitar duplicação entre specs.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `pnpm start:dev` | Sobe a aplicação em modo watch |
| `pnpm migration:generate <nome>` | Gera uma nova migration a partir das entidades |
| `pnpm migration:run` | Aplica migrations pendentes |
| `pnpm migration:revert` | Reverte a última migration |
| `pnpm seed` | Popula o banco com dados de exemplo |
| `pnpm test` | Roda os testes unitários |
| `pnpm test:cov` | Roda os testes com cobertura |

