<?php
namespace WebbuildersGroup\NewRelic\Reports;

class NRErrorRateReport extends NRReportBase
{
    private static $sort_order = 5;

    /**
     * The value that the average error rate percentage must reach flag the graph as warning level
     * @var float
     * @config NRErrorRateReport.error_rate_warn_lvl
     */
    private static $error_rate_warn_lvl = 1;

    /**
     * The value that the average error rate percentage must reach flag the graph as critical
     * @var float
     * @config NRErrorRateReport.error_rate_crit_lvl
     */
    private static $error_rate_crit_lvl = 5;


    /**
     * Loads any CSS/JS requirements needed for this report
     */
    public function loadRequirements()
    {
    }

    /**
     * Gets the error rate warning level from the config
     * @return float
     */
    public function getErrorRateWarnLvl()
    {
        return $this->config()->error_rate_warn_lvl;
    }

    /**
     * Gets the error rate critical level from the config
     * @return float
     */
    public function getErrorRateCritLvl()
    {
        return $this->config()->error_rate_crit_lvl;
    }
}
