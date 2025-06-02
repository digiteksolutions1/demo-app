const db = require("../database/db");
const APIResponse = require("../utils/APIResponse");

const PriceController = {
  async getPrice(req, res) {
    try {
      const [fee] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 1;`
      );
      const [salesRange_ST] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 2 AND type = 'accounting_ST' ;`
      );
      const [salesRange_LTD] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 2 AND type = 'accounting_LTD' ;`
      );
      const [bookkeepingRange_ST] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 3 AND type = 'bookkeeping_ST';`
      );
      const [bookkeepingRange_LTD] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 3 AND type = 'bookkeeping_LTD';`
      );
      const [asset] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 4;`
      );
      const [VAT_range] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 5 AND type = 'VAT_range';`
      );
      const [VAT_frequency] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 5 AND type = 'frequency';`
      );
      const [payroll] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 6;`
      );
      const [pension] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 7;`
      );
      const [CIS] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 8 AND type = 'CIS';`
      );
      const [CIS_frequency] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 8 AND type = 'CIS_frequency';`
      );

      const [multi_Currency] = await db.query(
        `SELECT label_value as label, price FROM coffee.pricetable where category_id = 9;`
      );

      APIResponse.suceess(res, {
        salesRange_ST,
        salesRange_LTD,
        bookkeepingRange_ST,
        bookkeepingRange_LTD,
        asset,
        VAT_range,
        VAT_frequency,
        payroll,
        pension,
        CIS,
        CIS_frequency,
        multi_Currency,
      });
    } catch (err) {
      console.log("Error in Fetching");
      APIResponse.error(res, {}, "Error in fetching", 500);
    }
  },
};

module.exports = PriceController;
