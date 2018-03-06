const ObjectID = require('mongodb').ObjectID; // https://goo.gl/gLafzb
const mongo = require('./utilities/mongo');
const { noConnect } = require('./utilities/handleErrors');

/*
  Budget
  ------
  {
    amount: '129.45'
  }
*/

async function get(req, res) {
  const [dbErr, db] = await mongo();
  if (dbErr) return noConnect(res, dbErr);

  const budget = await db.collection('budget').findOne({});

  db.close();
  res.json(budget);
}

async function put(req, res) {
  const [dbErr, db] = await mongo();
  if (dbErr) return noConnect(res, dbErr);

  const update = { $set: { amount: +req.body.amount }};
  const updated = await db.collection('budget').updateOne({}, update);
  db.close();

  // https://goo.gl/Mwb11F
  if (updated.result.ok !== 1) return res.status(500).json({ updated });
  res.json({ test: updated });
}

module.exports = { get, put };
