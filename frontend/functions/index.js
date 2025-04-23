const functions = require('firebase-functions');
const next = require('next');

const app = next({ dev: false });
const handle = app.getRequestHandler();

exports.nextServer = functions.https.onRequest((req, res) => {
  return app.prepare().then(() => handle(req, res));
});
