'use strict';

var assert = require('assert');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var getAppStoreReportModule = require('../getAppStoreReport');
var privateOptions = JSON.parse(fs.readFileSync(path.join(__dirname, '/private.json')));
var getAppStoreReport = getAppStoreReportModule(_.assign({}, privateOptions, {
    report_type: 'Sales',
    report_subtype: 'Summary',
    date_type: 'Daily',
    report_date: '20160201',
    outputDirectory: path.join(__dirname, '/outputDirectory'),
    returnJson: true,
    deleteDownloadedFiles: true,
}));

describe('module getAppStoreReport', function() {
    describe('managing instances', function() {
        it('module should be a default instance', function() {
            assert.strictEqual(typeof getAppStoreReportModule.execute, 'function');
        });
        it('module can create a new instance', function() {
            assert.strictEqual(typeof getAppStoreReportModule, 'function');
            assert.strictEqual(typeof getAppStoreReport, 'function');
            assert.strictEqual(typeof getAppStoreReport.execute, 'function');
        });
    });
    describe('execute', function() {
        it('should result in a report', function(done) {
            console.log('      setting 10s timeout for this test');
            this.timeout(10000);
            getAppStoreReport.execute().then(function(result) {
                assert(result.length);
                assert.strictEqual(result[0].provider, 'APPLE');
                done();
            }).catch(function(err) {
                console.error(err);
                done(err);
            });
        });
    });
    describe('findFirstReportDate', function() {
        var expectedYear = '2012';

        // no monthly reports in expected year
        var expectedMonth = '201502';

        var expectedDay = expectedMonth + '23';

        it('should return first report_date (year for Yearly)', function(done) {
            console.log('      setting 1min timeout for this test');
            this.timeout(60000);
            getAppStoreReport.findFirstReportDate({
                date_type: 'Yearly',
            }).then(function(result) {
                assert.strictEqual(typeof result, 'object');
                assert.strictEqual(result.foundDay, false);
                assert.strictEqual(result.foundMonth, false);
                assert.strictEqual(result.foundYear, expectedYear);
                assert.strictEqual(result.date, expectedYear);
                done();
            }).catch(function(err) {
                console.error(err);
                done(err);
            });
        });
        it('should return first report_date (month for Monthly)', function(done) {
            console.log('      setting 5min timeout for this test');
            this.timeout(300000);
            getAppStoreReport.findFirstReportDate({
                date_type: 'Monthly',
            }).then(function(result) {
                assert.strictEqual(typeof result, 'object');
                assert.strictEqual(result.foundDay, false);
                assert.strictEqual(result.foundMonth, expectedMonth);
                assert.strictEqual(result.foundYear, expectedYear);
                assert.strictEqual(result.date, expectedMonth);
                done();
            }).catch(function(err) {
                console.error(err);
                done(err);
            });
        });
        it('should return first report_date (day for Daily)', function(done) {
            console.log('      setting 10min timeout for this test');
            this.timeout(600000);
            getAppStoreReport.findFirstReportDate({
                date_type: 'Daily',
            }).then(function(result) {
                assert.strictEqual(typeof result, 'object');
                assert.strictEqual(result.foundDay, expectedDay);
                assert.strictEqual(result.foundMonth, expectedMonth);
                assert.strictEqual(result.foundYear, expectedYear);
                assert.strictEqual(result.date, expectedDay);
                done();
            }).catch(function(err) {
                console.error(err);
                done(err);
            });
        });
    });
});