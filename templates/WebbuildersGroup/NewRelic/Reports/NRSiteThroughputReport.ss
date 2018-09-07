<div class="nr-report-graph nr-report-legend-graph nr-report-two-col nr-throughput">
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