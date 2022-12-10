const querystring = require('querystring');
const assign = require('assign-deep');

const { req, sreq, isUpdateQuery } = require('./helper.js');

const defaultOptions = {
    method: 'POST',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
    },
};

class Query {
    constructor(options) {
        this.options = defaultOptions;
        this.options = assign(this.options, options);

        /* TODO: this is ugly, thus temporary */
        this.request = options.https ? sreq : req;
    }

    async query(q, qOptions = {}) {
        const that = this;
        return new Promise((resolve, reject) => {
            let query;
            const modifiedOptions = {
                headers: {},
            };

            /* TODO: add other manipulating queries since they also use the update key */
            if (isUpdateQuery(q)) {
                query = querystring.stringify({
                    update: q,
                    ...qOptions
                });
                modifiedOptions.path = `/repositories/${
                    that.options.repository
                }/statements`;
                modifiedOptions.headers.Accept = 'text/plain';
            } else {

                query = querystring.stringify({
                    query: q,
                    ...qOptions
                });
                modifiedOptions.path = `/repositories/${
                    that.options.repository
                }`;
                modifiedOptions.headers.Accept = 'application/json';
            }
            modifiedOptions['Content-Length'] = Buffer.byteLength(query);

            that.request(
                assign({}, that.options, modifiedOptions),
                query,
                (err, data) => {
                    /* TODO: this is ugly, thus temporary */
                    if (parseInt(data.status, 10) > 299) {
                        return reject(
                            new Error(
                                JSON.stringify({
                                    statusCode: data.status,
                                    statusMessage: data.statusMessage,
                                }),
                            ),
                        );
                    }

                    if (data) return resolve({ data });
                    return reject(new Error(err));
                },
            );
        });
    }
}

module.exports = Query;
