const assign = require('assign-deep');
const StatusCodeError = require('../StatusCodeError.js');


/**
 * checks if all needed parameters are available
 * @param req express request object
 * @param parameters
 * Object with query, body, params or headers as keys value should be an array of parameters.
 * per default all parameters are needed (AND). if you use a 'Or' suffix for the key you can make only one
 * of the parameters required.
 * Example:
 * {
 *     body: ['p1', 'p2'],
 *     queryOr: ['p3', 'p4']
 * }
 * means: p1 AND p2 required in the body, p3 OR p4 in the query.
 *
 * @returns {Promise<void>}
 */
module.exports.checkParams = async (req, parameters) => {
    const errors = [];

    Object.keys(parameters).forEach(parameterType => {
        if (parameterType.endsWith('Or')) {
            let here = false;

            parameters[parameterType].forEach(parameterName => {
                const type = parameterType.slice(0, -2);

                let obj;
                // convert object references with .
                if (parameterName.includes('.')) {
                    obj = parameterName
                        .split('.')
                        .reduce((o, i) => o[i], req[type]);
                } else {
                    obj = req[type][parameterName];
                }

                if (obj) {
                    here = true;
                }
            });

            if (!here) {
                errors.push(
                    `At least one of ${parameters[parameterType].join(
                        ', ',
                    )} in ${parameterType.slice(0, -2)}`,
                );
            }
        } else {
            parameters[parameterType].forEach(parameterName => {
                if (!req[parameterType][parameterName]) {
                    errors.push(`${parameterName} in ${parameterType}`);
                }
            });
        }
    });

    if (errors.length > 0) {
        throw new StatusCodeError(
            400,
            `missing parameter${errors.length > 1 ? 's' : ''}: ${errors.join(
                ', ',
            )}`,
        );
    }
};

/*
 * generic solution to this issue:
 *  - https://stackoverflow.com/questions/24054552/mongoose-not-saving-nested-object
 *
 * Nested object structures have to be declared as modified in order to be updated in mongodb.
 * This function updates a given mongodb object by using an object of similar structure.
 * Then it will declare every property that is an array/object as modified such.
 */
module.exports.assign = (modelObj, updateObj) => {
    const isArray = a => {
        return !!a && a.constructor === Array;
    };
    const isObject = a => {
        return !!a && a.constructor === Object;
    };

    const modelObject = assign(modelObj, updateObj);
    const props = Object.keys(modelObject._doc);
    props.forEach(prop => {
        if (
            isObject(modelObject._doc[prop]) ||
            isArray(modelObject._doc[prop])
        ) {
            modelObject.markModified(prop);
        }
    });
    return modelObject;
};


module.exports.rand = (min, max) => Math.floor(Math.random() * max) + min;
