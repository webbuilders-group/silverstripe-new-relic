<?php
//Make sure we have the SS_Report class
if(!class_exists('SS_Report')) return;

class NewRelicPerformanceReport extends LeftAndMain {
    private static $url_segment='site-performance-overview';
    private static $menu_priority=-1;
    private static $menu_title='Site Performance Overview';
    
    private static $allowed_actions=array(
                                        'overview_data'
                                    );
    
    
    /**
     * New Relic Account Number
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
    
    private static $casting=array(
                                'RefreshRate'=>'Int'
                            );
    
    
    public function init() {
        parent::init();

        Requirements::css(SS_NR_BASE.'/css/NewRelicPerformanceReport.css');
        
        Requirements::javascript(SS_NR_BASE.'/javascript/NewRelicPerformanceReport.js');
        Requirements::javascript(SS_NR_BASE.'/thirdparty/nnnick/chart-js/chart.min.js');
    }
    
	/**
	 * Gets the overview data from new relic
	 */
	public function overview_data() {
	    $apiKey=$this->config()->api_key;
	    $appID=$this->config()->application_id;
	    
	    if(empty($apiKey) || empty($appID)) {
            $msg=_t('NewRelicPerformanceReport.API_APP_CONFIG_ERROR', '_New Relic API Key or Application ID is missing, check configuration');
            $e=new SS_HTTPResponse_Exception($msg, 400);
            $e->getResponse()->addHeader('Content-Type', 'text/plain');
            $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
	        throw $e;
	        
	        return;
	    }
	    
	    $service=new RestfulService('https://api.newrelic.com/v2/applications/'.Convert::raw2url($appID).'/metrics/data.json', $this->config()->refresh_rate);
	    $service->httpHeader('X-Api-Key:'.Convert::raw2url($apiKey));
	    
	    $response=$service->request('', 'POST', 'names[]=HttpDispatcher&names[]=Apdex&names[]=EndUser/Apdex&names[]=Errors/all&names[]=EndUser&period=60');
	    
	    
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
	 * Gets the refresh rate from the cache
	 * @return {int}
	 */
	public function getRefreshRate() {
	    return $this->config()->refresh_rate;
	}
}
?>