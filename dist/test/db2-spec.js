"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const jt400_1 = require("../lib/jt400");
const chai_1 = require("chai");
const fs_1 = require("fs");
describe('connect', () => {
    it('should connect', () => __awaiter(this, void 0, void 0, function* () {
        const db = yield jt400_1.connect();
        const nUpdated = yield db.update('delete from tsttbl');
        chai_1.expect(nUpdated).to.be.least(0);
    })).timeout(10000);
    it('should close', () => __awaiter(this, void 0, void 0, function* () {
        const db = yield jt400_1.connect();
        yield db.close();
        return db
            .update('delete from tsttbl')
            .then(() => {
            throw new Error('should not be connected');
        })
            .catch(err => {
            chai_1.expect(err.message).to.have.string('connection does not exist');
        });
    })).timeout(6000);
});
describe('jt400 pool', () => {
    let idList;
    beforeEach(() => {
        return db_1.jt400
            .update('delete from tsttbl')
            .then(() => {
            const records = [
                { foo: 'bar', bar: 123, baz: '123.23' },
                { foo: 'bar2', bar: 124, baz: '321.32' }
            ];
            return db_1.jt400.insertList('tsttbl', 'testtblid', records);
        })
            .then(idListResult => (idList = idListResult));
    });
    it('should not be in memory', () => {
        chai_1.expect(db_1.jt400.isInMemory()).to.equal(false);
    });
    it('should not return same instance in configure', () => {
        chai_1.expect(db_1.jt400).to.not.equal(jt400_1.pool({ host: 'foo' }));
    });
    it('should configure host', () => {
        const db = jt400_1.pool({ host: 'nohost' });
        return db
            .query('select * from tsttbl')
            .then(() => {
            throw new Error('should not return result from nohost');
        })
            .catch(err => {
            chai_1.expect(err.message).to.have.string('cannot establish the connection');
        });
    }).timeout(15000);
    it('should insert records', () => {
        chai_1.expect(idList.length).to.equal(2);
        chai_1.expect(Number(idList[0])).to.be.above(1);
    });
    it('should execute query', () => __awaiter(this, void 0, void 0, function* () {
        const data = yield db_1.jt400.query('select * from tsttbl');
        chai_1.expect(data.length).to.equal(2);
    }));
    it('should execute query with params', () => __awaiter(this, void 0, void 0, function* () {
        const data = yield db_1.jt400.query('select * from tsttbl where baz=?', [
            123.23
        ]);
        chai_1.expect(data.length).to.equal(1);
    }));
    it('should execute update', () => __awaiter(this, void 0, void 0, function* () {
        const nUpdated = yield db_1.jt400.update("update tsttbl set foo='bar3' where foo='bar'");
        chai_1.expect(nUpdated).to.equal(1);
    }));
    it('should execute update', () => __awaiter(this, void 0, void 0, function* () {
        const nUpdated = yield db_1.jt400.update('update tsttbl set foo=? where testtblid=?', ['ble', 0]);
        chai_1.expect(nUpdated).to.equal(0);
    }));
    it('should insert dates and timestamps', () => {
        const params = [
            new Date(2014, 0, 15),
            new Date(2014, 0, 16, 15, 32, 5),
            'bar'
        ];
        return db_1.jt400
            .update('update tsttbl set fra=?, timi=? where foo=?', params)
            .then(() => {
            return db_1.jt400.query('select fra, timi from tsttbl where foo=?', ['bar']);
        })
            .then(res => {
            chai_1.expect(res[0].FRA).to.eql('2014-01-15');
            chai_1.expect(res[0].TIMI).to.eql('2014-01-16 15:32:05.000000');
        });
    });
    it('should insert clob', () => __awaiter(this, void 0, void 0, function* () {
        const largeText = fs_1.readFileSync(__dirname + '/../../test-data/clob.txt').toString();
        yield db_1.jt400.update('update tsttbl set clob=?', [
            { type: 'CLOB', value: largeText }
        ]);
        const res = yield db_1.jt400.query('SELECT clob from tsttbl');
        chai_1.expect(res[0].CLOB.length).to.equal(largeText.length);
    }));
});
//# sourceMappingURL=db2-spec.js.map