// does not work in strict mode

var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var AutoIngestTool = require('autoingesttool');
var csv = require('./csv')({
    delimiter: '\t',
    raiseOnEmptyLines: false,
    trimColumns: true,
    raiseOnMissingColumns: false,
    skipEmptyLines: true,
    handleQuotes: false,
});
var camelCase = require('./camelCase');

var defaultOptions = {
};

module.exports = new_();
function new_(mainOptions) {
    mainOptions = _.cloneDeep(mainOptions || {});
    _.defaultsDeep(mainOptions, defaultOptions);

    // does not work in strict mode
    Promise = (typeof Promise === 'undefined') ? mainOptions.Promise : Promise;

    if (Promise === undefined) {
        throw new Error('missing `Promise` dependency injection or global variable');
    }
    return _.assign(new_.bind(), {
        execute: execute,
    });

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