'use strict';

var assert = require('assert');
var path = require('path');
var _ = require('lodash');
var getAppStoreReportModule = require('../getAppStoreReport');
var getAppStoreReport = getAppStoreReportModule({
    username: '…',
    password: '…',
    vendor_number: '12345678',
    report_type: 'Sales',
    report_subtype: 'Summary',
    date_type: 'Monthly',
    report_date: '201602',
    outputDirectory: path.join(__dirname, '/outputDirectory'),
    returnJson: true,
    deleteDownloadedFiles: true,
});

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
        it('should download a report', function(done) {
            getAppStoreReport.execute().then(function(result) {
                console.log('result.length', result.length);
                console.log('result[0]', result[0]);
                done();
            }).catch(function(err) {
                console.error(err);
                done(err);
            });
        });
    });
});