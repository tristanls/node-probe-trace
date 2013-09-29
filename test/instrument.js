/*

instrument.js - probe.instrument(name, func) test

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

test['instrument() wraps the original function'] = function (test) {
    test.expect(1);
    var func = function (a, b) {
        return a + b;
    };
    var probe = new Probe();
    var f = probe.instrument('foo', func);
    test.equal(f(1, 2), 3);
    test.done();
};

test["instrument() preserves 'this' binding of original function"] = function (test) {
    test.expect(2);
    var o = {
        a: 7,
        func : function (b) {
            return this.a + b;
        }
    };
    test.equal(o.func(3), 10);
    var probe = new Probe();
    o.func = probe.instrument('foo', o.func);
    test.equal(o.func(3), 10);
    test.done();
};