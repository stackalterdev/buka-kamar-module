function _getDb() {
    var factory = require("mongo-factory");
    return factory.getConnection(process.env.DB_CONNECTIONSTRING);
}

module.exports = {
    getDb: _getDb,

    getManager: function (ManagerType) {
        return _getDb()
            .then(db => {
                return Promise.resolve(new ManagerType(db, {
                    username: "dev"
                }));
            })
    }
}