<?php
class NRPerformanceReportExtension extends Extension {
    private static $allowed_actions=array(
                                        'alerts_incidents',
                                        'alerts_violations'
                                    );


    /**
     * Adds extra attributes to the reports container so the alert incidents report knows where to look for the data feed
     */
    public function onAfterInit() {
        $this->owner
                    ->addExtraAttribute('data-alerts-incidents-feed', $this->owner->Link('alerts-incidents'))
                    ->addExtraAttribute('data-alerts-violations-feed', $this->owner->Link('alerts-violations'));
    }

    /**
     * Retrieves the alert incident details
     * @return string
     */
    public function alerts_incidents() {
        //Purge Requirements
        Requirements::clear();


        //If we're not configured properly return an error
        if(!$this->owner->getIsConfigured()) {
            $msg=_t('NewRelicPerformanceReport.API_APP_CONFIG_ERROR', '_New Relic API Key or Application ID is missing, check configuration');
            $e=new SS_HTTPResponse_Exception($msg, 400);
            $e->getResponse()->addHeader('Content-Type', 'text/plain');
            $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
            throw $e;

            return;
        }


        $service=new RestfulService('https://api.newrelic.com/v2/alerts_incidents.json', $this->owner->config()->refresh_rate);
        $service->httpHeader('X-Api-Key:'.Convert::raw2url($this->owner->config()->api_key));
        $service->setQueryString(array(
                                    'only_open'=>'false'
                                ));

        //Perform the request
        $response=$service->request();


        //Retrieve the body
        $body=$response->getBody();
        if(!empty($body)) {
            //If we have policy id's to filter to parse the response for the policies
            $policyIDs=NRAlertIncidentsReport::config()->alerts_policy_ids;
            if(is_array($policyIDs) && count($policyIDs)>0) {
                $body=json_decode($body);
                if(property_exists($body, 'incidents') && is_array($body->incidents)) {
                    $body->incidents=array_filter(
                                                    $body->incidents,
                                                    function($item) use($policyIDs) {
                                                        return (property_exists($item, 'links') && property_exists($item->links, 'policy_id') && in_array($item->links->policy_id, $policyIDs));
                                                    }
                                                );
                    $body->incidents=array_values($body->incidents);
                }

                $body=json_encode($body);
            }

            $this->owner->getResponse()->addHeader('Content-Type', 'application/json; charset=utf-8');
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
     * Retrieves the violations for the given time range and violation ids
     * @return
     */
    public function alerts_violations(SS_HTTPRequest $request) {
        //Purge Requirements
        Requirements::clear();


        //If we're not configured properly return an error
        if(!$this->owner->getIsConfigured()) {
            $msg=_t('NewRelicPerformanceReport.API_APP_CONFIG_ERROR', '_New Relic API Key or Application ID is missing, check configuration');
            $e=new SS_HTTPResponse_Exception($msg, 400);
            $e->getResponse()->addHeader('Content-Type', 'text/plain');
            $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
            throw $e;

            return;
        }


        $startTime=$request->getVar('start_time');
        $endTime=$request->getVar('end_time');
        $violations=explode(',', $request->getVar('violations'));
        if(empty($startTime) || empty($violations) || count($violations)==0) {
            $e=new SS_HTTPResponse_Exception('Missing a start time or violation ids', 400);
            $e->getResponse()->addHeader('Content-Type', 'text/plain');
            $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
            throw $e;

            return;
        }

        //Convert start time from miliseconds to seconds
        if($startTime>0) {
            $startTime=($startTime/1000)-1800;
        }

        //Convert end time from miliseconds to seconds
        if($endTime>0) {
            $endTime=($endTime/1000)+1800;
        }else {
            $endTime=time();
        }


        $service=new RestfulService('https://api.newrelic.com/v2/alerts_violations.json', $this->owner->config()->refresh_rate);
        $service->httpHeader('X-Api-Key:'.Convert::raw2url($this->owner->config()->api_key));
        $service->setQueryString(array(
                                        'start_date'=>gmdate('Y-m-d\TH:i:s+00:00', $startTime),
                                        'end_date'=>gmdate('Y-m-d\TH:i:s+00:00', $endTime),
                                        'only_open'=>'false'
                                    ));

        //Perform the request
        $response=$service->request();


        //Retrieve the body
        $body=$response->getBody();
        if(!empty($body)) {
            $body=json_decode($body);
            if(property_exists($body, 'violations') && is_array($body->violations)) {
                $body->violations=array_filter(
                                            $body->violations,
                                            function($item) use($violations) {
                                                return (property_exists($item, 'id') && in_array($item->id, $violations));
                                            }
                                        );
                $body->violations=array_values($body->violations);
            }

            $body=json_encode($body);

            $this->owner->getResponse()->addHeader('Content-Type', 'application/json; charset=utf-8');
            return $body;
        }


        //Data failed to load
        $msg=_t('NewRelicPerformanceReport.DATA_LOAD_FAIL', '_Failed to retrieve data from New Relic');
        $e=new SS_HTTPResponse_Exception($msg, 400);
        $e->getResponse()->addHeader('Content-Type', 'text/plain');
        $e->getResponse()->addHeader('X-Status', rawurlencode($msg));
        throw $e;
    }
}
