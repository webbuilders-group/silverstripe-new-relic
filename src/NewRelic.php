<?php
namespace WebbuildersGroup\NewRelic;

if (extension_loaded('newrelic')) {
    /**
     * Shim for the config layer to check if the new relic extension is loaded
     */
    class NewRelic
    {
    }
}
