<div class="cms-content center $BaseCSSClasses" data-layout-type="border" data-pjax-fragment="Content">
    <div class="cms-content-header north">
        <div class="cms-content-header-info">
            <% include CMSBreadcrumbs %>
        </div>
    </div>
    
    <div class="cms-content-fields center cms-panel-padded nr-report-wrapper" data-report-data-feed="$Link('overview-data')" data-report-refresh-rate="$RefreshRate">
        <% if not $IsConfigured %>
            <div class="message error"><%t NewRelicPerformanceReport.API_APP_CONFIG_ERROR "_New Relic API Key or Application ID is missing, check configuration" %></div>
        <% end_if %>
        
        <div class="nr-report-graph nr-report-two-col nr-server-response-time">
            <div class="nr-report-header">
                <div class="nr-report-title">
                    <%t NewRelicPerformanceReport.SERVER_RESPONSE_TIME "_Server Response Time" %>
                </div>
                
                <div class="nr-report-averages">
                    <ul>
                        <li class="nr-server"><span class="nr-value">N/A</span><span class="nr-label"><%t NewRelicPerformanceReport.AVERAGE "_Average" %></span></li>
                    </ul>
                </div>
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
        
        <div class="nr-report-graph nr-report-two-col nr-report-row-end nr-browser-load-time">
            <div class="nr-report-header">
                <div class="nr-report-title">
                    <%t NewRelicPerformanceReport.VISITOR_PAGE_LOAD "_Visitor Load Time" %>
                </div>
                
                <div class="nr-report-averages">
                    <ul>
                        <li class="nr-browser"><span class="nr-value">N/A</span><span class="nr-label"><%t NewRelicPerformanceReport.AVERAGE "_Average" %></span></li>
                    </ul>
                </div>
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
        
        <div class="nr-report-graph nr-report-two-col nr-throughput">
            <div class="nr-report-header">
                <div class="nr-report-title">
                    <%t NewRelicPerformanceReport.THROUGHPUT "_Throughput" %>
                </div>
                
                <div class="nr-report-averages">
                    <ul>
                        <li class="nr-server"><span class="nr-value"><%t NewRelicPerformanceReport.NO_RPM "_0.00rpm" %></span><span class="nr-label"><%t NewRelicPerformanceReport.SERVER "_Server" %></span></li>
                        <li class="nr-browser"><span class="nr-value"><%t NewRelicPerformanceReport.NO_RPM "_0.00rpm" %></span><span class="nr-label"><%t NewRelicPerformanceReport.VISITOR "_Visitor" %></span></li>
                    </ul>
                </div>
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
        
        <div class="nr-report-graph nr-report-two-col nr-report-row-end nr-apdex" data-warn-lvl="$ApdexWarnLvl.ATT" data-crit-lvl="$ApdexCritLvl.ATT">
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
        
        <div class="nr-report-graph nr-report-two-col nr-error-rate" data-warn-lvl="$ErrorRateWarnLvl.ATT" data-crit-lvl="$ErrorRateCritLvl.ATT">
            <div class="nr-report-header">
                <div class="nr-report-title">
                    <%t NewRelicPerformanceReport.ERROR_RATE "_Error Rate" %>
                </div>
                
                <div class="nr-report-averages">
                    <ul>
                        <li class="nr-rate-percent"><span class="nr-value">0.00%</span></li>
                    </ul>
                </div>
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
        
        
        <p class="nr-data-provider">
            <%t NewRelicPerformanceReport.DATA_PROVIDED_BY "_Data provided by:" %> <a href="http://newrelic.com" target="_blank"><img src="$NRBase/images/new-relic-full.png" alt="New Relic"/></a>
            <br />
            
            <span>
                <% if $AgentVersion %>
                    <%t NewRelicPerformanceReport.AGENT_VERSION "_Agent Version: {version}" version=$AgentVersion %>
                <% else %>
                    <%t NewRelicPerformanceReport.AGENT_NOT_INSTALLED "_Agent Not Installed" %>
                <% end_if %>
            </span>
        </p>
    </div>
</div>