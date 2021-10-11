require("dotenv").config();
const budgetService = require("./budgetService")();
const _ = require("lodash");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Is not actual date but is just for testing purposes
const actual_date = DateTime.fromISO("2021-09-06");
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
})();
