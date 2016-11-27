'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var AsyncStorage = require('react-native').AsyncStorage;
var Model = require('./model.js');
var Util = require('./util.js');

class Store {

    constructor(opts) {
        this.dbName = opts.dbName;
    }

    _getCurrentVersion(versionKey) {
        return _asyncToGenerator(function* () {
            var currentVersion = yield AsyncStorage.getItem(versionKey);
            currentVersion = currentVersion || 0;
            return parseFloat(currentVersion);
        })();
    }

    migrate() {
        var _this = this;

        return _asyncToGenerator(function* () {
            var migrations = require('./migrations.js');
            var versionKey = `${ _this.dbName }_version`;
            var currentVersion = yield _this._getCurrentVersion(versionKey);
            var target = migrations.slice(-1)[0];
            if (currentVersion == target.version) return;
            for (let migration of migrations) {
                if (migration.version <= currentVersion) continue;
                migration.perform();
                yield AsyncStorage.setItem(versionKey, migration.version.toString());
            }
        })();
    }

    model(modelName) {
        return new Model(modelName, this.dbName);
    }

    // clear store
    clear() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            yield AsyncStorage.removeItem(_this2.dbName);
        })();
    }

}

module.exports = Store;

// Store.model("user").get({ id:1 },{fite}).then().fail();