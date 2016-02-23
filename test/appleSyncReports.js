'use strict';

var assert = require('assert');
var _ = require('lodash');
var appleSyncReportsModule = require('../appleSyncReports');
var appleSyncReports = appleSyncReportsModule({
});

describe('module appleSyncReports', function() {
  describe('managing instances', function() {
    it('module should be a default instance', function() {
      assert.strictEqual(typeof appleSyncReportsModule.todoMethod, 'function');
    });
    it('module can create a new instance', function() {
      assert.strictEqual(typeof appleSyncReportsModule, 'function');
      assert.strictEqual(typeof appleSyncReports, 'function');
      assert.strictEqual(typeof appleSyncReports.todoMethod, 'function');
    });
  });
});