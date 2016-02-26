# Download an iTunes Connect Report using AutoIngestTool

## Installation
```sh
$ npm install --save get-appstore-report
```

## Prerequesites
See AutoIngestTool README: <https://github.com/linitix/autoingesttool>

## Usage
```js
const getAppStoreReport = require('get-appstore-report');

// customizing options up-front
const getAppStoreReport = require('get-appstore-report')({ report_type: 'Sales' });

// making an instance available to other files
const getAppStoreReport = require('get-appstore-report');
getAppStoreReport.myCustomInstance = getAppStoreReport({ report_type: 'Sales' });
// freeing memory: delete getAppStoreReport.myCustomInstance

// if Promise isn't defined
global.Promise = require('promise-module');
var getAppStoreReport = require('get-appstore-report');
```

### Download an iTunes Connect Report
```js
getAppStoreReport.execute({

  // Mandatory options from AutoIngestTool
  username: '…',
  password: '…',
  vendor_number: '12345678',
  report_type: 'Sales',

  // mandatory for Sales or Newsstand report
  report_subtype: 'Summary',
  date_type: 'Monthly',
  report_date: '201602',

  // mandatory for DRR report (financial report)
  // region_code: 'US',
  // fiscal_year: 2016,
  // fiscal_period: 1,

  // Other mandatory options
  outputDirectory: path.join(__dirname, '/outputDirectory'),
  returnJson: true,
  deleteDownloadedFiles: true,

})
.then(console.log)
.catch(console.log);
```