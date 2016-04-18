SilverStripe New Relic Integration
=================
Provides improved naming of transactions, error reporting and general tracking for SilverStripe site's on servers with the New Relic PHP Agent installed. It also surfaces an overview of information to the CMS such as Server Response Time, Visitor Load Time, Throughput, Apdex Score (Server and Visitor) as well as the Error Rate.

## Maintainer Contact
* Ed Chipman ([UndefinedOffset](https://github.com/UndefinedOffset))


## Requirements
* SilverStripe Framework 3.1+
* [New Relic for PHP](https://docs.newrelic.com/docs/agents/php-agent/getting-started/new-relic-php)


## Installation
__Composer (recommended):__
```
composer require webbuilders-group/silverstripe-new-relic
```


If you prefer you may also install manually:
* Download the module from here https://github.com/webbuilders-group/silverstripe-new-relic/archive/master.zip
* Extract the downloaded archive into your site root so that the destination folder is called new-relic, opening the extracted folder should contain _config.php in the root along with other files/folders
* Run dev/build?flush=all to regenerate the manifest


## Configuration
The configuration for the module can be found [here](docs/en/configuration.md) though most of the module will work out of the box provided the [New Relic PHP Agent](https://docs.newrelic.com/docs/agents/php-agent/getting-started/new-relic-php) and extension is loaded. In order to get the CMS "Site Performance" section working you must configure the ``NewRelicPerformanceReport.application_id`` and ``NewRelicPerformanceReport.api_key`` options.
