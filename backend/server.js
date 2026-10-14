// Composition root: único lugar que conhece todas as camadas e liga as peças
const { PgConnection } = require('./src/infrastructure/persistence/connection/PgConnection');
const { UserPostgresRepository } = require('./src/infrastructure/persistence/repository/user/UserPostgresRepository');
const { ExpensePostgresRepository } = require('./src/infrastructure/persistence/repository/expense/ExpensePostgresRepository');
const { BudgetPostgresRepository } = require('./src/infrastructure/persistence/repository/budget/BudgetPostgresRepository');
const { ChatMessagePostgresRepository } = require('./src/infrastructure/persistence/repository/chat/ChatMessagePostgresRepository');
const { UserRepositoryAdapter } = require('./src/infrastructure/persistence/adapter/user/UserRepositoryAdapter');
const { ExpenseRepositoryAdapter } = require('./src/infrastructure/persistence/adapter/expense/ExpenseRepositoryAdapter');
const { BudgetRepositoryAdapter } = require('./src/infrastructure/persistence/adapter/budget/BudgetRepositoryAdapter');
const { ChatMessageRepositoryAdapter } = require('./src/infrastructure/persistence/adapter/chat/ChatMessageRepositoryAdapter');
const { PasswordHasher } = require('./src/infrastructure/security/auth/PasswordHasher');
const { JwtTokenService } = require('./src/infrastructure/security/auth/JwtTokenService');
const { GeminiClient } = require('./src/infrastructure/gemini/shared/GeminiClient');
const { GeminiCategoryClassifierAdapter } = require('./src/infrastructure/gemini/expense/GeminiCategoryClassifierAdapter');
const { GeminiInsightsGeneratorAdapter } = require('./src/infrastructure/gemini/insights/GeminiInsightsGeneratorAdapter');
const { GeminiFinancialAgentAdapter } = require('./src/infrastructure/gemini/chat/GeminiFinancialAgentAdapter');
const { BudgetStatusService } = require('./src/application/usecase/budget/BudgetStatusService');
const { RegisterUserUseCase } = require('./src/application/usecase/auth/RegisterUserUseCase');
const { AuthenticateUserUseCase } = require('./src/application/usecase/auth/AuthenticateUserUseCase');
const { RegisterExpenseUseCase } = require('./src/application/usecase/expense/RegisterExpenseUseCase');
const { UpdateExpenseUseCase } = require('./src/application/usecase/expense/UpdateExpenseUseCase');
const { ListMonthlyExpensesUseCase } = require('./src/application/usecase/expense/ListMonthlyExpensesUseCase');
const { RemoveExpenseUseCase } = require('./src/application/usecase/expense/RemoveExpenseUseCase');
const { SetBudgetUseCase } = require('./src/application/usecase/budget/SetBudgetUseCase');
const { GenerateInsightsUseCase } = require('./src/application/usecase/insights/GenerateInsightsUseCase');
const { ChatWithAgentUseCase } = require('./src/application/usecase/chat/ChatWithAgentUseCase');
const { createApp } = require('./src/api/createApp');

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('Erro: DATABASE_URL não definida no arquivo .env. Configure a conexão com o PostgreSQL.');
    process.exit(1);
  }

  const pg = new PgConnection(process.env.DATABASE_URL);
  await pg.initSchema();
  console.log('PostgreSQL conectado e tabelas verificadas com sucesso.');

  // Infraestrutura: Repositories SQL + Adapters de Domínio
  const users = new UserRepositoryAdapter(new UserPostgresRepository(pg));
  const expenses = new ExpenseRepositoryAdapter(new ExpensePostgresRepository(pg));
  const budgets = new BudgetRepositoryAdapter(new BudgetPostgresRepository(pg));
  const chatMessages = new ChatMessageRepositoryAdapter(new ChatMessagePostgresRepository(pg));

  // Infraestrutura: Segurança
  const passwordHasher = new PasswordHasher();
  const tokenService = new JwtTokenService({
    secret: process.env.JWT_SECRET || 'gastocerto-dev-secret-key',
    expiresInHours: Number(process.env.JWT_EXPIRES_IN_HOURS) || 168,
  });

  // Infraestrutura: Google Gemini Adapters (modelo selecionado pelo frontend + fallback automático)
  const gemini = new GeminiClient({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const classifier = new GeminiCategoryClassifierAdapter(gemini);
  const generator = new GeminiInsightsGeneratorAdapter(gemini);
  const agent = new GeminiFinancialAgentAdapter(gemini);

  // Aplicação: UseCases
  const budgetStatus = new BudgetStatusService({ expenses, budgets });
  const registerUser = new RegisterUserUseCase({ users, passwordHasher, tokenService });
  const authenticateUser = new AuthenticateUserUseCase({ users, passwordHasher, tokenService });
  const registerExpense = new RegisterExpenseUseCase({ expenses, classifier, budgetStatus });
  const updateExpense = new UpdateExpenseUseCase({ expenses, classifier, budgetStatus });
  const listMonthlyExpenses = new ListMonthlyExpensesUseCase({ expenses, budgetStatus });
  const removeExpense = new RemoveExpenseUseCase({ expenses });
  const setBudget = new SetBudgetUseCase({ budgets, budgetStatus });
  const generateInsights = new GenerateInsightsUseCase({ expenses, budgets, generator });

  const chatWithAgent = new ChatWithAgentUseCase({
    chatMessages,
    agent,
    registerExpense,
    updateExpense,
    removeExpense,
    listMonthlyExpenses,
    setBudget,
    generateInsights,
  });

  // API: Controllers + Middlewares
  const app = createApp({
    tokenService,
    registerUser,
    authenticateUser,
    registerExpense,
    updateExpense,
    listMonthlyExpenses,
    removeExpense,
    setBudget,
    generateInsights,
    chatWithAgent,
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => console.log(`GastoCerto API em http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
  process.exit(1);
});
