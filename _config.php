<?php
use SilverStripe\Control\Controller;
use SilverStripe\Control\Director;
use SilverStripe\Core\Config\Config;
use WebbuildersGroup\NewRelic\Extensions\NewRelicControllerHook;


//Configure new relic monitoring
if(extension_loaded('newrelic')) {
    define('SS_NR_AGENT_INSTALLED', true);
    
    //Bind to the controller class
    Controller::add_extension(NewRelicControllerHook::class);
    
    
    //If we have an application name constant ensure New Relic knows what the name is
    if(defined('SS_NR_APPLICATION_NAME')) {
        newrelic_set_appname(SS_NR_APPLICATION_NAME);
    }
    
    
    //If we're in cli make sure New Relic is aware that we are
    if(Director::is_cli()) {
        newrelic_background_job(true);
    }
}
?>