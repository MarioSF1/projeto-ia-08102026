const express = require('express');
const cors = require('cors');
const { AuthController } = require('./controller/auth/AuthController');
const { ExpenseController } = require('./controller/expense/ExpenseController');
const { BudgetController } = require('./controller/budget/BudgetController');
const { InsightsController } = require('./controller/insights/InsightsController');
const { ChatController } = require('./controller/chat/ChatController');
const { createAuthMiddleware } = require('./middleware/authMiddleware');
const { errorHandlerMiddleware } = require('./middleware/errorHandlerMiddleware');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function createApp({
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
}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const authController = new AuthController({ registerUser, authenticateUser });
  const expenseController = new ExpenseController({
    registerExpense,
    updateExpense,
    listMonthlyExpenses,
    removeExpense,
  });
  const budgetController = new BudgetController({ setBudget });
  const insightsController = new InsightsController({ generateInsights });
  const chatController = new ChatController({ chatWithAgent });

  const requireAuth = createAuthMiddleware(tokenService);

  // Rotas públicas
  app.get('/categories', (req, res) => expenseController.categories(req, res));
  if (registerUser) {
    app.post('/auth/register', wrap((req, res) => authController.register(req, res)));
  }
  if (authenticateUser) {
    app.post('/auth/login', wrap((req, res) => authController.login(req, res)));
  }

  // Rotas autenticadas
  app.get('/auth/me', requireAuth, (req, res) => authController.me(req, res));
  app.get('/expenses', requireAuth, wrap((req, res) => expenseController.list(req, res)));
  app.post('/expenses', requireAuth, wrap((req, res) => expenseController.create(req, res)));
  if (updateExpense) {
    app.put('/expenses/:id', requireAuth, wrap((req, res) => expenseController.update(req, res)));
  }
  app.delete('/expenses/:id', requireAuth, wrap((req, res) => expenseController.remove(req, res)));

  app.put('/budget', requireAuth, wrap((req, res) => budgetController.updateBudget(req, res)));
  app.get('/insights', requireAuth, wrap((req, res) => insightsController.generate(req, res)));

  app.get('/chat/models', (req, res) => chatController.listModels(req, res));

  if (chatWithAgent) {
    app.get('/chat/messages', requireAuth, wrap((req, res) => chatController.listMessages(req, res)));
    app.post('/chat/messages', requireAuth, wrap((req, res) => chatController.sendMessage(req, res)));
    app.delete('/chat/messages', requireAuth, wrap((req, res) => chatController.clearMessages(req, res)));
  }

  app.use(errorHandlerMiddleware);
  return app;
}

module.exports = { createApp };
