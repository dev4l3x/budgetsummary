const { Client } = require("@notionhq/client");
const _ = require("lodash");

module.exports = () => {
  const service = {};

  const notion = new Client({
    auth: process.env.NOTION_API_KEY,
  });

  service.getSummaryBetween = async (startDate, endDate) => {
    const essentialFilter = _getCheckboxFilter("No esencial", false);
    const noEssentialFilter = _getCheckboxFilter("No esencial", true);

    const essentialExpenses = await _getExpensesBetween(startDate, endDate, [
      essentialFilter,
    ]);
    const noEssentialExpenses = await _getExpensesBetween(startDate, endDate, [
      noEssentialFilter,
    ]);

    const essentialAmount = _getTotalAmountOfExpenses(essentialExpenses);
    const noEssentialAmount = _getTotalAmountOfExpenses(noEssentialExpenses);

    return {
      essential: _.round(essentialAmount, 2),
      noEssential: _.round(noEssentialAmount, 2),
      total: _.round(essentialAmount + noEssentialAmount, 2),
    };
  };

  service.getHighestExpensesBetween = async (startDate, endDate, count) => {
    const quantitySort = _getSortFilterBy("Cantidad", false);
    const expenses = await _getExpensesBetween(
      startDate,
      endDate,
      [],
      [quantitySort]
    );

    const highestExpenses = _.take(expenses, count);

    const formattedExpenses = highestExpenses.map((expense) => {
      return {
        title: expense.properties.Gasto.title[0].plain_text,
        amount: expense.properties.Cantidad.number,
      };
    });

    return formattedExpenses;
  };

  async function _getExpensesBetween(
    startDate,
    endDate,
    additionalFilters,
    sorts
  ) {
    const list = await notion.databases.query({
      database_id: process.env.NDB_EXPENSES,
      filter: {
        and: [
          {
            property: "Fecha",
            date: {
              on_or_after: startDate.toISODate(),
            },
          },
          {
            property: "Fecha",
            date: {
              on_or_before: endDate.toISODate(),
            },
          },
          ...additionalFilters,
        ],
      },
      sorts: sorts,
    });
    return list.results;
  }

  function _getSortFilterBy(propertyName, ascending = true) {
    return {
      property: propertyName,
      direction: ascending ? "ascending" : "descending",
    };
  }

  function _getTotalAmountOfExpenses(expenses) {
    return expenses.reduce((total_amount, current) => {
      return total_amount + current.properties.Cantidad.number;
    }, 0);
  }

  function _getCheckboxFilter(propertyName, filterValue) {
    return {
      property: propertyName,
      checkbox: {
        equals: filterValue,
      },
    };
  }

  return service;
};
