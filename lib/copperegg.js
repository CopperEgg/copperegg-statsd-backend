/*
 * Flush stats to CopperEgg (http://copperegg.com).
 *
 * To enable this backend, include 'copperegg-statsd-backend' 
 * in the backends configuration array:
 *
 *   backends: ['copperegg-statsd-backend']
 *
 * The backend will read the conf options from the 'copperegg' hash defined in the 
 * main statsd config file:
 *
 *  copperegg : {
 *    apikey  : API Key from your CopperEgg account (required)
 *    apihost : Hostname of the CopperEgg API server   (debugging only, not needed)
 *  }
 */

var   net = require('net'),
     util = require('util'),
url_parse = require('url').parse,
    https = require('https'),
     http = require('http'),
       fs = require('fs');

var debug;
var apihost, apikey;
var coppereggStats = {};

var send_payload = function(options, proto, payload, retry)
{
  var req = proto.request(options, function(res) {

    if (Math.floor(res.statusCode / 100) == 4) {
      coppereggStats['error_4xx'] += 1;

      res.on('data', function(d) {
        var errdata = "HTTP " + res.statusCode + ": " + d;
        if (debug) {
          util.log("Bad Auth to CopperEgg API: " + errdata);
        }
      });

    } else if (Math.floor(res.statusCode / 100) == 5) {
      coppereggStats['error_5xx'] += 1;
    } else {
      coppereggStats['successful_posts'] += 1;
    }

  });

  if (debug) console.log(payload);

  coppereggStats['last_post'] = new Date().getSeconds();
  
  req.on('error', function(errdata) {
    util.log("Error connecting to CopperEgg!\n" + errdata);
  });

  try {
    req.write(payload);
    req.end();
  } catch(e) {
    if (debug) util.log(e);
  }
  
};

var post_stats = function(ts, gauges)
{
  var id = 'statsd1'
  var group_name = 'statsda'

  var payload = {timestamp: ts,
                 identifier: 'statsd',
                 values: gauges};

  var parsed_host = url_parse(apihost || 'https://api.copperegg.com');

  if (id) {
    payload.identifier = id;
  }

  payload = JSON.stringify(payload);

  var options = {
    host: parsed_host["hostname"],
    port: parsed_host["port"] || 443,
    path: '/v2/revealmetrics/samples/' + group_name + '.json',
    method: 'POST',
    headers: {
      "Authorization": 'Basic ' + new Buffer(apikey + ':U').toString('base64'),
      "Content-Length": payload.length,
      "Content-Type": "application/json"
    }
  };

  var proto = http;
  if ((parsed_host["protocol"] || 'http:').match(/https/)) {
    proto = https;
  }

  send_payload(options, proto, payload, false);
};

var sanitize_name = function(name)
{
  return name.replace(/[^-.:_\w]+/, '_').substr(0,255)
};

var flush_stats = function copperegg_flush(ts, metrics)
{
  var numStats = 0, statCount;
  var key;
  var gauges = {};
  var measureTime = ts;
  var internalStatsdRe = /^statsd\./;

  measureTime = Math.floor(ts / 5) * 5;

  var addMeasure = function add_measure(mType, measure) {
    gauges[measure.name] = measure.value;
    if (debug) console.log("ADD: " + measure.name + ' ' + measure.value);
  };

  for (key in metrics.counters) {
    if ((key.match(internalStatsdRe) != null)) {
      continue;
    }

    addMeasure('gauge', { name: sanitize_name(key),
                          value: metrics.counters[key]});
  }

  for (key in metrics.gauges) {
    if ((key.match(internalStatsdRe) != null)) {
      continue;
    }

    addMeasure('gauge', { name: sanitize_name(key),
                          value: metrics.gauges[key]});
  }

  /* currently not implemented
  for (key in metrics.timers) {
    
  }
  */

  post_stats(measureTime, gauges);
  gauges = {};
};

var backend_status = function copperegg_status(writeCb) {
  for (stat in coppereggStats) {
    writeCb(null, 'copperegg', stat, coppereggStats[stat]);
  }
};

exports.init = function copperegg_init(startup_time, config, events)
{
  debug = config.debug;

  /* You do not need to set apihost - debug purposes only */
  if (config.copperegg.apihost) {
    apihost = config.copperegg.apihost;
  }

  /* You are required to have an apikey set - get this from the CopperEgg Web App */
  apikey = config.copperegg.apikey;

  if (!apikey) {
    util.log("Error: Missing apikey configuration");
    return false;
  }

  coppereggStats['error_4xx'] = 0;
  coppereggStats['error_5xx'] = 0;
  coppereggStats['successful_posts'] = 0;

  events.on('flush', flush_stats);
  events.on('status', backend_status);

  return true;
};
