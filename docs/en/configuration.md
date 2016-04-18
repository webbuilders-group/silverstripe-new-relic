Configuration
=================
Most of the configuration for the module is automatic if you have [New Relic's PHP Agent](https://docs.newrelic.com/docs/agents/php-agent/getting-started/new-relic-php) installed on your server and the extension is loaded. However there are a few configuration options:


#### PHP Constants
* __SS_NR_APPLICATION_NAME:__ This constant represents the application name to feed data into New Relic and can be set in either your project's ``_config.php`` or in ``_ss_environment.php``. You probably also want to ensure this is set in web server's configuration layer just in case there are critical issues with SilverStripe and the module does not have or is unable to set the application name. See the [New Relic PHP Agent documentation](https://docs.newrelic.com/docs/agents/php-agent/configuration/php-directory-ini-settings) for more information on how to do this.
* __SS_NR_FORCE_ENABLE_LOGGING:__ By default New Relic will catch most errors in SilverStripe but not all, when the site is in live mode there is a new logger added automatically that looks for any notice, warning or error and ensures it gets relayed to New Relic. If you want to also include this logger in a non-live environment define this constant in either your project's ``_config.php`` or in ``_ss_environment.php``.


#### SilverStripe Configuration Layer
* __NewRelicPerformanceReport.application_id:__ This configuration option is the New Relic Application ID, to find your application id see [this documentation](https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/finding-product-id#apm) from New Relic.
* __NewRelicPerformanceReport.api_key:__ This configuration option is your New Relic API Key, for information on how to retrieve your API key see [this documentation](https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/api-keys) from New Relic.
* __NewRelicPerformanceReport.refresh_rate:__ This configuration option is the time in seconds that the New Relic data is cached for, this defaults to 5 minutes. This time is also sent to the cms visitor that is viewing the performance data for the site, and has 30 seconds added to it for refreshing the display in the ui. Note that New Relic has a delay of 2 minutes for new data from the site, so you probably do not want to set this any lower than that.
