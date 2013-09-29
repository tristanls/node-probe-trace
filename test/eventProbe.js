/*

eventProbe.js - Event '~probe' test

The MIT License (MIT)

Copyright (c) 2013 Tristan Slominski

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

"use strict";

var Probe = require('../index.js');

var test = module.exports = {};

test["Instrumented and turned on probe results in '~probe:foo:enter' event on" +
     " function entry"] = function (test) {
    test.expect(4);
    var probe = new Probe();
    var func = function (a, b) {
        return a + b;
    };
    var f = probe.instrument('foo', func);
    probe.addProbe('foo');
    probe.on('~probe:foo:enter', function (event) {
        test.equal(event.name, 'foo');
        test.ok(!event.context);
        test.ok(event.timestamp);
        test.deepEqual(event.args, [1, 3]);
        test.done();
    });
    f(1, 3);
};

test["Instrumented and turned on probe results in '~probe:foo:return' event on" +
     " function return"] = function (test) {
    test.expect(6);
    var probe = new Probe();
    var func = function (a, b) {
        return a + b;
    };
    var f = probe.instrument('foo', func);
    probe.addProbe('foo');
    probe.on('~probe:foo:return', function (event) {
        test.equal(event.name, 'foo');
        test.ok(!event.context);
        test.ok(event.timestamp);
        test.ok(event.duration);
        test.deepEqual(event.args, [1, 3]);
        test.equal(event.result, 4);
        test.done();
    });
    f(1, 3);
};

test["Instrumented and turned on probe results in '~probe:foo:error' event on" +
     " function error and propagates the error throw"] = function (test) {
    test.expect(7);
    var probe = new Probe();
    var error = new Error("boom!");
    var func = function (a, b) {
        throw error;
    };
    var f = probe.instrument('foo', func);
    probe.addProbe('foo');
    probe.on('~probe:foo:error', function (event) {
        test.equal(event.name, 'foo');
        test.ok(!event.context);
        test.ok(event.timestamp);
        test.ok(event.duration);
        test.deepEqual(event.args, [1, 3]);
        test.strictEqual(event.error, error);
    });
    try {
        f(1, 3);
    } catch (e) {
        test.strictEqual(e, error);
        test.done();
    }
};

test["Instrumented but turned off probe does not emit events"] = function (test) {
    test.expect(0);
    var probe = new Probe();
    var func = function (a, b) {
        return a + b;
    };
    var f = probe.instrument('foo', func);
    // no probe.addProbe('foo') !
    probe.on('~probe:foo:return', function (event) {
        test.ok(false);
    });
    f(1, 3);
    test.done();
};

test["Instrumented probe emits events based whether it is on or off"] = function (test) {
    test.expect(1);
    var probe = new Probe();
    var failOnEvent = function (event) {
        test.ok(false);
    };
    var func = function (a, b) {
        return a + b;
    };
    var f = probe.instrument('foo', func);
    var succeedOnEvent = function (event) {
        test.ok(event);
        probe.removeListener('~probe:foo:return', succeedOnEvent);
        probe.on('~probe:foo:return', failOnEvent);
        probe.removeProbe('foo');
        f(1, 3);
        test.done();
    };
    probe.on('~probe:foo:return', failOnEvent);
    f(1, 3);
    probe.removeListener('~probe:foo:return', failOnEvent);
    probe.on('~probe:foo:return', succeedOnEvent);
    probe.addProbe('foo');
    f(1, 3);
};