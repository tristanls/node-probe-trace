/*

index.js - "probe": Instrument code with probes

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

var events = require('events'),
    util = require('util');

var Probe = module.exports = function Probe () {
    var self = this;
    self.activeProbes = {};
};

util.inherits(Probe, events.EventEmitter);

/*
  * `name`: _String_ Name of a probe to turn on.
*/
Probe.prototype.addProbe = function addProbe (name) {
    var self = this;
    self.activeProbes[name] = true;
};

/*
  * `name`: _String_ Name of the probe.
  * `func`: _Function_ Function to instrument.
  * Return: _Function_ Instrumented function.
*/
Probe.prototype.instrument = function instrument (name, func) {
    var self = this;
    var instrumented = function () {
        // shortcircuit if probe is off
        if (!self.activeProbes[name]) return func.apply(this, arguments);
        
        var args = Array.prototype.slice.call(arguments);
        self.emit('~probe:' + name + ':enter', {
            name: name,
            context: self.context,
            timestamp: new Date().getTime(),
            args: args
        });
        var hr = process.hrtime();
        try { 
            var result = func.apply(this, arguments);
        } catch (e) {
            hr = process.hrtime(hr);
            self.emit('~probe:' + name + ':error', {
                name: name,
                context: self.context,
                timestamp: new Date().getTime(),
                duration: hr[0] * 1e9 + hr[1],
                args: args,
                error: e
            });
            throw e;
        }
        hr = process.hrtime(hr);
        self.emit('~probe:' + name + ':return', {
            name: name,
            context: self.context,
            timestamp: new Date().getTime(),
            duration: hr[0] * 1e9 + hr[1],
            args: args,
            result: result
        });
        return result;
    };
    instrumented._original = func;
    return instrumented;
};

/*
  * `name`: _String_ Name of a probe to turn off.
*/
Probe.prototype.removeProbe = function removeProbe (name) {
    var self = this;
    delete self.activeProbes[name];
};

/*
  * `func`: _Function_ Previously instrumented function.
  * Return: _Function_ Uninstrumented function.
*/
Probe.prototype.uninstrument = function uninstrument (func) {
    if (func._original instanceof Function) return func._original;
    return func;
};