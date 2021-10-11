require("dotenv").config();
const { DateTime } = require("luxon");
const budgetService = require("./budgetService")();
const emailSender = require("./emailSender")();
const pug = require("pug");
const _ = require("lodash");

// Is not actual date but is just for testing purposes
const actual_date = DateTime.now();

const previous_week = actual_date.minus({ days: 7 });

const start_previous_week = previous_week.startOf("week");
const end_previous_week = previous_week.endOf("week");

(async () => {
  const summary = await budgetService.getSummaryBetween(
    start_previous_week,
    end_previous_week
  );

  const topFiveExpenses = await budgetService.getHighestExpensesBetween(
    start_previous_week,
    end_previous_week,
    5
  );

  const startOfMonth = end_previous_week.startOf("month");

  const expensesUntilEndDate = await budgetService.getSummaryBetween(
    startOfMonth,
    end_previous_week
  );

  const leftBudget =
    parseFloat(process.env.BUDGET_AMOUNT) - expensesUntilEndDate.total;

  const generateHtml = pug.compileFile("weeklySummaryTemplate.pug");

  const body = generateHtml({
    startDate: start_previous_week.toFormat("d LLL"),
    endDate: end_previous_week.toFormat("d LLL"),
    weeklySummary: summary,
    topExpenses: topFiveExpenses,
    expentUntilEnd: expensesUntilEndDate.total,
    budget: process.env.BUDGET_AMOUNT,
    leftBudget: _.round(leftBudget, 2),
    currentMonth: end_previous_week.toFormat("LLLL"),
    moneyUnit: process.env.MONEY_UNIT,
  });

  const result = await emailSender.sendEmail(
    process.env.DESTINATION_EMAIL,
    "Budget weekly summary",
    body
  );

  console.log(JSON.stringify(expensesUntilEndDate));
})();
