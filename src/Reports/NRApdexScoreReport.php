<?php
namespace WebbuildersGroup\NewRelic\Reports;


class NRApdexScoreReport extends NRReportBase {
    private static $sort_order=4;
    
    /**
     * The value that the average server apdex must reach to flag the graph as warning level
     * @var float
     * @config NRApdexScoreReport.apdex_warn_lvl
     */
    private static $apdex_warn_lvl=0.85;
    
    /**
     * The value that the average server apdex must reach to flag the graph as critical
     * @var float
     * @config NRApdexScoreReport.apdex_crit_lvl
     */
    private static $apdex_crit_lvl=0.7;
    
    /**
     * The value that the average browser apdex must reach to flag the graph as warning level
     * @var float
     * @config NRApdexScoreReport.browser_apdex_warn_lvl
     */
    private static $browser_apdex_warn_lvl=0.85;
    
    /**
     * The value that the average browser apdex must reach to flag the graph as critical
     * @var float
     * @config NRApdexScoreReport.browser_apdex_crit_lvl
     */
    private static $browser_apdex_crit_lvl=0.7;
    
    
    /**
     * Loads any CSS/JS requirements needed for this report
     */
    public function loadRequirements() {}
	
	/**
	 * Gets the apdex warning level from the config
	 * @return float
	 */
	public function getApdexWarnLvl() {
	    return $this->config()->apdex_warn_lvl;
	}
	
	/**
	 * Gets the apdex critical level from the config
	 * @return float
	 */
	public function getApdexCritLvl() {
	    return $this->config()->apdex_crit_lvl;
	}
	
	/**
	 * Gets the browser apdex warning level from the config
	 * @return float
	 */
	public function getBrowserApdexWarnLvl() {
	    return $this->config()->browser_apdex_warn_lvl;
	}
	
	/**
	 * Gets the browser apdex critical level from the config
	 * @return float
	 */
	public function getBrowserApdexCritLvl() {
	    return $this->config()->browser_apdex_crit_lvl;
	}
}
?>