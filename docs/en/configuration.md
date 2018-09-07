Configuration
=================
Most of the configuration for the module is automatic if you have [New Relic's PHP Agent](https://docs.newrelic.com/docs/agents/php-agent/getting-started/new-relic-php) installed on your server and the extension is loaded. However there are a few configuration options:


#### PHP Constants
* __SS_NR_APPLICATION_NAME:__ This constant represents the application name to feed data into New Relic and can be set in either your project's ``_config.php`` or in ``_ss_environment.php``. You probably also want to ensure this is set in web server's configuration layer just in case there are critical issues with SilverStripe and the module does not have or is unable to set the application name. See the [New Relic PHP Agent documentation](https://docs.newrelic.com/docs/agents/php-agent/configuration/php-directory-ini-settings) for more information on how to do this.


#### SilverStripe Configuration Layer
* __WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport.application_id:__ This configuration option is the New Relic Application ID, to find your application id see [this documentation](https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/finding-product-id#apm) from New Relic.
* __WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport.api_key:__ This configuration option is your New Relic API Key, for information on how to retrieve your API key see [this documentation](https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/api-keys) from New Relic.
* __WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport.refresh_rate:__ This configuration option is the time in seconds that the New Relic data is cached for, this defaults to 5 minutes. This time is also sent to the cms visitor that is viewing the performance data for the site, and has 30 seconds added to it for refreshing the display in the ui. Note that New Relic has a delay of 2 minutes for new data from the site, so you probably do not want to set this any lower than that.
* __WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport.apdex_warn_lvl:__ This configuration option dictates when the apdex over 30 minutes reaches unacceptable levels. This number should be a float value between 0.01 and 0.99 it defaults to 0.85.
* __WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport.apdex_crit_lvl:__ This configuration option dictates when the apdex over 30 minutes reaches critical levels. This number should be a float value between 0.01 and 0.99 it defaults to 0.7.
* __WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport.error_rate_warn_lvl:__ This configuration option dictates when the error rate over 30 minutes reaches unacceptable levels. This number is a percentage between 1 and 99, it defaults to 1%.
* __WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport.error_rate_crit_lvl:__ This configuration option dictates when the error rate over 30 minutes reaches critical levels. This number is a percentage between 1 and 99, it defaults to 5%.
