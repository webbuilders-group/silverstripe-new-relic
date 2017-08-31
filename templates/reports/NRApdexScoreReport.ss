<div class="nr-report-graph nr-report-two-col nr-apdex" data-warn-lvl="$ApdexWarnLvl.ATT" data-crit-lvl="$ApdexCritLvl.ATT" data-browser-warn-lvl="$ApdexWarnLvl.ATT" data-browser-crit-lvl="$ApdexCritLvl.ATT">
    <div class="nr-report-header">
        <div class="nr-report-title">
            <%t NewRelicPerformanceReport.APDEX_SCORE "_Apdex Score" %> <a href="https://docs.newrelic.com/docs/general/apdex" class="nr-report-help" target="_blank"></a>
        </div>
        
        <div class="nr-report-averages">
            <ul>
                <li class="nr-server"><span class="nr-value">N/A</span><span class="nr-label"><%t NewRelicPerformanceReport.SERVER "_Server" %></span></li>
                <li class="nr-browser"><span class="nr-value">N/A</span><span class="nr-label"><%t NewRelicPerformanceReport.VISITOR "_Visitor" %></span></li>
            </ul>
        </div>
        
        <div class="nr-graph-tooltip arrow-top nr-report-help-text"></div>
    </div>
    
    <div class="nr-report-ratio">
        <div class="nr-report-inner">
            <div class="nr-report-canvas-wrap">
                <canvas class="nr-report-canvas"></canvas>
                
                <div class="nr-graph-tooltip"></div>
            </div>
            
            <div class="cms-content-loading-overlay ui-widget-overlay-light"></div>
            <div class="cms-content-loading-spinner"></div>
        </div>
    </div>
</div>