'use strict';

module.exports = {
    auto: auto,
    use: use,
    thenEachSeries: thenEachSeries,
};

function auto(resolve, reject) {
    return function(err, result) {
        return err ? reject(err) : resolve(result);
    };
}

function use(argument, thenCallback, catchCallback) {
    var p = Promise.resolve(argument);
    if (thenCallback) {
        p.then(thenCallback);
    }
    if (catchCallback) {
        p.catch(catchCallback);
    }
    return p;
}

function thenEachSeries(promise, iterator, catchCallback) {
    if (!(promise instanceof Promise)) {
        promise = Promise.resolve(promise);
    }
    promise = promise.then(function(obj) {
        return new Promise(function(resolve, reject) {
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            var key = nextKey();
            function iterate() {
                if (key === null) {
                    return resolve();
                }
                var iteratorPromise = iterator(obj[key]);
                if (!(iteratorPromise instanceof Promise)) {
                    iteratorPromise = Promise.resolve(iteratorPromise);
                }
                iteratorPromise.then(function() {
                    return new Promise(function(resolve2, reject2) {
                        key = nextKey();
                        iterate();
                    });
                })
                .catch(reject);
            }
            iterate();
        });
    });
    if (catchCallback) {
        return promise.catch(catchCallback);
    }
    return promise;
};

function _isArrayLike(arr) {
    return Array.isArray(arr) || (
        // has a positive integer length property
        typeof arr.length === 'number' &&
        arr.length >= 0 &&
        arr.length % 1 === 0
    );
}

function _keyIterator(coll) {
    var i = -1;
    var len;
    var keys;
    if (_isArrayLike(coll)) {
        len = coll.length;
        return function next() {
            i++;
            return i < len ? i : null;
        };
    } else {
        keys = Object.keys(coll);
        len = keys.length;
        return function next() {
            i++;
            return i < len ? keys[i] : null;
        };
    }
}