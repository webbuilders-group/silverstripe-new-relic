<?php
namespace WebbuildersGroup\NewRelic\Extensions;

use SilverStripe\Admin\LeftAndMain;
use SilverStripe\CMS\Controllers\ContentController;
use SilverStripe\Core\Extension;

class NewRelicControllerHook extends Extension
{
    /**
     * Set the transaction name to be the controller plus either init-only or index depending on what happened, if this is a page controller set the page link
     */
    public function onAfterInit()
    {
        $controller = get_class($this->owner);

        if ($this->owner->getResponse()->isFinished()) {
            newrelic_name_transaction("$controller/init-only");
        } else {
            newrelic_name_transaction("$controller/index");
        }


        // Append the page link
        if (class_exists(ContentController::class) && $this->owner instanceof ContentController) {
            newrelic_add_custom_parameter('ssPageLink', $this->owner->Link());
        }


        // Append the SilverStripe Version
        newrelic_add_custom_parameter('silverstripe_version', LeftAndMain::create()->CMSVersionNumber());


        // Append the host name for the server
        newrelic_add_custom_parameter('server_name', @gethostname());
    }

    /**
     * Adjust the transaction name to include the action when one is called
     */
    public function beforeCallActionHandler($request, $action)
    {
        $controller = get_class($this->owner);

        newrelic_name_transaction("$controller/$action");
    }
}
