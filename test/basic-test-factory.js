var helper = require("./helper");
var should = require("should");

function getBasicTest(opt) {

    var options = opt || {};
    var Manager = options.manager;
    var Model = options.model;
    var dataUtil = options.util;
    var validate = options.validator;
    var createDuplicate = options.createDuplicate;
    var keys = options.keys;

    var manager;
    before("#00. connect db", function (done) {
        helper.getDb()
            .then((db) => {
                manager = new Manager(db, {
                    username: "unit-test"
                });
                done();
            })
            .catch(e => {
                done(e);
            });
    });
    // it("#01. should success when delete all exist data", function (done) {
    //     manager.read({ size: 100, keyword: "a" })
    //         .then(results => {
    //             if (results.data.length === 0) {
    //                 done();
    //             } else {
    //                 var destroyData = [];
    //                 for (var data of results.data) {
    //                     var des = manager.destroy(data._id);
    //                     destroyData.push(des);
    //                 }
    //                 if (destroyData.length === 0) {
    //                     done();
    //                 } else {
    //                     Promise.all(destroyData)
    //                         .then(data => {
    //                             data.should.be.instanceof(Array);
    //                             for (var a of data)
    //                                 a.should.equal(true);
    //                             done();
    //                         })
    //                         .catch(e => {
    //                             done(e);
    //                         });
    //                 }
    //             }
    //         })
    //         .catch(e => {
    //             done(e);
    //         });
    // });

    it("#01. should error when create with empty data", function (done) {
        manager.create({})
            .then((id) => {
                done("Should not be able to create with empty data");
            })
            .catch((e) => {
                try {
                    e.name.should.equal("ValidationError");
                    e.should.have.property("errors");
                    e.errors.should.instanceof(Object);
                    done();
                }
                catch (ex) {
                    done(e);
                }
            });
    });

    var createdId;
    it("#02. should success when create new data", function (done) {
        dataUtil.getNewData()
            .then((data) => manager.create(data))
            .then((id) => {
                id.should.be.Object();
                createdId = id;
                done();
            })
            .catch((e) => {
                done(e);
            });
    });

    var createdData;
    it(`#03. should success when get created data with id`, function (done) {
        manager.getSingleById(createdId)
            .then((data) => {
                data.should.instanceof(Object);
                validate(data);
                createdData = data;
                done();
            })
            .catch((e) => {
                done(e);
            });
    });

    it("#04. should error when create new data with same key(s)", function (done) {
        if (!createDuplicate || keys.length <= 0)
            this.skip();
        else {
            var data = Object.assign({}, createdData);
            delete data._id;

            manager.create(data)
                .then((id) => {
                    done("Should not be able to create data with same key(s)");
                })
                .catch((e) => {
                    try {
                        e.name.should.equal("ValidationError");
                        e.should.have.property("errors");
                        e.errors.should.instanceof(Object);
                        for (var key of keys) {
                            e.errors.should.have.property(key);
                        }
                        done();
                    }
                    catch (ex) {
                        done(e);
                    }
                });

        }
    });

    it(`#05. should success when update created data`, function (done) {
        manager.update(createdData)
            .then((id) => {
                createdId.toString().should.equal(id.toString());
                done();
            })
            .catch((e) => {
                done(e);
            });
    });

    it(`#06. should success when get updated data with id`, function (done) {
        manager.getSingleById(createdId)
            .then((data) => {
                validate(data);
                data._stamp.should.not.equal(createdData._stamp);
                done();
            })
            .catch((e) => {
                done(e);
            });
    });

    it("#07. should error when update new data with same key(s)", function (done) {
        if (keys.length <= 0)
            this.skip();
        else {
            var newDataId;
            dataUtil.getNewData()
                .then((data) => manager.create(data))
                .then((newId) => manager.getSingleById(newId))
                .then((newData) => {
                    newDataId = newData._id;
                    for (var key of keys) {
                        newData[key] = createdData[key];
                    }
                    return manager.update(newData);
                })
                .then((id) => {
                    done("Should not be able to update data with key(s)");
                })
                .catch((e) => {
                    try {
                        e.name.should.equal("ValidationError");
                        e.should.have.property("errors");
                        e.errors.should.instanceof(Object);
                        for (var key of keys) {
                            e.errors.should.have.property(key);
                        }
                        manager.destroy(newDataId)
                            .then(() => done());
                    }
                    catch (ex) {
                        done(e);
                    }
                });
        }
    });

    it("#08. should success when read data", function (done) {
        manager.read({
            filter: {
                _id: createdId
            }
        })
            .then((documents) => {
                //process documents
                documents.should.have.property("data");
                documents.data.should.be.instanceof(Array);
                documents.data.length.should.not.equal(0);
                done();
            })
            .catch((e) => {
                done(e);
            });
    });

    it(`#09. should success when delete data`, function (done) {
        manager.delete(createdData)
            .then((id) => {
                id.toString().should.equal(createdId.toString());
                done();
            })
            .catch((e) => {
                done(e);
            });
    });


    it(`#10. should _deleted=true`, function (done) {
        manager.getSingleByQuery({
            _id: createdId
        })
            .then((data) => {
                validate(data);
                data._deleted.should.be.Boolean();
                data._deleted.should.equal(true);
                done();
            })
            .catch((e) => {
                done(e);
            });
    });

    it("#11. should success when destroy data with id", function (done) {
        manager.destroy(createdId)
            .then((result) => {
                result.should.be.Boolean();
                result.should.equal(true);
                done();
            })
            .catch((e) => {
                done(e);
            });
    });

    it(`#12. should null when get destroyed data`, function (done) {
        manager.getSingleByIdOrDefault(createdId)
            .then((data) => {
                should.equal(data, null);
                done();
            })
            .catch((e) => {
                done(e);
            });
    });


}
module.exports = getBasicTest;
