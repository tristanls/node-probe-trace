/*

benchmark.js - Benchmark comparing cost of instrumentation

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

var pad = require('pad'),
    Probe = require('../index.js');

var testFunction = function testFunction (a, b) {
    return a + b;
};

var iterations = 1e6;

console.log("Starting benchmark...");
console.log("Running uninstrumented...");

var accumulator = 0;
var diff = 0;
var sign = 1;
var uninstrumentedTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    if (i % 2) sign = -1 * sign;
    diff = new Date().getTime();
    accumulator = testFunction(1, sign * diff);
}
uninstrumentedTime = process.hrtime(uninstrumentedTime);
console.log(accumulator); // prevent being unused

var probe = new Probe();
var instrumentedTestFunction = probe.instrument('foo', testFunction);

console.log("Running instrumented but off...");
accumulator = 0;
sign = 1;
var instrumentedTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    if (i % 2) sign = -1 * sign;
    diff = new Date().getTime();
    accumulator = instrumentedTestFunction(1, sign * diff);
}
instrumentedTime = process.hrtime(instrumentedTime);
console.log(accumulator); // prevent being unused

console.log("Running instrumented and on...");
probe.addProbe('foo');
accumulator = 0;
sign = 1;
var instrumentedAndOnTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    if (i % 2) sign = -1 * sign;
    diff = new Date().getTime();
    accumulator = instrumentedTestFunction(1, sign * diff);
}
instrumentedAndOnTime = process.hrtime(instrumentedAndOnTime);
console.log(accumulator); // prevent being unused

console.log("Running instrumented, on, and with listeners registered...");
probe.on('~probe:foo:enter', function (event) {
    return 1 + 2;
});
probe.on('~probe:foo:error', function (event) {
    return 1 + 2;
});
probe.on('~probe:foo:return', function (event) {
    return 1 + 2;
});
accumulator = 0;
sign = 1;
var instrumentedAndOnAndListenersTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    if (i % 2) sign = -1 * sign;
    diff = new Date().getTime();
    accumulator = instrumentedTestFunction(1, sign * diff);
}
instrumentedAndOnAndListenersTime = process.hrtime(instrumentedAndOnAndListenersTime);
console.log(accumulator); // prevent being unused

console.log("Benchmark results:");
var reportResult = function (headline, hrtime) {
    var str = "  " + headline + ": ";
    var time;
    if (hrtime[0]) {
        time = hrtime[0] * 1e9 + hrtime[1];
    } else {
        time = hrtime[1];
    }
    str += pad(13, time + "ns", " ");
    var rate = (iterations / time) * 1e9; // calls per s
    rate = parseInt(rate);
    str += " " + pad(10, rate, " ") + " calls/sec";
    console.log(str);
};
reportResult("uninstrumented time                    ", uninstrumentedTime);
reportResult("instrumented but off time              ", instrumentedTime);
reportResult("instrumented and on time               ", instrumentedAndOnTime);
reportResult("instrumented and on with listeners time", instrumentedAndOnAndListenersTime);