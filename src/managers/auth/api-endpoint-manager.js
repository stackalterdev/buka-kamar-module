'use strict'

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");
var i18n = require('dl-i18n');
var DLModels = require('buka-kamar-model');
var map = DLModels.map;
var ApiEndpoint = DLModels.auth.ApiEndpoint;
var BaseManager = require('module-toolkit').BaseManager;

module.exports = class ApiEndpointManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.auth.collection.ApiEndpoint);
        this.roleCollection = this.db.use(map.auth.collection.Role);
    }

    _createIndexes() {
        var dateIndex = {
            name: `ix_${map.auth.collection.ApiEndpoint}__updatedDate`,
            key: {
                _updatedDate: -1
            }
        };

        var nameIndex = {
            name: `ix_${map.auth.collection.ApiEndpoint}_name`,
            key: {
                name: 1
            },
            unique: true
        };

        return this.collection.createIndexes([dateIndex, nameIndex]);
    }

    _getQuery(paging) {
        var deleted = {
            _deleted: false
        };
        var query = paging.keyword ? {
            '$and': [deleted]
        } : deleted;

        if (paging.keyword) {
            var regex = new RegExp(paging.keyword, "i");
            var filterUri = {
                'uri': {
                    '$regex': regex
                }
            };
            var filterName = {
                'name': {
                    '$regex': regex
                }
            };
            var $or = {
                '$or': [filterName, filterUri]
            };

            query['$and'].push($or);
        }
        return query;
    }

    _validate(apiEndpoint) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = apiEndpoint;
            // 1. begin: Declare promises.
            var getDuplicateApiEndpoint = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                    name: valid.name
                }]
            });
            valid.roles = valid.roles instanceof Array ? valid.roles : [];
            var roleIds = valid.roles.map((r) => new ObjectId(r._id));
            var getRoles = this.roleCollection.find({
                _id: {
                    "$in": roleIds
                }
            }).toArray();
            // 2. begin: Validation.
            Promise.all([getDuplicateApiEndpoint, getRoles])
                .then(results => {
                    var _duplicateApiEndpoint = results[0];
                    var _roles = results[1];

                    if (!valid.name || valid.name == '')
                        errors["name"] = "Nama harus diisi";
                    else if (_duplicateApiEndpoint) {
                        errors["name"] = "Nama sudah ada";
                    }

                    if (!valid.method || valid.method == '')
                        errors["method"] = "Method Harus diisi";

                    if (!valid.uri || valid.uri == '')
                        errors["uri"] = "Uri Harus diisi";


                    var roleErrors = [];
                    for (var role of valid.roles) {
                        var roleError = {};
                        var _role = _roles.find((r) => {
                            return r._id.toString() === role._id.toString();
                        });

                        if (!_role) {
                            roleError["role"] = i18n.__("Role.isRequired:%s is required", i18n.__("Role._:Role")); //"Nama barang tidak boleh kosong";
                            roleError["roleId"] = i18n.__("Role.isRequired:%s is required", i18n.__("Role._:Role")); //"Nama barang tidak boleh kosong";
                        }
                        if (Object.getOwnPropertyNames(roleError).length > 0)
                            roleErrors.push(roleError);
                        else {
                            role = _role;
                        }
                    }
                    if (roleErrors.length > 0)
                        errors.roles = roleErrors;

                    // 2c. begin: check if data has any error, reject if it has.
                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('module-toolkit').ValidationError;
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new ApiEndpoint(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    registerMany(endpoints) {
        return this.collection.find({
                name: {
                    "$in": endpoints.map((endpoint) => endpoint.name)
                }
            }).toArray()
            .then((dbEndpoints) => {
                dbEndpoints.forEach((endpoint) => {
                    var delta = endpoints.find((item) => item.name === endpoint.name);
                    if (delta) {
                        endpoint.uri = delta.uri;
                        endpoint.method = delta.method;
                    }
                });
                return Promise.resolve(dbEndpoints);
            })
            .then((dbEndpoints) => {
                var existingNames = dbEndpoints.map((dbEndpoint) => dbEndpoint.name);
                var newEndpoints = endpoints.filter((endpoint) => existingNames.indexOf(endpoint.name) < 0);

                var createPromises = newEndpoints.map((dbEndpoint) => this.create(dbEndpoint));
                var updatePromises = dbEndpoints.map((dbEndpoint) => this.update(dbEndpoint));
                return Promise.all(createPromises.concat(updatePromises));
            });
    }
};
