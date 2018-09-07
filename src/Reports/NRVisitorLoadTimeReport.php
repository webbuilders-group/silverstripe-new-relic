<?php
namespace WebbuildersGroup\NewRelic\Reports;


class NRVisitorLoadTimeReport extends NRReportBase {
    private static $sort_order=2;
    
    /**
     * Loads any CSS/JS requirements needed for this report
     * 
     */
    public function loadRequirements() {}
}
?>