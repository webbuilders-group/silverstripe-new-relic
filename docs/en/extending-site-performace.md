Extending the Site Performance Reports
=================
It's possible to extend the Site Performance section in the cms to display more information then what is provided by default. To do this you can simply create a subclass of ``NRReportBase`` this will get auto loaded into the report. This will require you define a ``loadRequirements`` method which can be used to add additional JavaScript and/or CSS requirements into the page load.

In many cases you will need to add additional server side end points to be able to pull data from the [New Relic API](https://docs.newrelic.com/docs/apis/rest-api-v2). To do that simply add a normal SilverStripe extension to the ``WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport`` class and follow the typical process for adding actions to a controller.


## Custom Report Example
As an example we'll create a report that pulls in Alert incidents from the New Relic Alerts API. Note New Relic Alerts is not available to free accounts, you must have at least one paid service to gain access [see here for details](https://newrelic.com/alerts) which is why this report is not included in the module by default.

### The Report Class
Our report class is mostly for providing a backend for loading a few CSS and JS dependencies and sorting it properly in the list. It also provides a configuration option that let's us filter the incidents based on policy id, used in the controller extension (to find the id of a policy use the [API Explorer](https://rpm.newrelic.com/api/explore/alerts_policies/list)). Note in the example report class below, it is expecting the report's scripts and styles to live in ``mysite`` so if you use this example make sure you adjust the paths to the files accordingly.

```php
<?php
use SilverStripe\View\Requirements;
use WebbuildersGroup\NewRelic\Reports\NRReportBase;

class NRAlertIncidentsReport extends NRReportBase {
    /**
     * Order the report should appear in the list, lower number is higher on the page
     * @var int
     * @config NRAlertIncidentsReport.sort_order
     */
    private static $sort_order=6;

    /**
     * Alert Policy IDs to filter to
     * @var array
     * @config NRAlertsIncidentsReport.alerts_policy_ids
     */
    private static $alerts_policy_ids=array();

    /**
     * Loads any CSS/JS requirements needed for this report
     */
    public function loadRequirements() {
        Requirements::css('mysite/css/NRAlertIncidentsReport.css');
        Requirements::javascript('mysite/javascript/NRAlertIncidentsReport.js');
    }
}
```

### The Report's Template
All report templates must be named the same as their class (so for this example ``NRAlertIncidentsReport.ss``), and they must be created there is no base template. Note the ``nr-report-two-col`` class in the template's wrapping element, this class will make the report appear as a half width report if you remove this class it will be full width. If you do remove that class you may need to play with a fixed height in order to improve the experience.

```html
<div class="nr-report-graph nr-report-two-col nr-alerts-incidents loading">
    <div class="nr-report-header">
        <div class="nr-report-title">Alert Incidents</div>
    </div>

    <div class="nr-report-ratio">
        <div class="nr-report-inner">
            <div class="nr-report-table-wrap data-loading">
                <table class="nr-report-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Opened</th>
                            <th>Closed</th>
                            <th>Duration</th>
                        </tr>
                    </thead>

                    <tbody><!-- --></tbody>
                </table>
            </div>
        </div>
    </div>
</div>
```

#### Additional JavaScript and CSS
Our report needs some brains in order to get things going when the page loads. To do this we hook into the existing API's so it refreshes along with the other default components and it also renders the data when it's returned. The key information hooks for building your own widget are tapping into the ``.nr-report-wrapper``'s ``onadd`` and ``refreshData`` methods, these two methods are triggered when the element is added and when the refresh timer goes off respectively. After that its all about making the correct ajax calls and making the UI do what we want it to. Basically the behavior for the UI should be that the top level rows when clicked load the incident's violations, then when a violation is clicked it shows the details of the violation (duration, and threshold). The example's JavaScript [can be found here](_files/NRAlertIncidentsReport.js).

We'll also need a few additional styles to help with the appearance and user experience, there is some styling provided built in for rendering tabular data in a report but we could use a bit more to help the user's experience. he example's stylesheet [can be found here](_files/NRAlertIncidentsReport.css).


#### The Controller Extension
Since we need to load more data from the New Relic API we need to extend the controller to add a few actions as well as some attributes to the Site Performance section's wrapper. She example's controller extension [can be found here](_files/NRPerformanceReportExtension.php). You'll notice in the example file that it uses the API key as configured on ``WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport`` as well as the same cache refresh time which is also configured on the ``WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport`` class. This is so that we're not duplicating where the api key exists and also using the same refresh timer as the page it self, though you do not have to do either.

After creating your extension for the ``WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport`` controller you as normal will need to bind it to the controller. You can do this through your YAML config for the site.

```yml
WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport:
    extensions:
        - "NRPerformanceReportExtension"
```


### Taking the Example Further
To take the example further you may want to introduce a way to view the specific condition's data at the time of the violation. If it's data that can be placed in a graph [Chart.js](https://github.com/chartjs/Chart.js) is present to render the other graphs so you could use that to render a graph.
