# StatsD backend for CopperEgg

## Overview

This is a pluggable backend for [StatsD][statsd], which
publishes stats to [CopperEgg](http://copperegg.com).

## Requirements

* [StatsD][statsd] versions >= 0.4.0.
* An active [CopperEgg](http://copperegg.com/copperegg-signup/) account.

## Installation

    $ cd /path/to/statsd
    $ npm install copperegg-statsd-backend

## Configuration

You have to add the following basic configuration information to your
StatsD config file. You can find your apikey in the CopperEgg webapp, 
under Settings.

```js
{
  copperegg: {
    apikey: "ha6dg12d8ah129d"
  }
}
```

## Enabling

Add the `copperegg-statsd-backend` backend to the list of StatsD
backends in the StatsD configuration file:

```js
{
  backends: ["copperegg-statsd-backend"]
}
```

Start/restart the statsd daemon to pick up the changes and 
have your metrics sent to CopperEgg.


## Additional configuration options

The CopperEgg backend also supports the following optional configuration
options under the top-level `copperegg` hash:

* `debug`: For debugging if something goes wrong.

* `metric_group`: This is the name of the metric group you created in the CopperEgg UI. 
				  Defaults to 'statsd' but you need to create it.  It should contain a
				  metric for each metric name you send to statsd.

* `object_name`: This is a way to identify the metrics. The default is to use the hostname
 				 of the system statsd is running on.  You can change this to anything
 				 you want as long as it is unique.  Metrics you send will be 'attached' to
 				 this object.


## Publishing to multiple backends simultaneously

You can push metrics to multiple backends simultaneously, such as
CopperEgg and Graphite. Just include both backends in the `backends`
variable:

```js
{
  backends: [ "./backends/graphite", "copperegg-statsd-backend" ],
  ...
}
```

See the [statsd][statsd] manpage for more information.

## NPM Dependencies

None

## Development

- [CopperEgg StatsD Backend](https://github.com/copperegg/copperegg-statsd-backend)

If you want to contribute:

1. Clone your fork
2. Hack away
3. If you are adding new functionality, document it in the README
4. Push the branch up to GitHub
5. Send a pull request

[statsd]: https://github.com/etsy/statsd
