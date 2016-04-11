
var config = require('./local-config.json') || require('/config.json');
var util = require('util');

function getProxiesFromConfig() {
    if (util.isObject(config.proxies) && config.proxies.template) {
      let min = config.proxies.min || false;
      let max = config.proxies.max || false; 
      if (min === false || max === false) {
        throw "No min or max provided with proxy template string.";
      }
      let proxies = [];
      for(let i = min;i <= max;min++) {
        proxies.push(util.format(template, i));
      }
      return proxies;
    } else if (util.isArray(config.proxies)) {
      return config.proxies;
    } else {
      if (config.proxyEnabled) {
        throw "Proxy enabled with no proxies. Add an array to proxy.proxies or a proxy.proxies.template, min and max.";
      }
      return [];
    }
}

module.exports = {

  getProxiesFromConfig : getProxiesFromConfig

}