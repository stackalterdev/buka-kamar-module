const sql = {
    startConnection: function () {
        return Promise.resolve("Connection Started");
    },
    transaction: function () {
        return {
            begin: function (callback) {
                callback(null);
            },
            commit: function (callback) {
                callback();
            },
            rollback: function (callback) {
                callback();
            },
        };
    },
    transactionRequest: function (transaction) {
        return {
            query: function (query, callback) {
                callback(null, 'Success');
            },
        };
    },
    execute: function (sp) {
        return Promise.resolve(null);
    },
    multiple: false,
};

module.exports = sql;
