const querystring = require('querystring');
const assign = require('assign-deep');

const { req, sreq, isUpdateQuery, toQueryParameter } = require('./helper.js');

const getDefaultOptions = () => ({
    method: 'POST',
    headers: {
        Accept: 'application/json',
    },
});

class Transaction {
    constructor(options) {
        this.options = getDefaultOptions();
        this.options = assign(this.options, options);

        /* TODO: this is ugly, thus temporary */
        this.request = options.https ? sreq : req;
    }

    async begin() {
        const that = this;
        return new Promise((resolve, reject) => {
            const body = querystring.stringify({});

            const opt = assign({}, that.options, {
                path: `/repositories/${that.options.repository}/transactions`,
            });

            that.request(opt, body, (err, data) => {
                if (data) {
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

                    /* we're not provided the id itself so we have to extract it */
                    const t = data.header.location;
                    return resolve({
                        ...data,
                        id: t.substr(t.lastIndexOf('/') + 1),
                    });
                }
                return reject(new Error(err));
            });
        });
    }

    async rollback(transaction) {
        const that = this;
        return new Promise((resolve, reject) => {
            const body = querystring.stringify({});

            const opt = assign({}, that.options, {
                method: 'DELETE',
                path: `/repositories/${
                    that.options.repository
                }/transactions/${transaction}`,
            });

            that.request(opt, body, (err, data) => {
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
            });
        });
    }

    async query(transaction, parameters) {
        const that = this;
        return new Promise((resolve, reject) => {
            const body = querystring.stringify({});

            let queryJSON = null;

            if (isUpdateQuery(parameters.query)) {
                queryJSON = {
                    action: 'UPDATE',
                    update: parameters.query,
                };
            } else {
                queryJSON = {
                    action: parameters.action,
                    query: parameters.query,
                };
            }

            const query = toQueryParameter(queryJSON);

            const opt = assign({}, that.options, {
                method: 'PUT',
                path: `/repositories/${
                    that.options.repository
                }/transactions/${transaction}?${query}`,
            });

            that.request(opt, body, (err, data) => {
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
            });
        });
    }

    async text(transaction, parameters, b) {
        const that = this;
        return new Promise((resolve, reject) => {
            // let body = querystring.stringify(b);
            const body = b;

            const queryJSON = {
                action: 'ADD',
            };

            const query = toQueryParameter(queryJSON);

            const opt = assign({}, that.options, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/ld+json',
                },
                path: `/repositories/${
                    that.options.repository
                }/transactions/${transaction}?${query}`,
            });

            that.request(opt, body, (err, data) => {
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
            });
        });
    }

    async commit(transaction) {
        const that = this;
        return new Promise((resolve, reject) => {
            const body = querystring.stringify({});

            const queryJSON = {
                action: 'COMMIT',
            };
            const query = Object.keys(queryJSON)
                .map(k => `${k}=${encodeURIComponent(queryJSON[k])}`)
                .join('&');

            const opt = assign({}, that.options, {
                method: 'PUT',
                path: `/repositories/${
                    that.options.repository
                }/transactions/${transaction}?${query}`,
            });

            that.request(opt, body, (err, data) => {
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
            });
        });
    }
}

module.exports = Transaction;
