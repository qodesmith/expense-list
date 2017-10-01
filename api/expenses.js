const mongo = require('./utilities/mongo');
const { noConnect, operationErr } = require('./utilities/handleErrors');

/*
  Always returns an array of data.
*/
async function expenses(req, res) {
  const [dbErr, db] = await mongo();
  if (dbErr) return noConnect(res, dbErr);

  const expenses = await db.collection('expenses')
    .find()
    .sort({ $natural: -1 }) // https://goo.gl/CkAQgd, https://goo.gl/yTmyrC - Last in, first out.
    .toArray();

  db.close();
  res.json(expenses);
}

module.exports = expenses;
