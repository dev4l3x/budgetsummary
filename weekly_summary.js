require("dotenv").config();
const { DateTime } = require("luxon");
const budgetService = require("./budgetService")();

// Is not actual date but is just for testing purposes
const actual_date = DateTime.fromISO("2021-09-06");

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

  const totalSaved =
    parseFloat(process.env.BUDGET_AMOUNT) - expensesUntilEndDate.total;

  console.log(JSON.stringify(expensesUntilEndDate));
})();
