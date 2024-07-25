const { BadRequestError } = require("../expressError");

/** The function using this can us it to make the SET clause of an Update statement.
 *
 * @param dataToUpdate {object} {key1: updatedValue, key2: updatedValue...}
 *
 * returns {object} {setCols, datatoUpdate}
 *
 * {firstName: "Ross", lastName: "Cummings"} => {setCols: "first_name"=$1, "last_name"=$2, values: ["Ross", "Cummings"]}
 *
 *  */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Ross', lastName: "Cummings"} => ['"first_name"=$1', '"last_name"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
