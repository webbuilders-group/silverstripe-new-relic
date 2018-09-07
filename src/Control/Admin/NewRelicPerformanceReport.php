<?php
namespace WebbuildersGroup\NewRelic\Control\Admin;

use SilverStripe\Admin\LeftAndMain;
use SilverStripe\Control\HTTPResponse_Exception;
use SilverStripe\Core\ClassInfo;
use SilverStripe\Core\Convert;
use SilverStripe\ORM\ArrayList;
use SilverStripe\View\Requirements;
use WebbuildersGroup\NewRelic\Api\NRRestfulService;
use WebbuildersGroup\NewRelic\Reports\NRReportBase;


class NewRelicPerformanceReport extends LeftAndMain {
    private static $url_segment='site-performance';
    private static $menu_priority=-0.9;
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
     * Reports removed from the section
     * @var array
     * @config NewRelicPerformanceReport.remove_reports
     */
    private static $remove_reports=array(
                                        NRReportBase::class
                                    );
    
    
    private static $casting=array(
                                'getRefreshRate'=>'Int',
                                'getAttributesHTML'=>'HTMLVarchar'
                            );
    
    private $extraAttributes=array();
    
    
    public function init() {
        parent::init();

        Requirements::css(SS_NR_BASE.'/css/NewRelicPerformanceReport.css');
        
        Requirements::add_i18n_javascript(SS_NR_BASE.'/javascript/lang');
        Requirements::javascript(SS_NR_BASE.'/javascript/NewRelicPerformanceReport.js');
        Requirements::javascript(SS_NR_BASE.'/thirdparty/nnnick/chart-js/chart.min.js');
    }
    
    /**
     * Detects whether the api key and application id is set or not
     * @return bool Returns false if either the api key or application id is empty
     */
    public function getIsConfigured() {
        $apiKey=$this->config()->api_key;
        $appID=$this->config()->application_id;
         
        return (!empty($apiKey) && !empty($appID));
    }
    
    /**
     * Adds an extra attribute to the wrapper
     * @param string $name Name of the attribute
     * @param string $value Value of the attribute
     * @return NewRelicPerformanceReport
     */
    public function addExtraAttribute($name, $value) {
        $this->extraAttributes[$name]=$value;
        return $this;
    }
    
    /**
     * Removes an extra attribute to the wrapper
     * @param string $name Name of the attribute
     * @return NewRelicPerformanceReport
     */
    public function removeExtraAttribute($name) {
        if(array_key_exists($name, $this->extraAttributes)) {
            unset($this->extraAttributes[$name]);
        }
        
        return $this;
    }
    
    /**
     * Gets the extra attributes as HTML
     * @return string
     */
    public function getAttributesHTML() {
        $html='';
        if(count($this->extraAttributes)>0) {
            foreach($this->extraAttributes as $name=>$value) {
                $html.=' '.Convert::raw2att($name).'="'.Convert::raw2att($value).'"';
            }
        }
        
        return $html;
    }
    
	/**
	 * Gets the overview data from new relic
	 */
	public function overview_data() {
	    //Purge Requirements
	    Requirements::clear();
	    
	    
	    //If we're not configured properly return an error
	    if(!$this->getIsConfigured()) {
            $msg=_t('WebbuildersGroup\\NewRelic\\Control\\Admin\\NewRelicPerformanceReport.API_APP_CONFIG_ERROR', '_New Relic API Key or Application ID is missing, check configuration');
            $e=new HTTPResponse_Exception($msg, 400);
            $e->getResponse()->addHeader('Content-Type', 'text/plain');
            $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
	        throw $e;
	        
	        return;
	    }
	    
	    
	    //Build the base restful service object
	    $service=new NRRestfulService('https://api.newrelic.com/v2/applications/'.Convert::raw2url($this->config()->application_id).'/metrics/data.json', $this->config()->refresh_rate);
	    $service->httpHeader('X-Api-Key:'.Convert::raw2url($this->config()->api_key));
	    $service->setQueryString(array(
	                                   'names'=>array(
        	                                           'HttpDispatcher',
        	                                           'Apdex',
        	                                           'EndUser/Apdex',
        	                                           'Errors/all',
        	                                           'EndUser'
	                                               ),
	                                   'period'=>60
	                               ));
	    
	    
	    //Perform the request
	    $response=$service->request();
	    
	    
	    //Retrieve the body
	    $body=$response->getBody();
	    if(!empty($body)) {
    	    $this->response->addHeader('Content-Type', 'application/json; charset=utf-8');
    	    return $body;
	    }
	    
	    
	    //Data failed to load
	    $msg=_t('WebbuildersGroup\\NewRelic\\Control\\Admin\\NewRelicPerformanceReport.DATA_LOAD_FAIL', '_Failed to retrieve data from New Relic');
	    $e=new HTTPResponse_Exception($msg, 400);
	    $e->getResponse()->addHeader('Content-Type', 'text/plain');
	    $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
	    throw $e;
	}
	
	/**
	 * Gets the refresh rate from the config
	 * @return int
	 */
	public function getRefreshRate() {
	    return $this->config()->refresh_rate;
	}
	
	/**
	 * Gets the base folder for the new relic module
	 * @return string
	 */
	public function getNRBase() {
	    return SS_NR_BASE;
	}
	
	/**
	 * Get the reports available in the performance report
	 * @return ArrayList
	 */
	public function getReports() {
	    $reportClasses=array_diff_key(ClassInfo::subclassesFor(NRReportBase::class), array_combine($this->config()->remove_reports, $this->config()->remove_reports));
	    foreach($reportClasses as $key=>$class) {
	        $reportClasses[$key]=$class::create();
	        $reportClasses[$key]->loadRequirements();
	    }
	    
	    return ArrayList::create($reportClasses)->sort('SortOrder');
	}
	
	/**
	 * Gets the version of the installed PHP Agent
	 * @return string
	 */
	public function getAgentVersion() {
	    return phpversion('newrelic');
	}
}
?>