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

var uninstrumentedTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    testFunction(1, 2);
}
uninstrumentedTime = process.hrtime(uninstrumentedTime);

var probe = new Probe();
var instrumentedTestFunction = probe.instrument('foo', testFunction);

console.log("Running instrumented but off...");
var instrumentedTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    instrumentedTestFunction(1, 2);
}
instrumentedTime = process.hrtime(instrumentedTime);

console.log("Running instrumented and on...");
probe.addProbe('foo');
var instrumentedAndOnTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    instrumentedTestFunction(1, 2);
}
instrumentedAndOnTime = process.hrtime(instrumentedAndOnTime);

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
var instrumentedAndOnAndListenersTime = process.hrtime();
for (var i = 0; i < iterations; i++) {
    instrumentedTestFunction(1, 2);
}
instrumentedAndOnAndListenersTime = process.hrtime(instrumentedAndOnAndListenersTime);

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