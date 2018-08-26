'use strict'

var ObjectId = require("mongodb").ObjectId;
require("mongodb-toolkit");
// var i18n = require('dl-i18n');
var DLModels = require('buka-kamar-model');
var map = DLModels.map;
var Role = DLModels.auth.Role;
var BaseManager = require('module-toolkit').BaseManager;
var AccountManager = require("./account-manager");

module.exports = class RoleManager extends BaseManager {
    constructor(db, user) {
        super(db, user);
        this.collection = this.db.use(map.auth.collection.Role);
        this.accountManager = new AccountManager(db, user);
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
            var filterCode = {
                'code': {
                    '$regex': regex
                }
            };
            var filterName = {
                'name': {
                    '$regex': regex
                }
            };
            var $or = {
                '$or': [filterCode, filterName]
            };

            query['$and'].push($or);
        }
        return query;
    }

    _afterUpdate(roleId) {
        return this.getSingleById(roleId)
            .then((role) => {
                return this.accountManager.collection.find({
                    roles: {
                        "$elemMatch": {
                            _id: roleId
                        }
                    }
                }).toArray()
                    .then((accounts) => {
                        var updateAccounts = accounts.map((account) => {
                            account.roles = account.roles || [];
                            var targetRole = account.roles.find((r) => r._id.toString() === role._id.toString());
                            var index = account.roles.indexOf(targetRole);
                            if (index >= 0) {
                                account.roles[index] = role;
                                account.password = "";
                                return this.accountManager.update(account);
                            }
                            else
                                return Promise.resolve(null);
                        })
                        return Promise.all(updateAccounts);
                    })
                    .then((updatedAccounts) => {
                        return Promise.resolve(roleId);
                    });
            });
    }

    _validate(role) {
        var errors = {};
        return new Promise((resolve, reject) => {
            var valid = role;
            // 1. begin: Declare promises.
            var getDuplicateRole = this.collection.singleOrDefault({
                "$and": [{
                    _id: {
                        '$ne': new ObjectId(valid._id)
                    }
                }, {
                        code: valid.code
                    }]
            });
            valid.permissions = valid.permissions instanceof Array ? valid.permissions : [];
            // var getUnits = valid.permissions.map((permission) => {
            //     return this.unitManager.getSingleByIdOrDefault(permission.unitId);
            // })
            // 2. begin: Validation.
            Promise.all([getDuplicateRole])
                .then(results => {
                    var _duplicateRole = results[0];

                    if (!valid.code || valid.code == '')
                        errors["code"] = "Kode harus diisi";
                    else if (_duplicateRole) {
                        errors["code"] = "Kode sudah ada";
                    }

                    if (!valid.name || valid.name == '')
                        errors["name"] = "Nama Harus diisi";


                    var permissionErrors = [];
                    for (var permission of valid.permissions) {
                        var permissionError = {};
                        // var unit = _units.find((u) => {
                        //     return u._id.toString() === permission.unitId.toString();
                        // });

                        // if (!unit) {
                        //     permissionError["unit"] = i18n.__("Role.units.unit.isRequired:%s is required", i18n.__("Role.units.unit._:Unit")); //"Nama barang tidak boleh kosong";
                        //     permissionError["unitId"] = i18n.__("Role.units.unitId.isRequired:%s is required", i18n.__("Role.units.unitId._:Unit Id")); //"Nama barang tidak boleh kosong";
                        // }
                        // if (Object.getOwnPropertyNames(permissionError).length > 0)
                        //     permissionErrors.push(permissionError);
                        // else {
                        //     permission.unit = unit;
                        //     permission.unitId = unit._id;
                        // }
                    }
                    if (permissionErrors.length > 0)
                        errors.permissions = permissionErrors;

                    // 2c. begin: check if data has any error, reject if it has.
                    if (Object.getOwnPropertyNames(errors).length > 0) {
                        var ValidationError = require('module-toolkit').ValidationError;
                        reject(new ValidationError('data does not pass validation', errors));
                    }

                    valid = new Role(valid);
                    valid.stamp(this.user.username, 'manager');
                    resolve(valid);
                })
                .catch(e => {
                    reject(e);
                })
        });
    }
}
