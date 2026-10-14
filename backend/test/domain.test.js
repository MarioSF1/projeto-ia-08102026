const test = require('node:test');
const assert = require('node:assert');

// Domínio: Entidades, Value Objects, Enums, Exceções e Portas de Repositório
const { Expense } = require('../src/domain/entity/expense/Expense');
const { Budget } = require('../src/domain/entity/budget/Budget');
const { User } = require('../src/domain/entity/user/User');
const { ChatMessage } = require('../src/domain/entity/chat/ChatMessage');
const { Category } = require('../src/domain/valueobject/expense/Category');
const { YearMonth } = require('../src/domain/valueobject/shared/YearMonth');
const { Email } = require('../src/domain/valueobject/user/Email');
const { CategoryEnum } = require('../src/domain/enums/expense/CategoryEnum');
const { BudgetStatusEnum } = require('../src/domain/enums/budget/BudgetStatusEnum');
const { ChatRoleEnum } = require('../src/domain/enums/chat/ChatRoleEnum');
const { GeminiModelEnum } = require('../src/domain/enums/ai/GeminiModelEnum');
const { ValidationError } = require('../src/domain/exception/shared/DomainError');
const {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  UnauthorizedError,
} = require('../src/domain/exception/user/UserExceptions');
const {
  DuplicateExpenseError,
  ExpenseNotFoundError,
} = require('../src/domain/exception/expense/ExpenseExceptions');
const { InsightsNotAvailableError } = require('../src/domain/exception/insights/InsightsExceptions');
const { UserRepository } = require('../src/domain/repository/user/UserRepository');
const { ExpenseRepository } = require('../src/domain/repository/expense/ExpenseRepository');
const { BudgetRepository } = require('../src/domain/repository/budget/BudgetRepository');
const { ChatMessageRepository } = require('../src/domain/repository/chat/ChatMessageRepository');
const { CategoryClassifierPort } = require('../src/domain/repository/ai/CategoryClassifierPort');
const { InsightsGeneratorPort } = require('../src/domain/repository/ai/InsightsGeneratorPort');

// Aplicação: Casos de Uso e Exceções
const { BudgetStatusService } = require('../src/application/usecase/budget/BudgetStatusService');
const { RegisterUserUseCase } = require('../src/application/usecase/auth/RegisterUserUseCase');
const { AuthenticateUserUseCase } = require('../src/application/usecase/auth/AuthenticateUserUseCase');
const { RegisterExpenseUseCase } = require('../src/application/usecase/expense/RegisterExpenseUseCase');
const { UpdateExpenseUseCase } = require('../src/application/usecase/expense/UpdateExpenseUseCase');
const { ListMonthlyExpensesUseCase } = require('../src/application/usecase/expense/ListMonthlyExpensesUseCase');
const { RemoveExpenseUseCase } = require('../src/application/usecase/expense/RemoveExpenseUseCase');
const { SetBudgetUseCase } = require('../src/application/usecase/budget/SetBudgetUseCase');
const { GenerateInsightsUseCase } = require('../src/application/usecase/insights/GenerateInsightsUseCase');
const { ChatWithAgentUseCase } = require('../src/application/usecase/chat/ChatWithAgentUseCase');
const { ExternalServiceError } = require('../src/application/usecase/shared/ExternalServiceError');

// Infraestrutura: Segurança, Mappers, Adapters e Gemini
const { PasswordHasher } = require('../src/infrastructure/security/auth/PasswordHasher');
const { JwtTokenService } = require('../src/infrastructure/security/auth/JwtTokenService');
const { GeminiClient } = require('../src/infrastructure/gemini/shared/GeminiClient');
const { GeminiFinancialAgentAdapter } = require('../src/infrastructure/gemini/chat/GeminiFinancialAgentAdapter');
const { UserPersistenceMapper } = require('../src/infrastructure/persistence/mapper/user/UserPersistenceMapper');
const { ExpensePersistenceMapper } = require('../src/infrastructure/persistence/mapper/expense/ExpensePersistenceMapper');
const { BudgetPersistenceMapper } = require('../src/infrastructure/persistence/mapper/budget/BudgetPersistenceMapper');
const { ChatMessagePersistenceMapper } = require('../src/infrastructure/persistence/mapper/chat/ChatMessagePersistenceMapper');

// API
const { createApp } = require('../src/api/createApp');

// Adaptadores em memória para testes de domínio e aplicação
class MemUsers extends UserRepository {
  constructor() { super(); this.list = []; this.seq = 1; }
  async save(u) { u.assignId(this.seq++); this.list.push(u); return u; }
  async findByEmail(email) { return this.list.find((u) => u.email === email) || null; }
  async findById(id) { return this.list.find((u) => u.id === Number(id)) || null; }
}
class MemExpenses extends ExpenseRepository {
  constructor() { super(); this.list = []; this.seq = 1; }
  async save(e) { e.assignId(this.seq++); this.list.push(e); return e; }
  async update(e) {
    const idx = this.list.findIndex((item) => item.id === e.id && item.userId === e.userId);
    if (idx >= 0) this.list[idx] = e;
    return e;
  }
  async findById(id, userId = null) {
    return this.list.find((e) => e.id === Number(id) && e.userId === userId) || null;
  }
  async findByMonth(ym, userId = null) {
    return this.list.filter((e) => e.month.value === ym.value && e.userId === userId);
  }
  async existsDuplicate(x) { return this.list.some((e) => e.isDuplicateOf(x)); }
  async remove(id, userId = null) {
    const n = this.list.length;
    this.list = this.list.filter((e) => !(e.id === Number(id) && e.userId === userId));
    return this.list.length < n;
  }
}
class MemBudgets extends BudgetRepository {
  constructor() { super(); this.map = {}; }
  _key(ymValue, userId) { return `${userId ?? 'anon'}:${ymValue}`; }
  async findByMonth(ym, userId = null) { return this.map[this._key(ym.value, userId)] || null; }
  async save(b) { this.map[this._key(b.month.value, b.userId)] = b; }
}
class MemChatMessages extends ChatMessageRepository {
  constructor() { super(); this.list = []; this.seq = 1; }
  async saveMessage(msg) {
    const entity = msg instanceof ChatMessage ? msg : ChatMessage.create(msg);
    entity.assignId(this.seq++);
    this.list.push(entity);
    return entity;
  }
  async listByUser(userId, limit = 50) {
    return this.list.filter((m) => m.userId === userId).slice(-limit);
  }
  async clearByUser(userId) {
    this.list = this.list.filter((m) => m.userId !== userId);
  }
}

const classifierOf = (fn) => Object.assign(new CategoryClassifierPort(), { classify: fn });
const setup = (classify = async () => Category.of(CategoryEnum.ALIMENTACAO)) => {
  const expenses = new MemExpenses();
  const budgets = new MemBudgets();
  const budgetStatus = new BudgetStatusService({ expenses, budgets });
  const classifier = classifierOf(classify);
  return {
    expenses,
    budgets,
    budgetStatus,
    register: new RegisterExpenseUseCase({ expenses, classifier, budgetStatus }),
    update: new UpdateExpenseUseCase({ expenses, classifier, budgetStatus }),
    listMonthly: new ListMonthlyExpensesUseCase({ expenses, budgetStatus }),
    remove: new RemoveExpenseUseCase({ expenses }),
    setBudget: new SetBudgetUseCase({ budgets, budgetStatus }),
  };
};

test('Expense.create junta todos os erros de validação', () => {
  assert.throws(
    () => Expense.create({ description: 'a', amount: -1, date: '2099-01-01' }),
    (e) => e instanceof ValidationError && e.errors.length === 3
  );
});

test('Expense.create aceita gasto válido com notes e usa a data local de hoje por padrão', () => {
  const e = Expense.create({
    userId: 1,
    description: '  Uber  ',
    amount: '25,5'.replace(',', '.'),
    notes: '  Corrida para a faculdade  ',
  });
  assert.strictEqual(e.userId, 1);
  assert.strictEqual(e.description, 'Uber');
  assert.strictEqual(e.amount.value, 25.5);
  assert.strictEqual(e.notes, 'Corrida para a faculdade');
  assert.ok(e.needsCategory);
});

test('Budget.evaluate: usa BudgetStatusEnum (ok, alerta, excedido, sem_orcamento)', () => {
  const b = Budget.define('2026-10', 100, 1);
  assert.strictEqual(b.evaluate(50).status, BudgetStatusEnum.OK);
  assert.strictEqual(b.evaluate(80).status, BudgetStatusEnum.ALERTA);
  assert.strictEqual(b.evaluate(100).status, BudgetStatusEnum.ALERTA);
  assert.strictEqual(b.evaluate(100.01).status, BudgetStatusEnum.EXCEDIDO);
  assert.strictEqual(Budget.none(10).status, BudgetStatusEnum.SEM_ORCAMENTO);
});

test('PersistenceMappers convertem corretamente entre entidades de Domínio e de Persistência', () => {
  const user = User.create({ name: 'Mario', email: Email.of('Mario@Teste.com').value, passwordHash: 'salt:hash' });
  user.assignId(10);
  const pUser = UserPersistenceMapper.toPersistence(user);
  assert.strictEqual(pUser.password_hash, 'salt:hash');
  const dUser = UserPersistenceMapper.toDomain(pUser);
  assert.strictEqual(dUser.email, 'mario@teste.com');

  const exp = Expense.create({ userId: 10, description: 'Café', amount: 12.5, category: 'Alimentação', notes: 'Expresso' });
  exp.assignId(55);
  const pExp = ExpensePersistenceMapper.toPersistence(exp);
  assert.strictEqual(pExp.user_id, 10);
  const dExp = ExpensePersistenceMapper.toDomain(pExp);
  assert.strictEqual(dExp.notes, 'Expresso');

  const bud = Budget.define('2026-10', 2000, 10);
  const pBud = BudgetPersistenceMapper.toPersistence(bud);
  assert.strictEqual(pBud.limit_amount, 2000);
  const dBud = BudgetPersistenceMapper.toDomain(pBud);
  assert.strictEqual(dBud.limit.value, 2000);

  const msg = ChatMessage.create({ userId: 10, role: ChatRoleEnum.USER, content: 'Olá agente' });
  msg.assignId(1);
  const pMsg = ChatMessagePersistenceMapper.toPersistence(msg);
  const dMsg = ChatMessagePersistenceMapper.toDomain(pMsg);
  assert.strictEqual(dMsg.content, 'Olá agente');
});

test('RegisterExpenseUseCase categoriza com a IA, rejeita duplicado por usuário e informa orçamento', async () => {
  const { register, budgets } = setup();
  await budgets.save(Budget.define(YearMonth.current().value, 100, 1));
  const r = await register.execute({ userId: 1, description: 'Almoço', amount: 85, notes: 'Restaurante universitário' });
  assert.strictEqual(r.aiCategorized, true);
  assert.strictEqual(r.expense.category, 'Alimentação');
  assert.strictEqual(r.expense.notes, 'Restaurante universitário');
  assert.strictEqual(r.budget.status, 'alerta');

  await assert.rejects(register.execute({ userId: 1, description: 'almoço', amount: 85 }), DuplicateExpenseError);

  const rUser2 = await register.execute({ userId: 2, description: 'almoço', amount: 85 });
  assert.strictEqual(rUser2.expense.userId, 2);
});

test('UpdateExpenseUseCase atualiza valor e notes sem conflitar consigo mesmo', async () => {
  const { register, update } = setup();
  const created = await register.execute({ userId: 1, description: 'Mercado', amount: 120, category: 'Alimentação' });
  const updated = await update.execute({
    id: created.expense.id,
    userId: 1,
    amount: 145.5,
    notes: 'Compras da semana + frutas',
  });
  assert.strictEqual(updated.expense.amount, 145.5);
  assert.strictEqual(updated.expense.notes, 'Compras da semana + frutas');
  assert.strictEqual(updated.aiCategorized, false);
});

test('RegisterExpenseUseCase não chama a IA se a categoria foi informada', async () => {
  const { register } = setup(async () => { throw new Error('não deveria chamar'); });
  const r = await register.execute({ description: 'Cinema', amount: 30, category: 'Lazer' });
  assert.strictEqual(r.aiCategorized, false);
});

test('RegisterExpenseUseCase usa "Outros" quando a IA falha', async () => {
  const { register } = setup(async () => { throw new Error('Gemini fora do ar'); });
  const r = await register.execute({ description: 'Coisa qualquer', amount: 10 });
  assert.strictEqual(r.expense.category, 'Outros');
});

test('RemoveExpenseUseCase lança erro quando o gasto não existe ou pertence a outro usuário', async () => {
  const { register, remove } = setup();
  const { expense } = await register.execute({ userId: 1, description: 'Café', amount: 8, category: 'Alimentação' });
  await assert.rejects(remove.execute({ id: expense.id, userId: 2 }), ExpenseNotFoundError);
  await remove.execute({ id: expense.id, userId: 1 });
  await assert.rejects(remove.execute({ id: expense.id, userId: 1 }), ExpenseNotFoundError);
});

test('GenerateInsightsUseCase exige 3 gastos e traduz falha da IA', async () => {
  const { expenses, budgets, register } = setup();
  const generator = Object.assign(new InsightsGeneratorPort(), { generate: async () => { throw new Error('boom'); } });
  const useCase = new GenerateInsightsUseCase({ expenses, budgets, generator });
  await assert.rejects(useCase.execute({ userId: 1 }), InsightsNotAvailableError);
  for (const [d, a] of [['Almoço', 20], ['Jantar', 30], ['Lanche', 10]]) {
    await register.execute({ userId: 1, description: d, amount: a });
  }
  await assert.rejects(useCase.execute({ userId: 1 }), ExternalServiceError);
});

test('RegisterUserUseCase e AuthenticateUserUseCase: cria usuário, valida hash de senha e emite JWT válido', async () => {
  const users = new MemUsers();
  const passwordHasher = new PasswordHasher();
  const tokenService = new JwtTokenService({ secret: 'test-secret', expiresInHours: 24 });
  const registerUser = new RegisterUserUseCase({ users, passwordHasher, tokenService });
  const authenticateUser = new AuthenticateUserUseCase({ users, passwordHasher, tokenService });

  const reg = await registerUser.execute({
    name: 'Mario Silva',
    email: 'Mario@Faculdade.edu.br',
    password: 'senhaSegura123',
  });
  assert.strictEqual(reg.user.id, 1);
  assert.strictEqual(reg.user.email, 'mario@faculdade.edu.br');
  assert.strictEqual(reg.user.passwordHash, undefined);

  const decoded = tokenService.verify(reg.token);
  assert.strictEqual(decoded.id, 1);
  assert.strictEqual(decoded.name, 'Mario Silva');

  await assert.rejects(
    registerUser.execute({ name: 'Outro', email: 'mario@faculdade.edu.br', password: '123456' }),
    EmailAlreadyInUseError
  );

  const login = await authenticateUser.execute({ email: 'mario@faculdade.edu.br', password: 'senhaSegura123' });
  assert.strictEqual(login.user.id, 1);
  assert.ok(login.token);

  await assert.rejects(
    authenticateUser.execute({ email: 'mario@faculdade.edu.br', password: 'errada' }),
    InvalidCredentialsError
  );

  assert.throws(() => tokenService.verify(reg.token + 'x'), UnauthorizedError);
});

test('ChatWithAgentUseCase + GeminiFinancialAgentAdapter executa Function Calling', async () => {
  const { register, update, listMonthly, remove, setBudget, expenses, budgets } = setup();
  const chatMessages = new MemChatMessages();
  const generator = Object.assign(new InsightsGeneratorPort(), {
    generate: async () => ({ summary: 'Tudo sob controle', attentionPoint: 'Alimentação', tips: ['Cozinhe em casa'] }),
  });
  const generateInsights = new GenerateInsightsUseCase({ expenses, budgets, generator });

  let callStep = 0;
  const fakeGeminiClient = {
    generateContent: async () => {
      callStep++;
      if (callStep === 1) {
        return {
          parts: [
            {
              functionCall: {
                name: 'register_expense',
                args: {
                  description: 'Almoço executivo',
                  amount: 42.9,
                  notes: 'Almoço com o grupo do projeto de IA',
                },
              },
            },
            {
              functionCall: {
                name: 'set_monthly_budget',
                args: {
                  month: YearMonth.current().value,
                  limit: 1500,
                },
              },
            },
          ],
        };
      }
      return {
        parts: [
          {
            text: 'Registrei seu almoço de R$ 42,90 (com a anotação do projeto de IA) e defini seu orçamento mensal para R$ 1.500,00!',
          },
        ],
      };
    },
  };

  const agent = new GeminiFinancialAgentAdapter(fakeGeminiClient);
  const chatWithAgent = new ChatWithAgentUseCase({
    chatMessages,
    agent,
    registerExpense: register,
    updateExpense: update,
    removeExpense: remove,
    listMonthlyExpenses: listMonthly,
    setBudget,
    generateInsights,
  });

  const user = { id: 7, name: 'Mario', email: 'mario@teste.com' };
  const out = await chatWithAgent.execute({
    user,
    message: 'Gastei 42,90 no almoço executivo com o grupo do projeto de IA e quero definir meu orçamento deste mês em 1500',
  });

  assert.ok(out.reply.includes('42,90'));
  assert.strictEqual(out.actions.length, 3);
  assert.strictEqual(out.actions[0].type, 'expense_registered');
  assert.strictEqual(out.actions[0].expense.notes, 'Almoço com o grupo do projeto de IA');
  assert.strictEqual(out.actions[1].type, 'budget_updated');
  assert.strictEqual(out.actions[1].budget.limit, 1500);
  assert.strictEqual(out.actions[2].type, 'model_info');

  const history = await chatWithAgent.listHistory({ userId: 7 });
  assert.strictEqual(history.length, 2);
  assert.strictEqual(history[0].role, 'user');
  assert.strictEqual(history[1].role, 'model');
});

test('GeminiModelEnum e GeminiClient: seleciona modelo do frontend e aplica fallback automático quando o modelo principal falha', async () => {
  const chain38 = GeminiModelEnum.buildFallbackChain('gemini-3.8-flash');
  assert.deepStrictEqual(chain38, [
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
  ]);

  const chain36 = GeminiModelEnum.buildFallbackChain('gemini-3.6-flash');
  assert.deepStrictEqual(chain36, [
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
  ]);

  const triedModels = [];
  const client = new GeminiClient({ apiKey: 'fake-key' });
  client._postToModel = async (model) => {
    triedModels.push(model);
    if (model === 'gemini-3.8-flash') {
      throw new Error('Gemini (gemini-3.8-flash) respondeu 429: Resource exhausted');
    }
    return {
      candidates: [
        {
          content: {
            parts: [{ text: 'Respondido com sucesso pelo modelo de fallback!' }],
          },
        },
      ],
    };
  };

  const result = await client.generateContent({
    contents: [{ role: 'user', parts: [{ text: 'Olá' }] }],
    model: 'gemini-3.8-flash',
  });

  assert.deepStrictEqual(triedModels, ['gemini-3.8-flash', 'gemini-3.6-flash']);
  assert.strictEqual(result.requestedModel, 'gemini-3.8-flash');
  assert.strictEqual(result.modelUsed, 'gemini-3.6-flash');
  assert.strictEqual(result.fallbackUsed, true);
  assert.strictEqual(result.parts[0].text, 'Respondido com sucesso pelo modelo de fallback!');
});

test('HTTP createApp: Controllers + DTOs + Middlewares integrados', async () => {
  const { register, update, listMonthly, remove, setBudget, expenses, budgets } = setup();
  const users = new MemUsers();
  const chatMessages = new MemChatMessages();
  const passwordHasher = new PasswordHasher();
  const tokenService = new JwtTokenService({ secret: 'http-test-secret' });
  const registerUser = new RegisterUserUseCase({ users, passwordHasher, tokenService });
  const authenticateUser = new AuthenticateUserUseCase({ users, passwordHasher, tokenService });
  const generator = Object.assign(new InsightsGeneratorPort(), {
    generate: async () => ({ summary: 'Ok', attentionPoint: 'Nada', tips: ['Economize'] }),
  });
  const generateInsights = new GenerateInsightsUseCase({ expenses, budgets, generator });

  const fakeAgent = {
    chat: async ({ tools, model }) => {
      await tools.register_expense({ description: 'Lanche via Chat', amount: 22.5, notes: 'Pedido no iFood' });
      return {
        reply: 'Anotei o lanche de R$ 22,50!',
        modelUsed: 'gemini-3.6-flash',
        requestedModel: model,
        fallbackUsed: model !== 'gemini-3.6-flash',
      };
    },
  };
  const chatWithAgent = new ChatWithAgentUseCase({
    chatMessages,
    agent: fakeAgent,
    registerExpense: register,
    updateExpense: update,
    removeExpense: remove,
    listMonthlyExpenses: listMonthly,
    setBudget,
    generateInsights,
  });

  const app = createApp({
    tokenService,
    registerUser,
    authenticateUser,
    registerExpense: register,
    updateExpense: update,
    listMonthlyExpenses: listMonthly,
    removeExpense: remove,
    setBudget,
    generateInsights,
    chatWithAgent,
  });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const modelsRes = await fetch(`${baseUrl}/chat/models`);
    assert.strictEqual(modelsRes.status, 200);
    const modelsData = await modelsRes.json();
    assert.strictEqual(modelsData.defaultModel, 'gemini-3.8-flash');
    assert.ok(Array.isArray(modelsData.models) && modelsData.models.length === 4);

    const unauthRes = await fetch(`${baseUrl}/expenses`);
    assert.strictEqual(unauthRes.status, 401);

    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mario', email: 'mario@ia.com', password: '123456' }),
    });
    assert.strictEqual(regRes.status, 201);
    const { token } = await regRes.json();
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Gemini-Model': 'gemini-3.8-flash',
    };

    const expRes = await fetch(`${baseUrl}/expenses`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ description: 'Livro de IA', amount: 89.9, category: 'Educação', notes: 'Capítulos 1 a 5' }),
    });
    assert.strictEqual(expRes.status, 201);
    const createdExp = await expRes.json();
    assert.strictEqual(createdExp.expense.notes, 'Capítulos 1 a 5');

    const putRes = await fetch(`${baseUrl}/expenses/${createdExp.expense.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ notes: 'Livro completo de IA Moderna' }),
    });
    assert.strictEqual(putRes.status, 200);
    const updatedExp = await putRes.json();
    assert.strictEqual(updatedExp.expense.notes, 'Livro completo de IA Moderna');

    const chatRes = await fetch(`${baseUrl}/chat/messages`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ message: 'Gastei 22,50 num lanche no iFood' }),
    });
    assert.strictEqual(chatRes.status, 200);
    const chatData = await chatRes.json();
    assert.strictEqual(chatData.actions.length, 2);
    assert.strictEqual(chatData.actions[0].type, 'expense_registered');
    assert.strictEqual(chatData.actions[1].type, 'model_info');
    assert.strictEqual(chatData.requestedModel, 'gemini-3.8-flash');
    assert.strictEqual(chatData.modelUsed, 'gemini-3.6-flash');
    assert.strictEqual(chatData.fallbackUsed, true);

    const listRes = await fetch(`${baseUrl}/expenses`, { headers: authHeaders });
    const listData = await listRes.json();
    assert.strictEqual(listData.expenses.length, 2);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
