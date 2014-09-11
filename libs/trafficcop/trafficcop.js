(function (factory) {
  'use strict';
  // CSS Transition Lib supports amd if it's available
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], function ($) {
      window.TrafficCop = factory($);
      return window.TrafficCop;
    });
  } else {
    window.TrafficCop = factory(window.jQuery || window.Zepto || window.$);
  }
}(function ($) {
    "use strict";
    function TrafficCop() {
        this._activeWrites = [];
        this._activeReads = [];
    }
    TrafficCop.prototype.addWrite = function(promise) {
        var _this = this,
            writeRecord = {
            promise: promise,
            gate: $.Deferred(),
            result: null
        };
        this._activeWrites.push(writeRecord);
        promise.always(function(result) {
            _this._writeResolved(writeRecord, result);
        });
        // We return a new promise for people to attach their callback handlers to
        return writeRecord.gate.promise();
    };
    TrafficCop.prototype._writeResolved = function(writeRecord, result){
        if (this._activeReads.length) {
            // Reads! Save the result somewhere handy
            writeRecord.result = result;
        } else {
            // No reads, resolve immediately
            if (writeRecord.promise.state() === 'resolved') {
                writeRecord.gate.resolve(result);
            } else {
                writeRecord.gate.reject(result);
            }
            this._cleanupWrites();
        }
    };
    TrafficCop.prototype.addRead = function (promise) {
        var _this = this;
        this._activeReads.push(promise);
        promise.always(function () {
            _this._readResolved(promise);
        });
    };
    TrafficCop.prototype._readResolved = function (promise) {
        var index = this._activeReads.indexOf(promise);
        // cleanup!
        this._activeReads.splice(index, 1);
        if (this._activeReads.length === 0) {
            // trigger completion events
            this._openGate();
        }
    };
    TrafficCop.prototype._openGate = function () {
        this._activeWrites.forEach(function (itm) {
            var state = itm.promise.state();
            if (state === 'resolved') {
                itm.gate.resolve(itm.result);
            } else if (state === 'rejected') {
                itm.gate.reject(itm.result);
            }
        });
        this._cleanupWrites();
    };
    TrafficCop.prototype._cleanupWrites = function () {
        this._activeWrites = this._activeWrites.filter(function (itm) {
            return itm.gate.state() === 'pending';
        });
    };

    return new TrafficCop();
}));