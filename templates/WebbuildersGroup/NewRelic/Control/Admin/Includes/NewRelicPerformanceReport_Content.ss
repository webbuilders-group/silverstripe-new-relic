<div class="cms-content center $BaseCSSClasses" data-layout-type="border" data-pjax-fragment="Content">
    <div class="cms-content-header north">
        <div class="cms-content-header-info">
            <% include CMSBreadcrumbs %>
        </div>
    </div>
    
    <div class="cms-content-fields center cms-panel-padded nr-report-wrapper" data-report-data-feed="$Link('overview-data')" data-report-refresh-rate="$RefreshRate"$AttributesHTML>
        <% if not $IsConfigured %>
            <div class="message error"><%t NewRelicPerformanceReport.API_APP_CONFIG_ERROR "_New Relic API Key or Application ID is missing, check configuration" %></div>
        <% end_if %>
        
        <% loop $Reports %>
            $forTemplate
        <% end_loop %>
        
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