# probe-trace

_Stability: 1 - [Experimental](https://github.com/tristanls/stability-index#stability-1---experimental)_

[![NPM version](https://badge.fury.io/js/probe-trace.png)](http://npmjs.org/package/probe-trace)

Instrument code with probes.

## Installation

    npm install probe-trace

## Tests

    npm test

## Benchmarks

    npm run-script benchmark

## Overview

`probe-trace` enables instrumenting live Node.js code using probes using only JavaScript. 

It is sometimes useful to instrument live code in order to find out what's going on. In such cases, for code designed to support it, one could open a REPL to a running Node.js process, add instrumentation, and turn on various probes.

### Example

We will use the Node.js REPL to illustrate instrumenting live code. For this purpose we will use `examples/hello.js` module as an example. The module is an HTTP server that returns "hello world" via calling a `hello()` and a `world()` function to construct the response.

    node
    > var Hello = require('./examples/hello.js');
    undefined
    > var hello = new Hello();
    undefined
    > hello.listen(8080, function () { console.log('listening on 8080...'); });
    undefined
    > listening on 8080...

At this point, you can `curl localhost:8080` to see that the server is up.

We will now attach a probe to the 

    > var Probe = require('./index.js');
    undefined
    > var probe = new Probe();
    undefined
    > Hello.prototype.hello = probe.instrument('hello', Hello.prototype.hello);
    { [Function] _original: [Function: hello] }

You can now `curl localhost:8080` and see that it still works.

We will dump the entry event to the console.

    > probe.on('~probe:hello:enter', function (event) { console.dir(event); });
    { activeProbes: {},
      _events: { '~probe:hello:enter': [Function] } }
    > probe.addProbe('hello');
    undefined

Now, when you `curl localhost:8080` you'll see output in the console:

    > { name: 'hello',
      context: undefined,
      timestamp: 1380487865677,
      args: [] }

To turn off the probe again

    > probe.removeProbe('hello');
    undefined

Now, `curl localhost:8080` will not log anymore.

To return the server to original state:

    > Hello.prototype.hello = probe.uninstrument(Hello.prototype.hello);

`curl localhost:8080` continues to work.

### Performance

Instrumenting functions has its performance penalty, hence it is useful to `uninstrument()` when no longer needed.

The current performance benchmark gives intuition as to the cost of `probe-trace` instrumentation:

```
Starting benchmark...
Running uninstrumented...
1380985478151
Running instrumented but off...
1380985478468
Running instrumented and on...
1380985483500
Running instrumented, on, and with listeners registered...
1380985488939
Benchmark results:
  uninstrumented time                    :   160054566ns    6247869 calls/sec
  instrumented but off time              :   316946044ns    3155111 calls/sec
  instrumented and on time               :  5031668901ns     198741 calls/sec
  instrumented and on with listeners time:  5440269157ns     183814 calls/sec
```

## Documentation

### Probe

**Public API**
  * [new Probe()](#new-probe)
  * [probe.addProbe(name)](#probeaddprobename)
  * [probe.instrument(name, func)](#probeinstrumentname-func)
  * [probe.removeProbe(name)](#proberemoveprobename)
  * [probe.uninstrument(func)](#probeuninstrumentfunc)
  * [Event '~probe:\<name\>:enter'](#event-probenameenter)
  * [Event '~probe:\<name\>:error'](#event-probenameerror)
  * [Event '~probe:\<name\>:return'](#event-probenamereturn)

#### new Probe()

Creates a new `Probe` instance.

#### probe.addProbe(name)

  * `name`: _String_ Name of a probe to turn on.

Turns on a probe for previously instrumented function.

#### probe.instrument(name, func)

  * `name`: _String_ Name of the probe.
  * `func`: _Function_ Function to instrument.
  * Return: _Function_ Instrumented function.

Instruments a function for probing and relates it to the `name`.

#### probe.removeProbe(name)

  * `name`: _String_ Name of a probe to turn off.

Turns off a previously turned on probe for a function.

#### probe.uninstrument(func)

  * `func`: _Function_ Previously instrumented function.
  * Return: _Function_ Uninstrumented function.

If the `func` has not been previously instrumented, it is simply returned.

#### Event `~probe:<name>:enter`

  * `event`: _Object_
    * `name`: _String_ Name of the probe.
    * `context`: _Object_ Reserved for future use.
    * `timestamp`: _Integer_ Result of `new Date().getTime()`.
    * `args`: _Array_ Arguments passed to the instrumented function.

Emitted upon entry into an instrumented function for which the probe is on.

#### Event `~probe:<name>:error`

  * `event`: _Object_
    * `name`: _String_ Name of the probe.
    * `context`: _Object_ Reserved for future use.
    * `timestamp`: _Integer_ Result of `new Date().getTime()`.
    * `duration`: _Integer_ Instrumented function duration in **nanoseconds**.
    * `args`: _Array_ Arguments passed to the instrumented function.
    * `error`: _Any_ Any exception thrown by the instrumented function.

Emitted if an instrumented function, for which the probe is on, throws. After the event is emitted, the throw is propagated.

#### Event `~probe:<name>:return`

  * `event`: _Object_
    * `name`: _String_ Name of the probe.
    * `context`: _Object_ Reserved for future use.
    * `timestamp`: _Integer_ Result of `new Date().getTime()`.
    * `duration`: _Integer_ Instrumented function duration in **nanoseconds**.
    * `args`: _Array_ Arguments passed to the instrumented function.
    * `result`: _Any_ Any result returned by the instrumented function.

Emitted upon return from an instrumented function for which the probe is on.