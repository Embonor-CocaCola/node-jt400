import { jt400 as connection } from './db'
import { pool, connect } from '../lib/jt400'
import { expect } from 'chai'
import { readFileSync } from 'fs'

describe('connect', function() {
	it('should connect', function() {
		this.timeout(10000);
		return connect().then(function(db) {
			return db.update('delete from tsttbl').then(function(n) {
				expect(n).to.be.least(0);
			});
		})
	});

	it('should close', function(done) {
		this.timeout(6000);
		connect().then(function(db) {
			return db.close().then(function() {
				return db.update('delete from tsttbl').then(function() {
					throw new Error('should not be connected');
				}, function(err) {
					expect(err.message).to.have.string('connection does not exist');
				});
			});
		}).then(done, done);
	});
});

describe('jt400 pool', function() {
	var idList;

	beforeEach(function(done) {
		this.timeout(5000);
		connection.update('delete from tsttbl')
			.then(function() {
				var records = [{ foo: 'bar', bar: 123, baz: '123.23' },
				{ foo: 'bar2', bar: 124, baz: '321.32' }];
				return connection.insertList('tsttbl', 'testtblid', records);
			})
			.then(function(idListResult) {
				idList = idListResult;
			}).then(done, done);
	});

	it('should not be in memory', function() {
		expect(connection.isInMemory()).to.equal(false);
	});

	it('should not return same instance in configure', function() {
		expect(connection).to.not.equal(pool({ host: 'foo' }));
	});

	it('should configure host', function() {
		this.timeout(15000);
		var db = pool({ host: 'nohost' });
		return db.query('select * from tsttbl').then(function() {
			throw new Error('should not return result from nohost')
		}).catch(function(err) {
			expect(err.message).to.have.string('cannot establish the connection');
		})
	});

	it('should insert records', function() {
		expect(idList.length).to.equal(2);
		expect(idList[0]).to.be.above(1);
	});

	it('should execute query', function(done) {
		connection.query('select * from tsttbl').then(function(data) {
			expect(data.length).to.equal(2);
		}).then(done, done);
	});

	it('should execute query with params', function(done) {
		connection.query('select * from tsttbl where baz=?', [123.23]).then(function(data) {
			expect(data.length).to.equal(1);
		}).then(done, done);
	});

	it('should execute update', function(done) {
		connection.update('update tsttbl set foo=\'bar3\' where foo=\'bar\'')
			.then(function(nUpdated) {
				expect(nUpdated).to.equal(1);
			}).then(done, done);
	});

	it('should execute update', function(done) {
		connection.update('update tsttbl set foo=? where testtblid=?', ['ble', 0])
			.then(function(nUpdated) {
				expect(nUpdated).to.equal(0);
			}).then(done, done);
	});

	it('should insert dates and timestamps', function(done) {
		var params = [new Date(2014, 0, 15), new Date(2014, 0, 16, 15, 32, 5), 'bar'];
		connection.update('update tsttbl set fra=?, timi=? where foo=?', params)
			.then(function() {
				return connection.query<any>('select fra, timi from tsttbl where foo=?', ['bar']);
			})
			.then(function(res) {
				expect(res[0].FRA).to.eql('2014-01-15');
				expect(res[0].TIMI).to.eql('2014-01-16 15:32:05.000000');
			}).then(done, done);
	});

	it('should insert clob', async () => {	
		const clobFile = readFileSync(__dirname  + '/../../test-data/clob.txt');
			
		const res = await connection.update('update tsttbl set clob=CAST(? as CLOB)', [{type: 'CLOB', value: clobFile.toString()}]);
		expect(res).to.equal(2);
	});
});
