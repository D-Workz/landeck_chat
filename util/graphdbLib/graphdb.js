const assign = require("assign-deep");
const Query = require("./query.js");
const Import = require("./import.js");
const Transaction = require("./transaction.js");

const { req, sreq, authGraphDB } = require("./helper.js");

/*eslint-disable*/
module.exports.connect = async (obj, username, password) => {
  return new Promise(async (resolve, reject) => {
    /* assume that if user and password omitted then authorization is not required */
    if (username && password) {
      /* Authorization required */
      const query = JSON.stringify({
        username,
        password,
      });

      const options = {
        hostname: obj.host,
        path: "/rest/login",
        port: obj.port,
        method: "POST",
        headers: {
          Accept: "application/ld+json",
          "Content-Type": "application/ld+json",
          "Content-Length": Buffer.byteLength(query),
        },
      };

      /* TODO: this is ugly, thus temporary */
      const request = obj.https ? sreq : req;
      request(options, query, (err, data) => {
        /* TODO: this is ugly, thus temporary */
        if (parseInt(data.status, 10) > 299) {
          return reject(
            new Error(
              JSON.stringify({
                statusCode: data.status,
                statusMessage: data.statusMessage,
              })
            )
          );
        }

        if (err) {
          return reject(new Error(err));
        }

        let o = assign({}, obj, {
          headers: {
            // 'X-AUTH-TOKEN': data.header['x-auth-token']
            Authorization: authGraphDB(username, password),
          },
        });

        let conn = {
          Query: new Query(o),
          Import: new Import(o),
          Transaction: new Transaction(o),
        };
        return resolve(conn);
      });
    } else {
      /* without authorization */
      let conn = {
        Query: new Query(obj),
        Import: new Import(obj),
        Transaction: new Transaction(obj),
      };
      return resolve(conn);
    }
  });
};
/* eslint-enable */
