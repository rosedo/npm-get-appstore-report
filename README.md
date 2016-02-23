# TODO description

## Installation
```sh
$ npm install --save apple-sync-reports
```

## Configuration
```js
const appleSyncReports = require('apple-sync-reports');

// customizing options up-front
const appleSyncReports = require('apple-sync-reports')({ someOption: true });

// making an instance available to other files
const appleSyncReports = require('apple-sync-reports');
appleSyncReports.myCustomInstance = appleSyncReports({ someOption: true });
// freeing memory: delete appleSyncReports.myCustomInstance

// ES5: injecting Promise dependency
var Promise = require('my-promise-lib');
var appleSyncReports = require('apple-sync-reports')({ Promise: Promise });
```

## TODO usage example
```js
```

## Running tests
```sh
$ npm install --only=dev
$ npm install mocha // or npm install -g mocha
$ npm test
```
