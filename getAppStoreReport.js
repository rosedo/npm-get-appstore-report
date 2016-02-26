'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var AutoIngestTool = require('autoingesttool');
var camelCase = require('camelcase');
var csv = require('csv-each')({
    delimiter: '\t',
    raiseOnEmptyLines: false,
    trimColumns: true,
    raiseOnMissingColumns: false,
    skipEmptyLines: true,
    handleQuotes: false,
});
var promiseUtils = require('./promiseUtils');

var defaultOptions = {
};

module.exports = new_();
function new_(mainOptions) {
    mainOptions = _.clone(mainOptions || {});
    _.defaultsDeep(mainOptions, defaultOptions);
    return _.assign(new_.bind(), {
        execute: execute,
        findFirstReportDate: findFirstReportDate,
    });

    function findFirstReportDate(options) {
        options = _.cloneDeep(options || {});
        _.defaultsDeep(options, mainOptions);
        return requireOptions(options, [
            'date_type',
        ]).then(function() {
            return new Promise(function(resolve, reject) {
                var currentYear = new Date().getFullYear();
                var dateType = options.date_type;
                var mainResult = {
                    foundYear: false,
                    foundMonth: false,
                    foundDay: false,
                    first_report_date: null,
                };
                var years = [];
                for(var i = 2010; i <= currentYear; i++) {
                    years.push('' + i);
                }
                options.date_type = 'Yearly';
                return promiseUtils.thenEachSeries(years, function(year) {
                    return new Promise(function(resolve, reject) {
                        if (mainResult.foundYear) {
                            return resolve();
                        }
                        options.report_date = year;
                        return execute(options)
                        .then(function(result) {
                            mainResult.foundYear = year;
                            return resolve();
                        })
                        .catch(function(err) {
                            if (err.name === 'Empty File Error') {
                                return resolve();
                            }
                            return reject(err);
                        });
                    });
                }).then(function() {
                    if (dateType === 'Yearly') {
                        if (mainResult.foundYear) {
                            mainResult.date = mainResult.foundYear;
                        }
                        return resolve(mainResult);
                    }
                    var months = [];
                    for(var i = mainResult.foundYear; i <= currentYear; i++) {
                        months = months.concat([
                            i + '01',
                            i + '02',
                            i + '03',
                            i + '04',
                            i + '05',
                            i + '06',
                            i + '07',
                            i + '08',
                            i + '09',
                            i + '10',
                            i + '11',
                            i + '12',
                        ]);
                    }
                    options.date_type = 'Monthly';
                    return new Promise(function(resolve, reject) {
                        return promiseUtils.thenEachSeries(months, function(month) {
                            return new Promise(function(resolve, reject) {
                                if (mainResult.foundMonth) {
                                    return process.nextTick(resolve);
                                }
                                options.report_date = month;
                                return execute(options)
                                .then(function(result) {
                                    mainResult.foundMonth = month;
                                    return resolve();
                                })
                                .catch(function(err) {
                                    if (err.name === 'Empty File Error') {
                                        return resolve();
                                    }
                                    return reject(err);
                                });
                            });
                        })
                        .then(function() {
                            if (dateType === 'Monthly') {
                                if (mainResult.foundMonth) {
                                    mainResult.date = mainResult.foundMonth;
                                }
                                return resolve(mainResult);
                            }
                            var days = [];
                            var currentMonth = new Date().getMonth() + 1;
                            currentMonth = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
                            for(var i = mainResult.foundMonth.substr(0, 4); i <= currentYear; i++) {
                                for(var m = 1; m <= 12; m++) {
                                    var count = getMonthDayCount(i, m);
                                    for(var j = 1; j <= count; j++) {
                                        days.push('' + i + (m < 10 ? '0' + m : m) + (j < 10 ? '0' + j : j));
                                    }
                                }
                            }
                            options.date_type = 'Daily';
                            return new Promise(function(resolve, reject) {
                                return promiseUtils.thenEachSeries(days, function(day) {
                                    return new Promise(function(resolve, reject) {
                                        if (mainResult.foundDay) {
                                            return resolve();
                                        }
                                        options.report_date = day;
                                        return execute(options)
                                        .then(function(result) {
                                            mainResult.foundDay = day;
                                            return resolve();
                                        })
                                        .catch(function(err) {
                                            if (err.name === 'Empty File Error') {
                                                return resolve();
                                            }
                                            return reject(err);
                                        });
                                    });
                                })
                                .then(function() {
                                    if (mainResult.foundDay) {
                                        mainResult.date = mainResult.foundDay;
                                    }
                                    return resolve(mainResult);
                                });
                            }).then(resolve, reject);
                        }).then(resolve, reject);
                    }).then(resolve, reject);
                })
                .catch(reject);
            });
        });
    }

    function execute(options) {
        options = _.cloneDeep(options || {});
        _.defaultsDeep(options, mainOptions);
        return requireOptions(options, [
            'username',
            'password',
            'vendor_number',
            'report_type',
            'outputDirectory',
            'returnJson',
            'deleteDownloadedFiles',
        ]).then(function() {
            if (options.report_type === 'DRR') {
                return requireOptions(options, [
                    'region_code',
                    'fiscal_year',
                    'fiscal_period',
                ]);
            }
            return requireOptions(options, [
                'report_subtype',
                'date_type',
                'report_date',
            ]);
        })
        .then(function() {
            var paths = {
                archive: path.join(options.outputDirectory, 'archive'),
                report: path.join(options.outputDirectory, 'report'),
                json_report: path.join(options.outputDirectory, 'json_report'),
            };
            return new Promise(function(resolve, reject) {
                var method = options.report_type === 'DRR' ? 'downloadFinancialReport' : 'downloadSalesReport';
                AutoIngestTool[method](options, paths, function(err, updatedPaths) {
                    if (err) {
                        return reject(err);
                    }
                    if (!options.returnJson) {
                        return resolve(updatedPaths);
                    }
                    var result = [];
                    csv.eachEntry({
                        filename: updatedPaths.report,
                        iterator: function(record) {
                            var convertedRecord = {};
                            for (var i in record) {
                                convertedRecord[camelCase(i)] = record[i];
                            }
                            result.push(convertedRecord);
                        },
                    })
                    .then(function() {
                        if (options.deleteDownloadedFiles) {
                            return fs.unlink(paths.archive, function(err) {
                                if (err) {
                                    return reject(err);
                                }
                                return fs.unlink(paths.report, function(err) {
                                    if (err) {
                                        return reject(err);
                                    }
                                    return fs.unlink(paths.json_report, function(err) {
                                        if (err) {
                                            return reject(err);
                                        }
                                        resolve(result);
                                    });
                                });
                            });
                        }
                        return resolve(result);
                    })
                    .catch(reject);
                });
            });
        });
    }
}

function requireOptions(providedOptions, requiredOptionNames) {
    return new Promise(function(resolve, reject) {
        requiredOptionNames.forEach(function(optionName) {
            if (typeof providedOptions[optionName] === 'undefined') {
                return reject(new Error('missing option: ' + optionName));
            }
        });
        return resolve();
    });
}

// parseInt(month, 10) should be in range 1-12
function getMonthDayCount(year, month) {
    var d = new Date();
    d.setFullYear(year, month, 0);
    return d.getDate();
}