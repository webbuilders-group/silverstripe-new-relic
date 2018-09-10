<div class="cms-content fill-height flexbox-area-grow center $BaseCSSClasses" data-layout-type="border" data-pjax-fragment="Content">
    <div class="toolbar toolbar--north cms-content-header vertical-align-items">
		<div class="cms-content-header-info flexbox-area-grow vertical-align-items">
			<% include SilverStripe\\Admin\\BackLink_Button %>
            
            <% include SilverStripe\\Admin\\CMSBreadcrumbs %>
		</div>
	</div>
    
    <div class="cms-content-fields center ui-widget-content cms-panel-padded fill-height flexbox-area-grow" data-layout-type="border">
        <div class="cms-content-view">
            <div class="nr-report-wrapper" data-report-data-feed="$Link('overview-data')" data-report-refresh-rate="$RefreshRate"$AttributesHTML>
                <% if not $IsConfigured %>
                    <div class="message error"><%t WebbuildersGroup\\NewRelic\\Control\\Admin\\NewRelicPerformanceReport.API_APP_CONFIG_ERROR "_New Relic API Key or Application ID is missing, check configuration" %></div>
                <% end_if %>
                
                <% loop $Reports %>
                    $forTemplate
                <% end_loop %>
            </div>
            
            <p class="nr-data-provider">
                <%t WebbuildersGroup\\NewRelic\\Control\\Admin\\NewRelicPerformanceReport.DATA_PROVIDED_BY "_Data provided by:" %> <a href="https://www.newrelic.com/" target="_blank"><img src="resources/new-relic/images/new-relic-full.png" alt="New Relic"/></a>
                <br />
                
                <span>
                    <% if $AgentVersion %>
                        <%t WebbuildersGroup\\NewRelic\\Control\\Admin\\NewRelicPerformanceReport.AGENT_VERSION "_Agent Version: {version}" version=$AgentVersion %>
                    <% else %>
                        <%t WebbuildersGroup\\NewRelic\\Control\\Admin\\NewRelicPerformanceReport.AGENT_NOT_INSTALLED "_Agent Not Installed" %>
                    <% end_if %>
                </span>
            </p>
        </div>
    </div>
</div>
