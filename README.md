# GastoCerto IA — Agente Pessoal de Gestão Financeira (Node.js + PostgreSQL + Gemini + Next.js)

Produto: plataforma inteligente de gestão financeira pessoal. O backend (**Node.js/Express + PostgreSQL**) autentica usuários com **JWT**, aplica regras de negócio em **DDD / Arquitetura Hexagonal** e integra a **API do Google Gemini** para:
1. **Agente Pessoal Conversacional (Function Calling / Tools)**: o usuário conversa em linguagem natural para registrar gastos com anotações, editar/remover lançamentos, consultar o resumo do mês, definir orçamento e pedir conselhos.
2. **Categorização Automática de Gastos** (Structured JSON Output).
3. **Consultoria e Insights Mensais** (Structured JSON Output).

---

## Arquitetura

### Backend (`backend/src/`) — DDD & Ports and Adapters (Camada → Tipo → Contexto)
```text
backend/
├── server.js                                      # Composition root: conecta todas as camadas
├── .env.example                                   # Variáveis de ambiente documentadas
├── src/
│   ├── domain/                                    # 100% puro, zero dependências externas
│   │   ├── entity/{user,expense,budget,chat,insights}/
│   │   ├── enums/{expense,budget,chat}/
│   │   ├── exception/{shared,user,expense,insights}/
│   │   ├── repository/{user,expense,budget,chat,ai}/
│   │   └── valueobject/{shared,user,expense}/
│   ├── application/                               # Orquestração de casos de uso e contratos
│   │   ├── dto/{auth,expense,budget,insights,chat}/
│   │   └── usecase/{shared,auth,expense,budget,insights,chat}/
│   ├── infrastructure/                            # Detalhes técnicos e integrações externas
│   │   ├── persistence/
│   │   │   ├── connection/PgConnection.js
│   │   │   ├── entity/{user,expense,budget,chat}/
│   │   │   ├── mapper/{user,expense,budget,chat}/
│   │   │   ├── repository/{user,expense,budget,chat}/
│   │   │   └── adapter/{user,expense,budget,chat}/
│   │   ├── security/auth/{PasswordHasher,JwtTokenService}.js
│   │   └── gemini/{shared,expense,insights,chat}/
│   └── api/                                       # Entrada HTTP (Express)
│       ├── controller/{auth,expense,budget,insights,chat}/
│       ├── dto/{auth,expense,budget,insights,chat}/
│       ├── middleware/{authMiddleware,errorHandlerMiddleware}.js
│       └── createApp.js
└── test/domain.test.js                            # 13 testes automatizados (npm test)
```

### Frontend (`web/src/`) — Arquitetura em Camadas e Contextos de Feature
```text
web/src/
├── app/                           # Next.js App Router (layout.tsx, page.tsx, globals.css)
├── types/                         # Tipagens separadas por contexto (auth.ts, expenses.ts, agentChat.ts)
├── shared/                        # Utilitários de formatação monetária e datas locais (utils/format.ts)
├── infrastructure/                # Cliente HTTP JWT e serviços de API por contexto (http, auth, expenses, agent-chat)
└── presentations/                 # Contextos React e Componentes visuais separados por feature:
    ├── auth/                      # AuthContext e AuthScreen (Login e Cadastro)
    ├── agent-chat/                # AgentChatContext e AgentChatView (Conversa natural com o Agente Gemini)
    └── expenses/                  # ExpensesContext, BudgetHeaderSummary e ExpensesTableView (Tabela e Anotações)
```

---

## Como rodar

### 1. Banco de Dados PostgreSQL
Você pode usar uma instância PostgreSQL existente ou subir via Docker na raiz do projeto:
```bash
docker compose up -d
```

### 2. Backend (API)
```bash
cd backend
npm install
cp .env.example .env     # Preencha GEMINI_API_KEY, DATABASE_URL e JWT_SECRET
npm start                # Cria as tabelas automaticamente e sobe em http://localhost:3000
npm test                 # Executa os 13 testes automatizados
```

### 3. Frontend Web (Next.js)
```bash
cd web
npm install
npm run dev -- -p 3001   # Abre em http://localhost:3001
```

---

## Endpoints Principais
| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/auth/register` | Pública | Cria conta `{ name, email, password }` e retorna `{ user, token }` |
| POST | `/auth/login` | Pública | Autentica `{ email, password }` e retorna `{ user, token }` |
| GET | `/auth/me` | Bearer JWT | Retorna os dados do usuário logado |
| GET | `/categories` | Pública | Lista categorias oficiais do sistema |
| GET | `/expenses?month=AAAA-MM` | Bearer JWT | Lista gastos, anotações, total por categoria e orçamento do mês |
| POST | `/expenses` | Bearer JWT | Cria gasto `{ description, amount, date?, category?, notes? }` |
| PUT | `/expenses/:id` | Bearer JWT | Atualiza gasto ou anotação `{ description?, amount?, date?, category?, notes? }` |
| DELETE | `/expenses/:id` | Bearer JWT | Remove um gasto do usuário |
| PUT | `/budget` | Bearer JWT | Define limite de orçamento `{ month, limit }` |
| GET | `/insights?month=AAAA-MM` | Bearer JWT | Gera análise e dicas com Gemini (mínimo de 3 gastos no mês) |
| GET | `/chat/messages` | Bearer JWT | Retorna o histórico de conversa com o agente |
| POST | `/chat/messages` | Bearer JWT | Envia mensagem natural `{ message }` ao Agente Gemini (Function Calling) |
| DELETE | `/chat/messages` | Bearer JWT | Limpa o histórico de conversa do usuário |
