require("dotenv").config();
const budgetService = require("./budgetService")();
const _ = require("lodash");
const pug = require("pug");
const { DateTime } = require("luxon");
const emailSender = require("./emailSender")();

const actual_date = DateTime.now();
const previousMonth = actual_date.minus({ months: 1 });

const start_date = previousMonth.startOf("month");
const end_date = previousMonth.endOf("month");

(async () => {
  const expenses = await budgetService.getSummaryBetween(start_date, end_date);
  const topFive = await budgetService.getHighestExpensesBetween(
    start_date,
    end_date,
    5
  );

  const totalSaved = _.round(
    parseFloat(process.env.BUDGET_AMOUNT) - expenses.total,
    2
  );

  const templateData = {
    month: start_date.toFormat("LLLL"),
    summary: expenses,
    topExpenses: topFive,
    moneyUnit: process.env.MONEY_UNIT,
    budget: process.env.BUDGET_AMOUNT,
    total_saved: totalSaved,
  };

  const generateHtml = pug.compileFile("monthlySummaryTemplate.pug");

  const body = generateHtml(templateData);

  await emailSender.sendEmail(
    process.env.DESTINATION_EMAIL,
    "Budget monthly summary",
    body
  );
})();
