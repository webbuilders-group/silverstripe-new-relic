<?php

use SilverStripe\Core\Config\Config;
use WebbuildersGroup\NewRelic\Control\Admin\NewRelicPerformanceReport;
use WebbuildersGroup\NewRelic\Extensions\NewRelicControllerHook;
use SilverStripe\Control\Controller;
use SilverStripe\Control\Director;
use WebbuildersGroup\NewRelic\Dev\NewRelicErrorLogger;
define('SS_NR_BASE', basename(dirname(__FILE__)));

Config::inst()->update(NewRelicPerformanceReport::class, 'menu_icon', SS_NR_BASE.'/images/new-relic.png');


//Configure new relic monitoring
if(extension_loaded('newrelic')) {
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
    
    
    //New Relic error binders
    if(Director::isLive()|| defined('SS_NR_FORCE_ENABLE_LOGGING')) {
        SS_Log::add_writer(new NewRelicErrorLogger(), SS_Log::NOTICE);
        SS_Log::add_writer(new NewRelicErrorLogger(), SS_Log::WARN);
        SS_Log::add_writer(new NewRelicErrorLogger(), SS_Log::ERR);
    }
}

?>