# Integração com o Backend — web-menu

> Guia de integração para o frontend (painel admin e cardápio do cliente) e outros consumidores da API.
> Documento derivado do código atual (`src/interfaces/http/controllers/*` e `src/application/use-cases/*`).
> As decisões de produto/arquitetura estão em [`decisions.md`](../decisions.md).

---

## 1. Visão geral da aplicação

Aplicação de **cardápio virtual multi-tenant**:

- Cada **Restaurant** é um tenant; todos os dados são escopados por `restaurant_id`.
- O cliente acessa o cardápio via **QR code** (dine-in) ou **link direto** (pickup/delivery).
- **Canais**: `dine_in` (principal), `pickup` e `delivery`.
- **Tracking em tempo real** por WebSocket, com máquina de estados simples.
- Admin acessa um **painel** com login por email/senha (JWT) para gerenciar cardápio, mesas, pedidos e ver relatórios.
- Cliente **não precisa de cadastro** no local; pickup/delivery exigem nome e telefone.

---

## 2. Ambiente e execução

| Item | Valor |
| ---- | ----- |
| Base URL (dev) | `http://localhost:3000` |
| Documentação interativa (Swagger) | `GET /docs` |
| Health check | `GET /health` |
| WebSocket | `ws://localhost:3000/ws` |

Variáveis de ambiente relevantes (`.env`):

```env
PORT=3000
DATABASE_URL=postgresql://localhost:5432/web_menu
JWT_SECRET=dev-only-secret-change-me
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

---

## 3. Convenções da API

### 3.1 Autenticação (admin)

- Fluxo: `POST /admin/auth/login` → recebe `token` → enviar em todas as rotas `/admin/*`:
  ```
  Authorization: Bearer <token>
  ```
- Token é um **JWT** (HS256) com os claims `sub` (id do admin), `restaurantId`, `name`, `email`.
- Sem header válido → `401`. O `restaurantId` do token define o tenant; o cliente **nunca** envia `restaurantId` nas rotas admin.

### 3.2 Formato de erro

Todas as respostas de erro seguem o envelope:

```json
{ "error": "codigo_do_erro", "message": "Mensagem legível" }
```

| Status | `error` (exemplos) | Quando |
| ------ | ------------------ | ------ |
| `401` | `unauthorized`, `invalid_credentials` | Token ausente/inválido ou login incorreto |
| `404` | `not_found` | Recurso inexistente ou fora do tenant |
| `409` | `conflict` | Regra de unicidade (ex.: mesa com rótulo repetido, sessão já fechada) |
| `422` | `validation_error` | Body/query/params inválidos contra o schema TypeBox |
| `429` | `rate_limited` | Excesso de requisições (header `retry-after` em segundos) |
| `500` | `internal_error` | Erro inesperado |

> Erros de negócio possuem códigos específicos, ex.: `restaurant_closed`, `outside_opening_hours`, `invalid_table_session`, `empty_order`, `invalid_status_transition`.

### 3.3 Paginação

Hoje apenas `GET /admin/orders` é paginado, no envelope:

```json
{ "items": [], "total": 0, "page": 1, "pageSize": 20 }
```

- `page` (default `1`, mínimo `1`).
- `pageSize` (default `20`, mínimo `1`, máximo `100`).

### 3.4 Tipos e enums

```ts
type OrderType = "dine_in" | "pickup" | "delivery";

type OrderStatus =
  | "pending" | "confirmed" | "preparing" | "ready"
  | "out_for_delivery" | "delivered" | "completed" | "canceled";

type TableSessionStatus = "open" | "closed";

type WeekDay = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

type TimeRange = [opensAt: string, closesAt: string]; // "HH:mm"

type OpeningHours = Partial<Record<WeekDay, TimeRange[]>>;

interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  lat?: number;
  lng?: number;
  reference?: string;
}
```

- Todos os **IDs são UUID v7** (string).
- Valores monetários são `number` (ex.: `19.9`).
- Timestamps são strings ISO 8601 (`date-time`).

---

## 4. Regras de negócio

1. **Snapshot de preços**: o preço do item e dos componentes é copiado no momento do pedido (`unitPrice`, `priceDelta`) e não muda depois.
2. **TableSession é exclusiva do dine-in**. Pickup e delivery não criam sessão.
3. **Cliente nunca altera status**. Apenas o restaurante (admin) ou o sistema.
4. **Toda transição de status** grava em `OrderStatusLog` e emite um evento WebSocket.
5. **Isolamento por `restaurant_id`**: o servidor deriva o tenant do token/QR; nunca confia em um id solto do cliente.
6. **Sem taxa por pedido** — monetização é assinatura mensal (fora do MVP).

**Máquina de estados:**

```
pending → confirmed → preparing → ready → out_for_delivery → delivered → completed
   │           │           │         │                                    ▲
   │           │           │         └──────────→ completed (dine-in/pickup)┘
   └───────────┴───────────┴──→ canceled
```

- `out_for_delivery` e `delivered` **só** para `type = "delivery"`.
- Em `pickup`/`dine_in`, o final é `ready → completed`.
- Cancelamento só é permitido **antes** de `ready` (validado por `OrderStatusMachine`).

**Composição de produtos**: um produto tem grupos de componentes (`minSelect`/`maxSelect`/`isRequired`) e cada componente tem `priceDelta`. `Product` ↔ `Category` é N:N. A seleção é validada no servidor ao criar o pedido.

---

## 5. Endpoints públicos

### `GET /health`

Sem auth. Retorna o estado do serviço.

**Response `200`**

```json
{ "status": "ok", "database": "up" }
```

**Response `503`** (banco indisponível)

```json
{ "status": "degraded", "database": "down" }
```

---

### `GET /menu/:slug`

Cardápio público do restaurante. Sem auth.

**Params**

| Campo  | Tipo   | Obrigatório | Descrição            |
| ------ | ------ | ----------- | -------------------- |
| `slug` | string | sim         | Slug do restaurante  |

**Response `200`**

```jsonc
{
  "restaurant": {
    "id": "uuid",
    "name": "Cantina Bella",
    "slug": "cantina-bella",
    "phone": "+5511999999999",
    "isOpen": true,
    "openingHours": {
      "mon": [["11:00", "15:00"], ["18:00", "23:00"]],
      "fri": [["11:00", "23:59"]]
    }
  },
  "categories": [
    {
      "id": "uuid",
      "name": "Massas",
      "position": 0,
      "products": [
        {
          "id": "uuid",
          "restaurantId": "uuid",
          "name": "Spaghetti ao Sugo",
          "description": "Molho de tomate fresco",
          "basePrice": 42.0,
          "imageUrl": "https://.../spaghetti.jpg",
          "isAvailable": true,
          "deletedAt": null,
          "createdAt": "2026-01-01T12:00:00.000Z",
          "productCategories": [
            { "productId": "uuid", "categoryId": "uuid", "category": { /* Category */ } }
          ],
          "componentGroups": [
            {
              "id": "uuid",
              "productId": "uuid",
              "name": "Ponto da carne",
              "minSelect": 1,
              "maxSelect": 1,
              "isRequired": true,
              "position": 0,
              "components": [
                {
                  "id": "uuid",
                  "componentGroupId": "uuid",
                  "name": "Ao ponto",
                  "priceDelta": 0,
                  "isAvailable": true,
                  "position": 0
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "uncategorized": []
}
```

> Só produtos `isAvailable` e não deletados aparecem; apenas componentes disponíveis são retornados, já ordenados por `position`.

**Erros**: `404 not_found` (slug inexistente).

---

### `POST /sessions/resolve`

Resolve o QR code da mesa e **abre ou reutiliza** a sessão aberta. Sem auth (chamada pública a partir do QR). Sujeito a rate limit.

**Request body**

| Campo     | Tipo   | Obrigatório | Descrição                    |
| --------- | ------ | ----------- | ---------------------------- |
| `qrToken` | string | sim         | Token do QR code da mesa     |

```json
{ "qrToken": "0192f0..." }
```

**Response `200`**

```json
{
  "restaurant": {
    "id": "uuid",
    "name": "Cantina Bella",
    "slug": "cantina-bella",
    "isOpen": true
  },
  "table": { "id": "uuid", "label": "Mesa 5" },
  "session": { "id": "uuid", "status": "open", "openedAt": "2026-01-01T12:00:00.000Z" }
}
```

**Erros**: `404` (QR inválido ou mesa inativa), `409` (não foi possível abrir a sessão).

---

### `POST /orders`

Cria um pedido. Sem auth. **Sujeito a rate limit** (`RATE_LIMIT_MAX` por `RATE_LIMIT_WINDOW_MS`; `429` com `retry-after`).

O body é uma **união discriminada** por `type`. Campos comuns:

| Campo   | Tipo            | Obrigatório | Descrição                                   |
| ------- | --------------- | ----------- | ------------------------------------------- |
| `type`  | `OrderType`     | sim         | `dine_in` \| `pickup` \| `delivery`         |
| `slug`  | string          | sim         | Slug do restaurante                         |
| `notes` | string \| null  | não         | Observações do pedido                       |
| `items` | `OrderItem[]`   | sim         | Ao menos 1 item                             |

**`OrderItem`**

| Campo        | Tipo     | Obrigatório | Descrição                          |
| ------------ | -------- | ----------- | ---------------------------------- |
| `productId`  | uuid     | sim         | Produto                            |
| `quantity`   | integer  | sim         | `>= 1`                             |
| `notes`      | string \| null | não    | Observação do item                 |
| `components` | array    | não         | Componentes escolhidos             |
| `components[].componentId` | uuid | sim | Componente                         |
| `components[].quantity` | integer | não | Default `1`, `>= 1`              |

**Campos por canal**

- `dine_in`: exige `tableSessionId` (uuid), obtido em `POST /sessions/resolve`.
- `pickup`: exige `customerName` (string) e `customerPhone` (string, mín. 8).
- `delivery`: exige `customerName`, `customerPhone` e `deliveryAddress`.

**Exemplo — dine-in**

```json
{
  "type": "dine_in",
  "slug": "cantina-bella",
  "tableSessionId": "uuid-da-sessao",
  "notes": "sem cebola",
  "items": [
    {
      "productId": "uuid-produto",
      "quantity": 2,
      "notes": "bem passado",
      "components": [
        { "componentId": "uuid-componente", "quantity": 1 }
      ]
    }
  ]
}
```

**Exemplo — delivery**

```json
{
  "type": "delivery",
  "slug": "cantina-bella",
  "customerName": "Maria",
  "customerPhone": "+5511988888888",
  "deliveryAddress": {
    "street": "Rua Exemplo",
    "number": "100",
    "complement": "ap 12",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01000-000",
    "reference": "Portão azul"
  },
  "items": [{ "productId": "uuid-produto", "quantity": 1 }]
}
```

**Response `201`** — o `Order` criado (preços já calculados no servidor):

```json
{
  "id": "uuid",
  "restaurantId": "uuid",
  "type": "delivery",
  "status": "pending",
  "tableSessionId": null,
  "customerName": "Maria",
  "customerPhone": "+5511988888888",
  "deliveryAddress": { "...": "..." },
  "subtotal": 42.0,
  "deliveryFee": 8.0,
  "total": 50.0,
  "notes": null,
  "createdAt": "2026-01-01T12:00:00.000Z",
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

**Erros**

| Status | `error` | Causa |
| ------ | ------- | ----- |
| `404` | `not_found` | Restaurante (slug) inexistente |
| `400`/`422` | `restaurant_closed` / `outside_opening_hours` | Fora de funcionamento |
| `400` | `invalid_table_session` | Sessão inexistente, fechada ou de outro tenant |
| `400` | `empty_order` | Sem itens |
| `400` | (códigos de seleção) | Componente obrigatório ausente, acima do `maxSelect`, produto indisponível |
| `429` | `rate_limited` | Excesso de requisições |

> **Recomendação ao cliente**: guardar o `id` retornado e abrir o WebSocket em `order:{id}` (ou `session:{tableSessionId}` no dine-in) para acompanhar o status.

---

### `GET /orders/:id`

Tracking público de um pedido. Sem auth.

**Params**: `id` (uuid).

**Response `200`** — `OrderDetail`:

```jsonc
{
  "id": "uuid",
  "restaurantId": "uuid",
  "type": "dine_in",
  "status": "preparing",
  "tableSessionId": "uuid",
  "customerName": null,
  "customerPhone": null,
  "deliveryAddress": null,
  "subtotal": 42.0,
  "deliveryFee": 0,
  "total": 42.0,
  "notes": null,
  "createdAt": "2026-01-01T12:00:00.000Z",
  "updatedAt": "2026-01-01T12:05:00.000Z",
  "items": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 21.0,
      "notes": "bem passado",
      "components": [
        {
          "id": "uuid",
          "orderItemId": "uuid",
          "componentId": "uuid",
          "quantity": 1,
          "priceDelta": 0
        }
      ]
    }
  ],
  "statusLogs": [
    { "id": "uuid", "orderId": "uuid", "status": "pending", "note": "Pedido criado", "createdAt": "2026-01-01T12:00:00.000Z" },
    { "id": "uuid", "orderId": "uuid", "status": "confirmed", "note": null, "createdAt": "2026-01-01T12:02:00.000Z" }
  ]
}
```

**Erros**: `404 not_found`.

---

## 6. Endpoints admin (JWT)

Todas exigem `Authorization: Bearer <jwt>` e operam no tenant do token.

### Autenticação

#### `POST /admin/auth/login`

**Request**

```json
{ "email": "admin@cantina.test", "password": "senha" }
```

**Response `200`**

```json
{
  "token": "eyJhbGciOi...",
  "admin": { "id": "uuid", "name": "Admin", "email": "admin@cantina.test", "restaurantId": "uuid" }
}
```

**Erros**: `401 invalid_credentials`.

#### `GET /admin/auth/me`

**Response `200`**

```json
{ "id": "uuid", "name": "Admin", "email": "admin@cantina.test", "restaurantId": "uuid" }
```

---

### Restaurante

#### `GET /admin/restaurant`

**Response `200`** — `Restaurant`:

```json
{
  "id": "uuid",
  "name": "Cantina Bella",
  "slug": "cantina-bella",
  "phone": "+5511999999999",
  "isOpen": true,
  "deliveryFee": 8.0,
  "openingHours": { "mon": [["11:00", "15:00"], ["18:00", "23:00"]] },
  "createdAt": "2026-01-01T12:00:00.000Z",
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

#### `PATCH /admin/restaurant`

**Request** (todos opcionais)

```json
{
  "name": "Cantina Bella",
  "phone": "+5511999999999",
  "isOpen": true,
  "deliveryFee": 8.0,
  "openingHours": { "mon": [["11:00", "15:00"], ["18:00", "23:00"]] }
}
```

> `phone` e `openingHours` aceitam `null` para limpar. Cada `TimeRange` é um par `["HH:mm","HH:mm"]`.

**Response `200`**: `Restaurant` atualizado.

---

### Categorias

#### `GET /admin/categories`

**Response `200`**: `Category[]` (não deletadas), ordenadas por posição.

```json
[{ "id": "uuid", "restaurantId": "uuid", "name": "Massas", "position": 0, "deletedAt": null }]
```

#### `POST /admin/categories`

**Request**

| Campo      | Tipo    | Obrigatório | Default |
| ---------- | ------- | ----------- | ------- |
| `name`     | string  | sim         | —       |
| `position` | integer | não         | `0`     |

**Response `201`**: `Category`.

#### `PATCH /admin/categories/:id`

**Request** (opcionais): `{ "name": "...", "position": 1 }` → **Response `200`**: `Category`.

#### `DELETE /admin/categories/:id`

Soft delete → **Response `204`** (sem corpo).

---

### Produtos

#### `GET /admin/products`

**Response `200`**: `Product[]`. O campo `componentGroups` vem **vazio** (`[]`) nesta listagem; `productCategories` (com `category`) vem populado.

#### `GET /admin/products/:id`

**Response `200`**: `Product` com `componentGroups[].components[]` e `productCategories[].category` populados, ordenados por `position`.

#### `POST /admin/products`

**Request**

```jsonc
{
  "name": "Spaghetti ao Sugo",
  "description": "Molho de tomate fresco",   // opcional, string|null
  "basePrice": 42.0,                          // >= 0
  "imageUrl": "https://...",                  // opcional, string|null
  "isAvailable": true,                        // opcional, default true
  "categoryIds": ["uuid-categoria"],          // opcional
  "componentGroups": [
    {
      "name": "Ponto da carne",               // obrigatório
      "minSelect": 1,                          // opcional, default 0
      "maxSelect": 1,                          // opcional, default 1
      "isRequired": true,                      // opcional, default false
      "position": 0,                           // opcional, default 0
      "components": [
        {
          "name": "Ao ponto",                  // obrigatório
          "priceDelta": 0,                     // opcional, default 0
          "isAvailable": true,                 // opcional, default true
          "position": 0                        // opcional, default = índice
        }
      ]
    }
  ]
}
```

**Response `201`**: `Product` completo (detalhe).

> Regra: `isRequired = true` exige `minSelect >= 1`; `maxSelect >= minSelect`.

#### `PATCH /admin/products/:id`

**Request**: qualquer subconjunto dos campos acima. Enviar `componentGroups` **substitui** todos os grupos/componentes do produto; `categoryIds` **substitui** os vínculos. **Response `200`**: `Product` detalhado.

#### `DELETE /admin/products/:id`

Soft delete → **Response `204`**.

---

### Mesas

#### `GET /admin/tables`

**Response `200`**:

```json
[{ "id": "uuid", "restaurantId": "uuid", "label": "Mesa 5", "qrToken": "0192...", "isActive": true, "createdAt": "2026-01-01T12:00:00.000Z" }]
```

#### `POST /admin/tables`

**Request**: `{ "label": "Mesa 5", "isActive": true }` (`isActive` opcional, default `true`).
**Response `201`**: `Table` (com `qrToken` gerado). **Erro** `409` se `label` já existir no restaurante.

#### `PATCH /admin/tables/:id`

**Request** (opcionais): `{ "label": "Mesa 6", "isActive": false }` → **Response `200`**: `Table`.

#### `POST /admin/tables/:id/regenerate-token`

Regenera o `qrToken` (invalida QR antigos). **Response `200`**: `Table` com novo token.

#### `DELETE /admin/tables/:id`

**Response `204`**.

---

### Sessões

#### `GET /admin/sessions/open`

Sessões abertas do restaurante (com `table`). **Response `200`**:

```json
[{ "id": "uuid", "tableId": "uuid", "status": "open", "openedAt": "2026-01-01T12:00:00.000Z", "closedAt": null, "table": { /* Table */ } }]
```

#### `POST /admin/sessions/:id/close`

Fecha a conta da mesa. **Response `200`**: `TableSession` com `status: "closed"` e `closedAt`.
**Erros**: `404` (sessão inexistente/outro tenant), `409` (sessão já fechada).

---

### Pedidos (admin)

#### `GET /admin/orders`

**Query**

| Campo      | Tipo          | Obrigatório | Descrição |
| ---------- | ------------- | ----------- | --------- |
| `status`   | `OrderStatus` | não         | Filtro por status |
| `type`     | `OrderType`   | não         | Filtro por canal |
| `from`     | date-time     | não         | Início do período |
| `to`       | date-time     | não         | Fim do período |
| `page`     | number        | não         | Default `1`, `>= 1` |
| `pageSize` | number        | não         | Default `20`, `1..100` |

**Response `200`**

```json
{
  "items": [ /* Order[] (sem items/statusLogs) */ ],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

#### `GET /admin/orders/:id`

**Response `200`**: `OrderDetail` (igual ao tracking público, mas escopado ao tenant). `404` se não pertencer ao restaurante.

#### `PATCH /admin/orders/:id/status`

**Request**

| Campo    | Tipo          | Obrigatório |
| -------- | ------------- | ----------- |
| `status` | `OrderStatus` | sim         |
| `note`   | string \| null | não        |

```json
{ "status": "preparing", "note": "na fila" }
```

**Response `200`**: `OrderDetail` atualizado. Transição inválida → erro de máquina de estados. **Emite evento WebSocket.**

#### `POST /admin/orders/:id/cancel`

**Request**: `{ "note": "cliente desistiu" }` (`note` opcional). Atalho para `status = "canceled"`.
**Response `200`**: `OrderDetail`. Só permitido antes de `ready`. **Emite evento WebSocket.**

---

### Dashboard (admin)

Todas aceitam query opcional `from`/`to` (date-time).

#### `GET /admin/dashboard/sales`

**Response `200`**

```json
{
  "summary": {
    "orders": 120,
    "revenue": 5400.5,
    "canceled": 3,
    "averageTicket": 45.0,
    "byType": [
      { "type": "dine_in", "orders": 80, "revenue": 3600.0 },
      { "type": "delivery", "orders": 40, "revenue": 1800.5 }
    ]
  },
  "daily": [
    { "date": "2026-01-01", "orders": 30, "revenue": 1350.0 }
  ]
}
```

#### `GET /admin/dashboard/catalog`

**Query extra**: `limit` (number, `1..50`, default `10`).

**Response `200`**

```json
{
  "topProducts": [
    { "productId": "uuid", "name": "Spaghetti", "quantity": 50, "revenue": 2100.0 }
  ],
  "topComponents": [
    { "componentId": "uuid", "name": "Ao ponto", "quantity": 20 }
  ]
}
```

#### `GET /admin/dashboard/operations`

**Response `200`**

```json
{
  "prepTime": { "ordersMeasured": 40, "averageMinutes": 18.5 },
  "occupancy": { "sessions": 25, "openSessions": 3, "averageMinutes": 52.0 }
}
```

---

## 7. WebSocket (tracking)

Endpoint: `ws://<host>/ws` (Bun nativo). Os canais ("rooms") são mantidos em memória.

**Ao conectar**, o servidor envia:

```json
{ "event": "connected" }
```

**Mensagens do cliente**

| Mensagem | Efeito |
| -------- | ------ |
| `{ "action": "subscribe", "channel": "order:<uuid>" }` | Entra no canal do pedido |
| `{ "action": "subscribe", "channel": "session:<uuid>" }` | Entra no canal da mesa (dine-in) |
| `{ "action": "unsubscribe", "channel": "order:<uuid>" }` | Sai do canal |
| `{ "action": "ping" }` | Responde `{ "event": "pong" }` |

**Respostas do servidor**

```json
{ "event": "subscribed", "channel": "order:uuid" }
{ "event": "unsubscribed", "channel": "order:uuid" }
{ "event": "error", "message": "invalid_channel" | "invalid_message" | "unknown_action" }
```

**Evento de negócio** — publicado a cada criação/transição de status:

```json
{
  "event": "order.status",
  "data": {
    "orderId": "uuid",
    "restaurantId": "uuid",
    "type": "dine_in",
    "status": "preparing",
    "tableSessionId": "uuid",
    "updatedAt": "2026-01-01T12:05:00.000Z"
  }
}
```

- **Dine-in**: assinar `session:{tableSessionId}` recebe atualizações de **todos** os pedidos da mesa.
- **Pickup/Delivery**: assinar `order:{orderId}` recebe só o próprio pedido.
- O padrão de canal aceito é `^(order|session):<uuid>$`.

---

## 8. Fluxos de integração

### 8.1 Dine-in (QR code)

1. `GET /menu/:slug` (ou já vem do QR) → monta o cardápio.
2. `POST /sessions/resolve { qrToken }` → obtém `session.id` (e table/restaurant).
3. Cliente monta o pedido → `POST /orders` com `type: "dine_in"` e `tableSessionId`.
4. Abre `WS /ws` → `subscribe` em `session:{session.id}`.
5. Recebe eventos `order.status` conforme o restaurante avança o status.
6. Ao final, o restaurante fecha a conta via `POST /admin/sessions/:id/close`.

### 8.2 Pickup / Delivery

1. Cliente acessa `GET /menu/:slug`.
2. Monta pedido com `customerName`/`customerPhone` (+ `deliveryAddress` se delivery).
3. `POST /orders` com `type: "pickup"` ou `"delivery"`.
4. Abre `WS /ws` → `subscribe` em `order:{order.id}`.
5. Acompanha `order.status` até `completed`.

### 8.3 Painel admin

1. `POST /admin/auth/login` → guarda `token`.
2. Preenche `GET /admin/auth/me` / `GET /admin/restaurant`.
3. Cadastra categorias → produtos (com grupos/componentes) → mesas.
4. Acompanha `GET /admin/orders` e avança status com `PATCH /admin/orders/:id/status`.
5. Consulta relatórios em `GET /admin/dashboard/*`.

---

## 9. Referência rápida de rotas

| Método | Rota | Auth | Resumo |
| ------ | ---- | ---- | ------ |
| `GET` | `/health` | — | Health check |
| `GET` | `/docs` | — | Swagger UI |
| `GET` | `/menu/:slug` | — | Cardápio público |
| `POST` | `/sessions/resolve` | — | Abre/reutiliza sessão por QR |
| `POST` | `/orders` | — | Cria pedido (rate limited) |
| `GET` | `/orders/:id` | — | Tracking público |
| `WS` | `/ws` | — | Tracking em tempo real |
| `POST` | `/admin/auth/login` | — | Login do painel |
| `GET` | `/admin/auth/me` | JWT | Admin autenticado |
| `GET` | `/admin/restaurant` | JWT | Perfil do restaurante |
| `PATCH` | `/admin/restaurant` | JWT | Atualiza perfil |
| `GET` | `/admin/categories` | JWT | Lista categorias |
| `POST` | `/admin/categories` | JWT | Cria categoria |
| `PATCH` | `/admin/categories/:id` | JWT | Atualiza categoria |
| `DELETE` | `/admin/categories/:id` | JWT | Remove (soft) |
| `GET` | `/admin/products` | JWT | Lista produtos |
| `GET` | `/admin/products/:id` | JWT | Detalha produto |
| `POST` | `/admin/products` | JWT | Cria produto |
| `PATCH` | `/admin/products/:id` | JWT | Atualiza produto |
| `DELETE` | `/admin/products/:id` | JWT | Remove (soft) |
| `GET` | `/admin/tables` | JWT | Lista mesas |
| `POST` | `/admin/tables` | JWT | Cria mesa |
| `PATCH` | `/admin/tables/:id` | JWT | Atualiza mesa |
| `POST` | `/admin/tables/:id/regenerate-token` | JWT | Regenera QR |
| `DELETE` | `/admin/tables/:id` | JWT | Remove mesa |
| `GET` | `/admin/sessions/open` | JWT | Sessões abertas |
| `POST` | `/admin/sessions/:id/close` | JWT | Fecha conta |
| `GET` | `/admin/orders` | JWT | Lista/filtra pedidos |
| `GET` | `/admin/orders/:id` | JWT | Detalha pedido |
| `PATCH` | `/admin/orders/:id/status` | JWT | Avança status |
| `POST` | `/admin/orders/:id/cancel` | JWT | Cancela pedido |
| `GET` | `/admin/dashboard/sales` | JWT | Relatório de vendas |
| `GET` | `/admin/dashboard/catalog` | JWT | Produtos/componentes top |
| `GET` | `/admin/dashboard/operations` | JWT | Preparo/ocupação |

---

_Documento de integração. Atualizar quando a API evoluir. Fonte de verdade dos contratos: `src/interfaces/http/controllers/`._
