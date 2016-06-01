# DL Validator
A dynamic Node application that can validate links to various file storage services, ensuring that the files haven't expired or been removed.

## Features include:
* Service support for popular file storage services (dropbox, google drive, mega, etc).
* Multiple Input Processors (SQL Query, CSV, etc).
* Multiple Result Handlers (Slack integration, google spreadsheet, console, etc).
* Ability to easy integrate custom plugins for any of the above features.
* Support for redirects (including invalidating a link if it redirects).
* Proxy support (no auth or basic auth only currently)
* Configuration purely via JSON for maximum customization.

# Getting Started
//TODO

# Input Processors
Numerous common inputs are supported. See "Custom Plugins" if you would like to implement your own. Use a single input, or combine multiple (NOT FINISHED AND HARD TO USE).

## SQL (Sequelize)
Query any database supported by Sequelize!

```javascript
"input_processors" : {
  "my_sql_input_processor" : {
    "enabled" : true,
    "type" : "sql_db",
    "host" : "66.66.66.66",
    "username" : "dbuser",
    "password" : "example_password",
    "dialect" : "mysql",
    "database" : "somedb",
    "dl_link_column" : "dl_link",
    "query" : "SELECT dl_link, name, date from link_table"
  }
}
```

### Options
* host - URL or IP of the SQL database you are querying. Can be file path to SQLite file.
* username - username of user connecting to DB.
* password - password of user connecting the DB.
* dialect - Type of dialect to use / type of SQL database. Below is a list of supported dialects
  * mysql
  * sqlite
  * postgres
  * mssql
* database - database name
* dl_link__column - The column containing the DL link to validate. MUST be selected in your query. Without this, it will fail.
* query - SQL Select query, all columns selected will be added as attributes.

# Result Handlers
Numerous common inputs are supported. See "Custom Plugins" if you would like to implement your own. Can use multiple result handlers (send the same to slack and to a google spreadsheet!)

## Slack Integration

```javascript
"result_handlers" : {
  "bobs_slack_integration" : {
      "enabled" : true,
      "type" : "slack",
      "incomingWebHookURL" : "https://hooks.slack.com/services/M66666/666666666666666666666",
      "invalidMessageFormat" : {
          "text" : "Invalid Link message!",
          "attachments" : [
              {
                  "text": "Black text.",
                  "color": "#000000"
              },
              {
                  "text": "<{{link_to_somewhere}}|Link In Slack!>",
                  "color": "good"
              }
          ]
        },
      "redirectMessageFormat" : {
        "attachments" : [
            {
                "text": "Redirecting Download Link Found.",
                "color": "danger"
            },
            {
                "text": "Redirecting Hosts:\n{{redirectingHosts}}",
                "color": "danger"
            }
        ]
      }
    }
  }  
```

### Options
* incomingWebHookURL - The Incoming Webhook URL setup for your Slack.
* invalidMessageFormat - **Template-able** - Message format for invalid messages.
* redirectMessageFormat (optional) -- **Template-able** - Message format for redirecting links. Requires `isRedirectInvalid` = true to be used. See more info in redirects section.

**For information on the above message format options, look at the [Slack Incoming Webhook documentation](https://api.slack.com/incoming-webhooks)**

# Proxy Support
Add proxy use for all requests by adding a proxy object to the master config.
If username and password are provided, all requests will use HTTP Basic auth.
//TODO - above is only valid for templated proxies atm..

The below example config uses a numeric template to generic proxy hostnames automatically, like:
> us1.proxy.com
> us2.proxy.com
> ...
> us100.proxy.com

```javascript
"proxy" : {
  "enabled" : true,
  "username" : "proxy_user",
  "password" : "proxy_password",
  "proxies" : {
      "template" : "us%d.proxy.com",
      "min" : 1,
      "max" : 100
    }
}
```

### Options
* username - username for proxy server.
* password - password for proxy server.
* proxies - An array of proxy hosts, or object with a numeric template.
  * template - A standard template string (printf style).
  * min - min number for template string
  * max - max number for template string.

# Redirects
Redirects can be handled in a variety of ways.
* Setting `invalidIfRedirected` to true in the master configuration will cause links that redirect to be treated as "invalid".
* If a link redirects, the program will follow it and run the same process.

# Optimization
There are a few optimization tweaks you can make in the master config to improve the speed/effectiveness of the program.

## Delays
 Good to use if you aren't using proxies, and are worried about being request limited/throttled. With `delay`, you can set amount of milliseconds to wait before trying to validate another download link.

## Retries
Sometimes a site/server fails, so we allow retries. With `retries`, you can set the maximum amount of retries.

# Custom Plugins
//TODO

### Required Plugin Values
* enabled - whether or not the processor is enabled or not. If you fail to declare this true, your plugin will never be loaded.
* type - name of the plugin's javascript file.

# Issues
//TODO
