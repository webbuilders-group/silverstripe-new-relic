<div class="cms-content center $BaseCSSClasses" data-layout-type="border" data-pjax-fragment="Content">
    <div class="cms-content-header north">
        <div class="cms-content-header-info">
            <% include CMSBreadcrumbs %>
        </div>
    </div>
    
    <div class="cms-content-fields center cms-panel-padded nr-report-wrapper" data-report-data-feed="$Link('overview-data')" data-report-refresh-rate="$RefreshRate">
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
            
            <div class="nr-report-inner">
                <div class="nr-report-canvas-wrap">
                    <canvas class="nr-report-canvas"></canvas>
                    
                    <div class="nr-graph-tooltip"></div>
                </div>
                
                <div class="cms-content-loading-overlay ui-widget-overlay-light"></div>
                <div class="cms-content-loading-spinner"></div>
            </div>
        </div>
        
        <div class="nr-report-graph nr-report-two-col nr-report-row-end nr-browser-load-time">
            <div class="nr-report-header">
                <div class="nr-report-title">
                    <%t NewRelicPerformanceReport.CLIENT_PAGE_LOAD "_Client Load Time" %>
                </div>
                
                <div class="nr-report-averages">
                    <ul>
                        <li class="nr-browser"><span class="nr-value">N/A</span><span class="nr-label"><%t NewRelicPerformanceReport.AVERAGE "_Average" %></span></li>
                    </ul>
                </div>
            </div>
            
            <div class="nr-report-inner">
                <div class="nr-report-canvas-wrap">
                    <canvas class="nr-report-canvas"></canvas>
                    
                    <div class="nr-graph-tooltip"></div>
                </div>
                
                <div class="cms-content-loading-overlay ui-widget-overlay-light"></div>
                <div class="cms-content-loading-spinner"></div>
            </div>
        </div>
        
        <div class="nr-report-graph nr-report-two-col nr-throughput">
            <div class="nr-report-header">
                <div class="nr-report-title">
                    <%t NewRelicPerformanceReport.THROUGHPUT "_Throughput" %>
                </div>
                
                <div class="nr-report-averages">
                    <ul>
                        <li class="nr-throughput-count"><span class="nr-value">0.00rpm</span><span class="nr-label"><%t NewRelicPerformanceReport.AVERAGE "_Average" %></span></li>
                    </ul>
                </div>
            </div>
            
            <div class="nr-report-inner">
                <div class="nr-report-canvas-wrap">
                    <canvas class="nr-report-canvas"></canvas>
                    
                    <div class="nr-graph-tooltip"></div>
                </div>
                
                <div class="cms-content-loading-overlay ui-widget-overlay-light"></div>
                <div class="cms-content-loading-spinner"></div>
            </div>
        </div>
        
        <div class="nr-report-graph nr-report-two-col nr-report-row-end nr-apdex">
            <div class="nr-report-header">
                <div class="nr-report-title">
                    <%t NewRelicPerformanceReport.APDEX_SCORE "_Apdex Score" %>
                </div>
                
                <div class="nr-report-averages">
                    <ul>
                        <li class="nr-server"><span class="nr-value">N/A</span><span class="nr-label"><%t NewRelicPerformanceReport.SERVER "_Server" %></span></li>
                        <li class="nr-browser"><span class="nr-value">N/A</span><span class="nr-label"><%t NewRelicPerformanceReport.CLIENT "_Client" %></span></li>
                    </ul>
                </div>
            </div>
            
            <div class="nr-report-inner">
                <div class="nr-report-canvas-wrap">
                    <canvas class="nr-report-canvas"></canvas>
                    
                    <div class="nr-graph-tooltip"></div>
                </div>
                
                <div class="cms-content-loading-overlay ui-widget-overlay-light"></div>
                <div class="cms-content-loading-spinner"></div>
            </div>
        </div>
        
        <div class="nr-report-graph nr-report-two-col nr-error-rate">
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
</div>