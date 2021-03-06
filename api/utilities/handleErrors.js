const mongo = require('./mongo');
const isDev = process.env.NODE_ENV === 'development';

/*
  Returns a date string local to NY - '9/14/2017, 2:36:31 PM'
  https://goo.gl/SkVvba
*/
const localDate = () => new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

/*
  This function is used to create error objects that will be stored in MongoDB.
  The idea is that there will be an admin-only section on the front end
  that will display this error data in a meaningful way.
*/
const createError = (type = 'unknown', err = {}) => {
  const error = JSON.parse(JSON.stringify(err));
  return {
    type,
    ...error,
    date: localDate()
  };
};

// A helper function that saves errors to the database.
async function saveErrorToDb(err) {
  if (isDev) return console.log('ERROR CREATED FOR DB:', err);

  const [dbErr, db] = await mongo();
  if (dbErr) return;
  await db.collection('errors').insertOne(err);
  db.close();
}

// Inserts, saves, etc. error's are handled with this function.
function operationErr(err, operation, collection, req) {
  const error = createError('db operation', err);
  const newError = {
    operation,
    collection,
    url: req.originalUrl,
    ...error
  };

  saveErrorToDb(newError);
}

// Errors happening from the session store which uses MongoDB.
function sessionStoreErr(err) {
  const error = createError('session store', err);
  saveErrorToDb(error);
}

// Called when a user tries to make ajax requests to non-existent endpoints / routes.
function naughtyAjax(req) {
  const error = createError('naughty ajax', {
    url: req.originalUrl,
    method: req.method
  });

  saveErrorToDb(error);
}

// When Mongo can't connect.
function noConnect(res, err) {
  const error = createError('no connect', err);
  res.status(500).send({ error });
}

module.exports = {
  operationErr,
  sessionStoreErr,
  naughtyAjax,
  noConnect
};
