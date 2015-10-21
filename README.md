# StatsD backend for Uptime Cloud Monitor

## Overview

This is a pluggable backend for [StatsD][statsd], which
publishes stats to [Uptime Cloud Monitor](https://www.idera.com/infrastructure-monitoring-as-a-service/freetrialsubscriptionform).

## Requirements

* [StatsD][statsd] versions >= 0.4.0.
    * An active [Uptime Cloud Monitor](https://www.idera.com/infrastructure-monitoring-as-a-service/freetrialsubscriptionform) account.

## Installation

    $ cd /path/to/statsd
    $ npm install copperegg-statsd-backend

## Configuration

You have to add the following basic configuration information to your
StatsD config file. You can find your apikey in the Uptime Cloud Monitor webapp,
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
have your metrics sent to Uptime Cloud Monitor.


## Additional configuration options

The Uptime Cloud Monitor backend also supports the following optional configuration
options under the top-level `copperegg` hash:

* `debug`: For debugging if something goes wrong.

* `metric_group`: This is the name of the metric group you created in the Uptime Cloud Monitor UI.
				  Defaults to 'statsd' but you need to create it.  It should contain a
				  metric for each metric name you send to statsd.

* `object_name`: This is a way to identify the metrics. The default is to use the hostname
 				 of the system statsd is running on.  You can change this to anything
 				 you want as long as it is unique.  Metrics you send will be 'attached' to
 				 this object.


## Publishing to multiple backends simultaneously

You can push metrics to multiple backends simultaneously, such as
Uptime Cloud Monitor and Graphite. Just include both backends in the `backends`
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

- [Uptime Cloud Monitor StatsD Backend](https://github.com/copperegg/copperegg-statsd-backend)

If you want to contribute:

1. Clone your fork
2. Hack away
3. If you are adding new functionality, document it in the README
4. Push the branch up to GitHub
5. Send a pull request

[statsd]: https://github.com/etsy/statsd
