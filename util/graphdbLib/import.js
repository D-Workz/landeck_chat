const assign = require('assign-deep');

const { req, sreq } = require('./helper.js');

const defaultOptions = {
    method: 'POST',
    headers: {
        Accept: 'application/ld+json',
        'Content-Type': 'application/ld+json',
    },
};

class Import {
    constructor(options) {
        this.options = defaultOptions;
        this.options = assign(this.options, options);

        /* TODO: this is ugly, thus temporary */
        this.request = options.https ? sreq : req;
    }

    async text(body) {
        const that = this;
        return new Promise((resolve, reject) => {
            const modifiedOptions = {
                path: `/repositories/${that.options.repository}/statements`,
                headers: {
                    'X-GraphDB-Repository': that.options.repository,
                    'Content-Length': Buffer.byteLength(body),
                },
            };
            const opt = assign({}, that.options, modifiedOptions);

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

module.exports = Import;
