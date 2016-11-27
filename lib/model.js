'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var AsyncStorage = require('react-native').AsyncStorage;
var Util = require('./util.js');
var Filter = require('./filter.js');

class Model {

    constructor(modelName, dbName) {
        this.dbName = dbName;
        this.modelName = modelName;
        this.offset = 0;
        this.limit = 10;
        this.modelFilter = new Filter();
    }

    createDatabase() {
        var _this = this;

        return _asyncToGenerator(function* () {
            yield AsyncStorage.setItem(_this.dbName, JSON.stringify({}));
            return _this.getDatabase();
        })();
    }

    getDatabase() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            var database = yield AsyncStorage.getItem(_this2.dbName);
            if (database) {
                return Object.assign({}, JSON.parse(database));
            } else {
                return _this2.createDatabase();
            }
        })();
    }

    initModel() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            _this3.database = yield _this3.getDatabase();
            _this3.model = _this3.database[_this3.modelName] ? _this3.database[_this3.modelName] : {
                'totalrows': 0,
                'autoinc': 1,
                'rows': {}
            };
            _this3.database[_this3.modelName] = _this3.database[_this3.modelName] || _this3.model;
        })();
    }

    //destroy
    destroy() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            var database = yield AsyncStorage.getItem(_this4.dbName);
            return database ? yield AsyncStorage.removeItem(_this4.dbName) : null;
        })();
    }

    // add
    add(data) {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            yield _this5.initModel();
            var autoinc = _this5.model.autoinc++;
            if (_this5.model.rows[autoinc]) {
                return Util.error("ReactNativeStore error: Storage already contains _id '" + autoinc + "'");
            }
            if (data._id) {
                return Util.error("ReactNativeStore error: Don't need _id with add method");
            }
            data._id = autoinc;
            _this5.model.rows[autoinc] = data;
            _this5.model.totalrows++;
            _this5.database[_this5.modelName] = _this5.model;
            yield AsyncStorage.setItem(_this5.dbName, JSON.stringify(_this5.database));
            return _this5.model.rows[data._id];
        })();
    }

    // multi add
    multiAdd(data) {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            yield _this6.initModel();
            for (var key in data) {
                var value = data[key];
                var autoinc = _this6.model.autoinc++;
                if (_this6.model.rows[autoinc]) {
                    return Util.error("ReactNativeStore error: Storage already contains _id '" + autoinc + "'");
                }
                if (value._id) {
                    return Util.error("ReactNativeStore error: Don't need _id with add method");
                }
                value._id = autoinc;
                _this6.model.rows[autoinc] = value;
                _this6.model.totalrows++;
            }
            _this6.database[_this6.modelName] = _this6.model;
            yield AsyncStorage.setItem(_this6.dbName, JSON.stringify(_this6.database));
            return _this6.model.rows;
        })();
    }

    // update
    update(data, filter) {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            yield _this7.initModel();
            filter = filter || {};
            if (data._id) delete data._id;
            var results = [];
            var rows = _this7.model["rows"];
            var filterResult = _this7.modelFilter.apply(rows, filter);
            for (var row in rows) {
                for (var element in filterResult) {
                    if (rows[row]['_id'] === filterResult[element]['_id']) {
                        for (var i in data) {
                            rows[row][i] = data[i];
                        }
                        results.push(rows[row]);
                        _this7.database[_this7.modelName] = _this7.model;
                        yield AsyncStorage.setItem(_this7.dbName, JSON.stringify(_this7.database));
                    }
                }
            }
            return results.length ? results : null;
        })();
    }

    // remove a single entry by id
    updateById(data, id) {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            var result = yield _this8.update(data, {
                where: {
                    _id: id
                }
            });
            return result ? result[0] : null;
        })();
    }

    // remove
    remove(filter) {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            yield _this9.initModel();
            filter = filter || {};
            var results = [];
            var rowsToDelete = [];
            var rows = _this9.model["rows"];
            var filterResult = _this9.modelFilter.apply(rows, filter);
            for (var row in rows) {
                for (var element in filterResult) {
                    if (rows[row]['_id'] === filterResult[element]['_id']) rowsToDelete.push(row);
                }
            }
            for (var i in rowsToDelete) {
                var row = rowsToDelete[i];
                results.push(_this9.model["rows"][row]);
                delete _this9.model["rows"][row];
                _this9.model["totalrows"]--;
            }
            _this9.database[_this9.modelName] = _this9.model;
            yield AsyncStorage.setItem(_this9.dbName, JSON.stringify(_this9.database));
            return results.length ? results : null;
        })();
    }

    // remove a single entry by id
    removeById(id) {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            var result = yield _this10.remove({
                where: {
                    _id: id
                }
            });
            return result ? result[0] : null;
        })();
    }

    // find
    find(filter) {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            yield _this11.initModel();
            filter = filter || {};
            var results = [];
            var rows = _this11.model["rows"];
            results = _this11.modelFilter.apply(rows, filter);
            return results.length ? results : null;
        })();
    }

    // find a single entry by id
    findById(id) {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            var result = yield _this12.find({
                where: {
                    _id: id
                }
            });
            return result ? result[0] : null;
        })();
    }

    // get
    get(filter) {
        filter = filter || {};
        filter.limit = 1;
        return this.find(filter);
    }
}

module.exports = Model;