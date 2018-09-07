<?php
require_once('Zend/Log/Writer/Abstract.php');

class NewRelicErrorLogger extends Zend_Log_Writer_Abstract {
    public static function factory($config) {
        return new NewRelicErrorLogger($path, $messageType, $extraHeaders);
    }
    
    /**
     * Write the log message to the file path set
     * in this writer.
     */
    public function _write($event) {
        //Ignore Exceptions New Relic Catches these on it's own
        if(preg_match('/Uncaught ([A-Za-z]*)Exception: /', trim($errstr))==true) {
            return;
        }
        
        $errno=$event['message']['errno'];
        $errstr=$event['message']['errstr'];
        $errfile=$event['message']['errfile'];
        $errline=$event['message']['errline'];
        $errcontext=$event['message']['errcontext'];
        
        switch($event['priorityName']) {
            case 'ERR':$errtype='Error';break;
            case 'WARN':$errtype='Warning';break;
            case 'NOTICE':$errtype='Notice';break;
            default:$errtype=$event['priorityName'];
        }
        
        $relfile=Director::makeRelative($errfile);
        if($relfile && $relfile[0]=='/') {
            $relfile=substr($relfile, 1);
        }
        
        //If it's not an exception notice the error
        newrelic_notice_error($errno, "[$errtype] $errstr in $relfile line $errline", $errfile, $errline, $errcontext);
    }
}
?>