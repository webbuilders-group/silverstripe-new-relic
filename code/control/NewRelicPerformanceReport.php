<?php
class NewRelicPerformanceReport extends LeftAndMain {
    private static $url_segment='site-performance';
    private static $menu_priority=-1;
    private static $menu_title='Site Performance';
    
    private static $allowed_actions=array(
                                        'overview_data'
                                    );
    
    
    /**
     * New Relic Application ID
     * @var int
     * @config NewRelicPerformanceReport.application_id
     * @see https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/finding-product-id#apm
     */
    private static $application_id;
    
    /**
     * New Relic API Key
     * @var string
     * @config NewRelicPerformanceReport.api_key
     * @see https://docs.newrelic.com/docs/apis/rest-api-v2/requirements/api-keys
     */
    private static $api_key;
    
    /**
     * Time in seconds to refresh the cache and client
     * @var int
     * @config NewRelicPerformanceReport.refresh_rate
     */
    private static $refresh_rate=300;
    
    /**
     * The value that the average server apdex must reach to flag the graph as warning level
     * @var float
     * @config NewRelicPerformanceReport.apdex_warn_lvl
     */
    private static $apdex_warn_lvl=0.85;
    
    /**
     * The value that the average server apdex must reach to flag the graph as critical
     * @var float
     * @config NewRelicPerformanceReport.apdex_crit_lvl
     */
    private static $apdex_crit_lvl=0.7;
    
    /**
     * The value that the average error rate percentage must reach flag the graph as warning level
     * @var float
     * @config NewRelicPerformanceReport.error_rate_warn_lvl
     */
    
    private static $error_rate_warn_lvl=1;
    
    /**
     * The value that the average error rate percentage must reach flag the graph as critical
     * @var float
     * @config NewRelicPerformanceReport.error_rate_crit_lvl
     */
    private static $error_rate_crit_lvl=5;
    
    
    private static $casting=array(
                                'RefreshRate'=>'Int'
                            );
    
    
    public function init() {
        parent::init();

        Requirements::css(SS_NR_BASE.'/css/NewRelicPerformanceReport.css');
        
        Requirements::add_i18n_javascript(SS_NR_BASE.'/javascript/lang');
        Requirements::javascript(SS_NR_BASE.'/javascript/NewRelicPerformanceReport.js');
        Requirements::javascript(SS_NR_BASE.'/thirdparty/nnnick/chart-js/chart.min.js');
    }
    
    /**
     * Detects whether the api key and application id is set or not
     * @return {bool} Returns false if either the api key or application id is empty
     */
    public function getIsConfigured() {
        $apiKey=$this->config()->api_key;
        $appID=$this->config()->application_id;
         
        return (!empty($apiKey) && !empty($appID));
    }
    
	/**
	 * Gets the overview data from new relic
	 */
	public function overview_data() {
	    //Purge Requirements
	    Requirements::clear();
	    
	    
	    //If we're not configured properly return an error
	    if(!$this->getIsConfigured()) {
            $msg=_t('NewRelicPerformanceReport.API_APP_CONFIG_ERROR', '_New Relic API Key or Application ID is missing, check configuration');
            $e=new SS_HTTPResponse_Exception($msg, 400);
            $e->getResponse()->addHeader('Content-Type', 'text/plain');
            $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
	        throw $e;
	        
	        return;
	    }
	    
	    
	    //Build the base restful service object
	    $service=new RestfulService('https://api.newrelic.com/v2/applications/'.Convert::raw2url($this->config()->application_id).'/metrics/data.json', $this->config()->refresh_rate);
	    $service->httpHeader('X-Api-Key:'.Convert::raw2url($this->config()->api_key));
	    
	    
	    //Perform the request
	    $response=$service->request('', 'POST', 'names[]=HttpDispatcher&names[]=Apdex&names[]=EndUser/Apdex&names[]=Errors/all&names[]=EndUser&period=60');
	    
	    
	    //Retrieve the body
	    $body=$response->getBody();
	    if(!empty($body)) {
    	    $this->response->addHeader('Content-Type', 'application/json; charset=utf-8');
    	    return $body;
	    }
	    
	    
	    //Data failed to load
	    $msg=_t('NewRelicPerformanceReport.DATA_LOAD_FAIL', '_Failed to retrieve data from New Relic');
	    $e=new SS_HTTPResponse_Exception($msg, 400);
	    $e->getResponse()->addHeader('Content-Type', 'text/plain');
	    $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
	    throw $e;
	}
	
	/**
	 * Gets the refresh rate from the config
	 * @return {int}
	 */
	public function getRefreshRate() {
	    return $this->config()->refresh_rate;
	}
	
	/**
	 * Gets the apdex warning level from the config
	 * @return {float}
	 */
	public function getApdexWarnLvl() {
	    return $this->config()->apdex_warn_lvl;
	}
	
	/**
	 * Gets the apdex critical level from the config
	 * @return {float}
	 */
	public function getApdexCritLvl() {
	    return $this->config()->apdex_crit_lvl;
	}
	
	/**
	 * Gets the error rate warning level from the config
	 * @return {float}
	 */
	public function getErrorRateWarnLvl() {
	    return $this->config()->error_rate_warn_lvl;
	}
	
	/**
	 * Gets the error rate critical level from the config
	 * @return {float}
	 */
	public function getErrorRateCritLvl() {
	    return $this->config()->error_rate_crit_lvl;
	}
	
	/**
	 * Gets the base folder for the new relic module
	 * @return {string}
	 */
	public function getNRBase() {
	    return SS_NR_BASE;
	}
}
?>