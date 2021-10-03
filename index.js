require("dotenv").config();
const { Client } = require("@notionhq/client");
const { DateTime } = require("luxon");

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Is not actual date but is just for testing purposes
const actual_month = DateTime.fromISO("2021-09-01");

const start_date = DateTime.fromObject({
  day: 1,
  month: actual_month.month,
  year: actual_month.year,
});

const end_date = DateTime.fromObject({
  day: 1,
  month: actual_month.month + 1,
  year: actual_month.year,
});

function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

(async () => {
  const list = await notion.databases.query({
    database_id: process.env.NDB_EXPENSES,
    filter: {
      and: [
        {
          property: "Fecha",
          date: {
            on_or_after: start_date.toISO(),
          },
        },
        {
          property: "Fecha",
          date: {
            before: end_date.toISO(),
          },
        },
      ],
    },
  });

  const amount = list.results.reduce((total_amount, current) => {
    return total_amount + current.properties.Cantidad.number;
  }, 0);

  console.log(`Your total expenses are: ${amount}`);
})();
