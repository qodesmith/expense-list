const ObjectID = require('mongodb').ObjectID; // https://goo.gl/gLafzb
const mongo = require('./utilities/mongo');
const { noConnect } = require('./utilities/handleErrors');

/*
  Expense
  -------
  {
    name: 'Car Insurance',
    amount: '129.45'
  }
*/

async function post(req, res) {
  const [dbErr, db] = await mongo();
  if (dbErr) return noConnect(res, dbErr);

  const inserted = await db.collection('expenses').insertOne(req.body);
  db.close();

  // https://goo.gl/VzrB13
  if (inserted.result.ok !== 1) return res.status(500).json({ inserted });
  res.json(inserted.ops[0]);
}

async function put(req, res) {
  const id = new ObjectID(req.params.id); // https://goo.gl/gLafzb
  const [dbErr, db] = await mongo();
  if (dbErr) return noConnect(res, dbErr);

  const filter = { _id: id };
  const update = { $set: req.body };
  const updated = await db.collection('expenses').updateOne(filter, update);
  db.close();

  // https://goo.gl/Mwb11F
  if (updated.result.ok !== 1) return res.status(500).json({ updated });
  res.json({ _id: id });
}

async function del(req, res) {
  const id = new ObjectID(req.params.id); // https://goo.gl/gLafzb
  const [dbErr, db] = await mongo();
  if (dbErr) return noConnect(res, dbErr);

  const deleted = await db.collection('expenses').deleteOne({ _id: id });
  db.close();

  // https://goo.gl/zJC3kb
  if (deleted.result.ok !== 1) return res.status(500).json({ deleted });
  res.json({ deleted: id });
}

module.exports = {
  post,
  put,
  del
};
