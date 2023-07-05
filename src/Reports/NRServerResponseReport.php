<?php
namespace WebbuildersGroup\NewRelic\Reports;

class NRServerResponseReport extends NRReportBase
{
    private static $sort_order = 1;

    /**
     * Loads any CSS/JS requirements needed for this report
     */
    public function loadRequirements()
    {
    }
}
