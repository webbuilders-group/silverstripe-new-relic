<?php
namespace WebbuildersGroup\NewRelic\Reports;

use SilverStripe\View\ViewableData;


abstract class NRReportBase extends ViewableData {
    /**
     * Order the report should appear in the list, lower number is higher on the page
     * @var int
     * @config NRReportBase.sort_order
     */
    private static $sort_order=99;
    
    
    /**
     * Handles rendering into the template
     * @return HTMLText
     */
    public function forTemplate() {
        return $this->renderWith($this->class);
    }
    
    /**
     * Loads any CSS/JS requirements needed for this report
     */
    abstract public function loadRequirements();
    
    /**
     * Gets the sort order for this report
     * @return int
     */
    final public function getSortOrder() {
        return $this->config()->sort_order;
    }
}
?>