
var config = require('./local-config.json') || require('/config.json');
var util = require('util');
function getProxiesFromConfig() {
  let template = util.isObject(config.proxy.proxies) && config.proxy.proxies.template;
  if (template) {
    let min = config.proxy.proxies.min || false;
    let max = config.proxy.proxies.max || false;
    let username = config.proxy.username;
    let password = config.proxy.password;
    if (min === false || max === false) {
      throw "No min or max provided with proxy template string.";
    }
    let proxies = [];
    for(let i = min;i <= max;i++) {
      proxies.push("http://" + username + ":" + password + "@" + util.format(template, i));
    }
    return proxies;
  } else if (util.isArray(config.proxy.proxies)) {
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