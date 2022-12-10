const http = require('http');
const https = require('https');

module.exports.req = function req(opt, query, callback) {
    let body = '';
    const r = http.request(opt, res => {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            body += data;
            // callback(null, {data: data, header: res.headers});
        });

        res.on('end', () => {
            callback(null, {
                status: res.statusCode,
                statusMessage: res.statusMessage,
                data: body,
                header: res.headers,
            });
        });
    });

    r.on('error', err => {
        callback(err, null);
    });

    r.write(query);
    r.end();
};

module.exports.sreq = function sreq(opt, query, callback) {
    let body = '';
    const r = https.request(opt, res => {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            body += data;
            // callback(null, {data: data, header: res.headers});
        });

        res.on('end', () => {
            callback(null, {
                status: res.statusCode,
                statusMessage: res.statusMessage,
                data: body,
                header: res.headers,
            });
            // callback(null, {data: JSON.parse(body), header: res.headers});
        });
    });

    r.on('error', err => {
        callback(err, null);
    });

    r.write(query);
    r.end();
};

module.exports.isUpdateQuery = function isUpdateQuery(q) {
    return !!(
        q.toLowerCase().includes('insert') || q.toLowerCase().includes('delete')
    );
};

module.exports.toQueryParameter = function toQueryParameter(queryJSON) {
    return Object.keys(queryJSON)
        .map(k => `${k}=${encodeURIComponent(queryJSON[k])}`)
        .join('&');
};

const toBase64 = str => Buffer.from(str).toString('base64');
module.exports.authGraphDB = (user, pw) => `Basic ${toBase64(`${user}:${pw}`)}`;
