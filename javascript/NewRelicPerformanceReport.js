(function($) {
    $.entwine('ss.nrintegration', function($) {
        /**
         * Report init
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-wrapper').entwine({
            RefreshTimer: null,
            
            /**
             * Bootstraps when the wrapper is added to the dom
             */
            onadd: function(e) {
                //Bootstrap Chart.js
                initChart();
                
                var self=$(this);
                
                //Retrieve the data
                $.ajax({
                    url: self.attr('data-report-data-feed'),
                    dataType: 'json',
                    success: function(response) {
                        self._processData(response);
                    },
                    error: function(res, status, xhr) {
                        self._onRetrieveError(res, status, xhr);
                    }
                });
            },
            
            /**
             * Destructor
             */
            onremove: function() {
                //Stop and clear the timer
                var timer=$(this).getRefreshTimer();
                if(timer) {
                    clearTimeout(timer);
                    
                    $(this).setRefreshTimer(null);
                }
            },
            
            /**
             * Processes the response from the server
             * @param {object} response Response from the server
             */
            _processData: function(response) {
                //Verify we have a good response
                if(response.error) {
                    statusMessage(ss.i18n._t('NewRelicPerformanceReport.LOAD_ERROR', '_Failed to retrieve data from New Relic'), 'error');
                    if(console.error) {
                        console.error(response.error.title);
                    }
                    
                    return;
                }
                
                
                /**** Process Response ****/
                var data={
                        'Apdex': false,
                        'EndUser': false,
                        'EndUser/Apdex': false,
                        'HttpDispatcher': false,
                        'Errors/all': false
                    };
                
                //Set the data based on the metrics found
                for(var metric in response.metric_data.metrics_found) {
                    metric=response.metric_data.metrics_found[metric];
                    
                    //Find the metric
                    for(var metricData in response.metric_data.metrics) {
                        metricData=response.metric_data.metrics[metricData];
                        if(metricData.name==metric) {
                            data[metric]=metricData.timeslices;
                            
                            break;
                        }
                    }
                }
                
                
                //Render the graph data for the HttpDispatcher
                //TODO need to check before we call renderGraph() to make sure the report is present
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-server-response-time').renderGraph(data.HttpDispatcher, response.from, response.to);
                
                
                //Render the graph data for the EndUser
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-browser-load-time').renderGraph(data.EndUser, response.from, response.to);
                
                
                //Render the graph data for the Apdex and EndUser/Apdex
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-apdex').renderGraph({Apdex: data.Apdex, EndUser: data['EndUser/Apdex']}, response.from, response.to);
                
                
                //Render the graph data for the Throughput
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-throughput').renderGraph({HttpDispatcher: data.HttpDispatcher, EndUser: data.EndUser}, response.from, response.to);
                
                
                //Render the graph data for the Errors/all
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-error-rate').renderGraph({HttpDispatcher: data.HttpDispatcher, Errors: data['Errors/all']}, response.from, response.to);
                
                
                //Start refresh timer
                this.resetRefreshTimer();
            },
            
            /**
             * Stops the refresh timer
             */
            stopRefreshTimer: function() {
                if(this.getRefreshTimer()) {
                    clearTimeout(this.getRefreshTimer());
                }
            },
            
            /**
             * Resets the refresh timer
             */
            resetRefreshTimer: function() {
                if(this.getRefreshTimer()) {
                    clearTimeout(this.getRefreshTimer());
                }
                
                var self=$(this);
                var refreshRate=parseInt(self.attr('data-report-refresh-rate'));
                self.setRefreshTimer(setTimeout(function() {
                                                    self.refreshData();
                                                }, (refreshRate>120 ? refreshRate+30:300)*1000));
            },
            
            /**
             * Refreshes the data
             */
            refreshData: function() {
                //Stop and clear the timer
                var timer=$(this).getRefreshTimer();
                if(timer) {
                    clearTimeout(timer);
                    
                    $(this).setRefreshTimer(null);
                }
                
                
                var self=$(this);
                
                
                //Reset all graphs
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph').reset();
                
                
                //Retrieve the data
                $.ajax({
                    url: self.attr('data-report-data-feed'),
                    dataType: 'json',
                    success: function(response) {
                        self._processData(response);
                    },
                    error: function(res, status, xhr) {
                        self._onRetrieveError(res, status, xhr);
                    }
                });
            },
            
            /**
             * Handles when an error comes back from request
             * @param {string} errorThrown HTML Error Text
             * @param {string} status Status text  
             * @param {jqXHR} xhr jQuery XHR Response
             */
            _onRetrieveError: function(errorThrown, status, xhr) {
                console.error(xhr, status, errorThrown);
                
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph').addClass('no-data');
            }
        });
        
        
        /**
         * Base Graph Support
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph').entwine({
            Chart: null,
            
            /**
             * Destroys the chart when unmatched
             */
            onunmatch: function() {
                var chart=$(this).getChart();
                
                if(chart) {
                    chart.destroy();
                    $(this).setChart(null);
                }
            },
            
            /**
             * Renders the graph data
             * @param {array} data Data for the graph
             * @param {string} startTime Start time for the data
             * @param {string} endTime End time for the data
             */
            renderGraph: function(data, startTime, endTime) {
                var self=$(this);
                
                self.addClass('no-data');
                
                return;
            },
            
            /**
             * Formats a time in milliseconds for display
             * @param {int} value Time in miliseconds
             * @return {string} Time formatted as [number]ms or [number]s
             */
            _formatTime: function(value) {
                return (value>=1000 ? (+(value/1000).toFixed(2))+'s':value+'ms');
            },
            
            /**
             * Formats a date time into an easy to read string for just the time
             * @param {string} dateTime Time to format
             * @return {string}
             */
            _formatDateTime: function(dateTime) {
                return new Date(dateTime).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
            },
            
            /**
             * Renders the point data into html to be used in the tooltip
             * @param {object} point Point object
             * @return {string}
             */
            tooltipTemplate: function(point) {
                return point.label+': '+point.value;
            },
            
            /**
             * Hides the tooltip
             */
            hideTooltip: function() {
                $(this).find('.nr-report-canvas-wrap .nr-graph-tooltip').hide();
            },
            
            /**
             * Displays the tooltip
             * @param {object} tooltip Tooltip positioning data
             */
            showTooltip: function(tooltip) {
                var tooltipDiv=$(this).find('.nr-report-canvas-wrap .nr-graph-tooltip');
                var leftPos=(tooltip.x-Math.round(tooltipDiv.outerWidth()/2));
                var topPos=(tooltip.y-14-tooltipDiv.outerHeight());
                var wrapper=$(this).find('.nr-report-canvas-wrap');
                tooltipDiv
                        .removeClass('arrow-top')
                        .removeClass('arrow-left')
                        .removeClass('arrow-right')
                        .html(tooltip.text)
                        .show()
                        .css('left', leftPos+'px')
                        .css('top', topPos+'px');
                
                
                //Alignment adjustment
                if(topPos<wrapper.position().top*-1) {
                    tooltipDiv.addClass('arrow-top').css('top', (tooltip.y+14)+'px');
                }
                
                if(leftPos<0) {
                    tooltipDiv
                            .removeClass('arrow-top')
                            .addClass('arrow-left')
                            .css('left', (tooltip.x+14)+'px')
                            .css('top', (tooltip.y-Math.round(tooltipDiv.outerHeight()/2))+'px');
                }else if(leftPos+tooltipDiv.outerWidth()>=wrapper.outerWidth()) {
                    tooltipDiv
                            .removeClass('arrow-top')
                            .addClass('arrow-right')
                            .css('left', (tooltip.x-14-tooltipDiv.outerWidth())+'px')
                            .css('top', (tooltip.y-Math.round(tooltipDiv.outerHeight()/2))+'px');
                }
            },
            
            /**
             * Resets the report
             */
            reset: function() {
                var self=$(this);
                var chart=self.getChart();
                if(chart) {
                    chart.destroy();
                }
                
                
                //Remove the no-data class
                self.removeClass('no-data');
                
                
                //Remove the legend
                self.find('.nr-report-graph-legend').remove();
                
                
                //Remove the alert icon
                self.find('.nr-report-header .nr-report-title .nr-report-alert-icon').remove();
                
                
                //Display the loading spinner
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').show();
            }
        });
        
        
        /**
         * Help Dialog integration
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph .nr-report-help').entwine({
            /**
             * Shows the help text when the user moves over the icon
             */
            onmouseenter: function() {
                var self=$(this);
                var helpText=self.parent().siblings('.nr-report-help-text');
                if(helpText) {
                    var pos=self.position();
                    
                    helpText.show();
                    helpText.css('left', ((pos.left+Math.round(self.outerWidth()/2))-Math.round(helpText.outerWidth()/2))+'px').css('top', (pos.top+self.outerHeight()+8)+'px');
                }
            },
            
            /**
             * Hides the help text when the user moves off of the icon
             */
            onmouseleave: function() {
                var helpText=$(this).parent().siblings('.nr-report-help-text');
                if(helpText) {
                    helpText.hide();
                }
            }
        });
        
        
        /**
         * Server Response Time Graph
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-server-response-time').entwine({
            /**
             * Renders the graph data
             * @param {array} data Data for the graph
             * @param {string} startTime Start time for the data
             * @param {string} endTime End time for the data
             */
            renderGraph: function(timeSlices, startTime, endTime) {
                var self=$(this);
                
                if(!timeSlices) {
                    self.addClass('no-data');
                    
                    return;
                }
                

                self.removeClass('no-data');
                
                var context=self.find('.nr-report-canvas').get(0).getContext('2d');
                var total=0;
                var times=[];
                var chartData=[
                               {
                                label: ss.i18n._t('NewRelicPerformanceReport.SERVER_RESPONSE_TIME', '_Server Response Time'),
                                fillColor: 'rgba(40,112,153,0.2)',
                                strokeColor: 'rgba(40,112,153,1)',
                                pointColor: 'rgba(40,112,153,1)',
                                pointStrokeColor: '#FFFFFF',
                                pointHighlightFill: '#FFFFFF',
                                pointHighlightStroke: 'rgba(40,112,153,1)',
                                data: [],
                                rawData: timeSlices
                            }
                       ];
                
                for(var i=0;i<timeSlices.length;i++) {
                    times.push(self._formatDateTime(timeSlices[i].from));
                    
                    total+=timeSlices[i].values.average_response_time;
                    
                    chartData[0].data.push(timeSlices[i].values.average_response_time);
                }
                
                
                //Calculate Average
                var avg=Math.round(total/timeSlices.length);
                self.find('.nr-server .nr-value').text(self._formatTime(avg));
                
                
                //Init Graph
                var chart=new Chart(context).NRLine({labels: times, datasets: chartData}, {
                    bezierCurve: false,
                    pointHitDetectionRadius: 10,
                    scaleLabel: function(valuePayload) {
                        return '  '+self._formatTime(valuePayload.value);
                    },
                    customTooltips: function(tooltip) {
                        if(!tooltip) {
                            self.hideTooltip();
                            return;
                        }
                        
                        self.showTooltip(tooltip);
                    },
                    tooltipTemplate: function(point) {
                        return self.tooltipTemplate(point);
                    }
                });
                
                //Store the chart object
                self.setChart(chart);
                
                
                //Hide the loading
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();
            },
            
            /**
             * Renders the point data into html to be used in the tooltip
             * @param {object} point Point object
             * @return {string}
             */
            tooltipTemplate: function(point) {
                var self=$(this);
                var result='';
                var toTime=new Date(point.rawData.to);
                var fromTime=new Date(point.rawData.from);
                var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));
                
                result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                result+=ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.AVERAGE_VALUE', '_%s average'), self._formatTime(point.rawData.values.average_response_time));
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.MAX_VALUE', '_%s maximum'), self._formatTime(point.rawData.values.max_response_time));
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.MIN_VALUE', '_%s minimum'), self._formatTime(point.rawData.values.min_response_time));
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.AMOUNT_REQUESTS', '_%s requests'), point.rawData.values.call_count);
                
                return result;
            },
            
            /**
             * Resets the report
             */
            reset: function() {
                $(this).find('.nr-server .nr-value').text(ss.i18n._t('NewRelicPerformanceReport.NOT_AVAILABLE', 'N/A'));
                
                this._super();
            }
        });
        
        
        /**
         * Browser Load Time Graph
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-browser-load-time').entwine({
            /**
             * Renders the graph data
             * @param {array} data Data for the graph
             * @param {string} startTime Start time for the data
             * @param {string} endTime End time for the data
             */
            renderGraph: function(timeSlices, startTime, endTime) {
                var self=$(this);
                
                if(!timeSlices) {
                    self.addClass('no-data');
                    
                    return;
                }
                

                self.removeClass('no-data');
                
                var context=self.find('.nr-report-canvas').get(0).getContext('2d');
                var total=0;
                var times=[];
                var chartData=[
                               {
                                label: 'Visitor Response Time',
                                fillColor: 'rgba(40,112,153,0.2)',
                                strokeColor: 'rgba(40,112,153,1)',
                                pointColor: 'rgba(40,112,153,1)',
                                pointStrokeColor: '#FFFFFF',
                                pointHighlightFill: '#FFFFFF',
                                pointHighlightStroke: 'rgba(40,112,153,1)',
                                data: [],
                                rawData: timeSlices
                            }
                       ];
                
                for(var i=0;i<timeSlices.length;i++) {
                    times.push(self._formatDateTime(timeSlices[i].from));
                    
                    total+=timeSlices[i].values.average_response_time;
                    
                    chartData[0].data.push(timeSlices[i].values.average_response_time);
                }
                
                
                //Calculate Average
                var avg=Math.round(total/timeSlices.length);
                self.find('.nr-browser .nr-value').text(self._formatTime(avg));
                
                var chart=new Chart(context).NRLine({labels: times, datasets: chartData}, {
                    bezierCurve: false,
                    pointHitDetectionRadius: 10,
                    scaleLabel: function(valuePayload) {
                        return '  '+self._formatTime(valuePayload.value);
                    },
                    customTooltips: function(tooltip) {
                        if(!tooltip) {
                            self.hideTooltip();
                            return;
                        }
                        
                        self.showTooltip(tooltip);
                    },
                    tooltipTemplate: function(point) {
                        return self.tooltipTemplate(point);
                    }
                });
                
                
                //Store the chart object
                self.setChart(chart);
                
                
                //Hide the loading
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();
            },
            
            /**
             * Renders the point data into html to be used in the tooltip
             * @param {object} point Point object
             * @return {string}
             */
            tooltipTemplate: function(point) {
                var self=$(this);
                var result='';
                var toTime=new Date(point.rawData.to);
                var fromTime=new Date(point.rawData.from);
                var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));
                
                result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                result+=ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.AVERAGE_VALUE', '_%s average'), self._formatTime(point.rawData.values.average_response_time));
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.MAX_VALUE', '_%s maximum'), self._formatTime(point.rawData.values.max_response_time));
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.MIN_VALUE', '_%s minimum'), self._formatTime(point.rawData.values.min_response_time));
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.AMOUNT_REQUESTS', '_%s requests'), point.rawData.values.call_count);
                
                return result;
            },
            
            /**
             * Resets the report
             */
            reset: function() {
                $(this).find('.nr-browser .nr-value').text(ss.i18n._t('NewRelicPerformanceReport.NOT_AVAILABLE', 'N/A'));
                
                this._super();
            }
        });
        
        
        /**
         * Server and Browser Throughput Graph
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-throughput').entwine({
            /**
             * Renders the graph data
             * @param {array} data Data for the graph
             * @param {string} startTime Start time for the data
             * @param {string} endTime End time for the data
             */
            renderGraph: function(timeSlices, startTime, endTime) {
                var self=$(this);
                
                if(!timeSlices) {
                    self.addClass('no-data');
                    
                    return;
                }
                
                
                self.removeClass('no-data');
                
                
                var context=self.find('.nr-report-canvas').get(0).getContext('2d');
                var times=[];
                var chartData=[];
                var timesLoaded=false;
                
                //Add Server Throughput 
                if(timeSlices.HttpDispatcher!==false) {
                    var setData=[];
                    var total=0;
                    for(var i=0;i<timeSlices.HttpDispatcher.length;i++) {
                        times.push(self._formatDateTime(timeSlices.HttpDispatcher[i].from));
                        setData.push(timeSlices.HttpDispatcher[i].values.call_count);
                        
                        total+=timeSlices.HttpDispatcher[i].values.call_count;
                    }

                    chartData.push({
                        label: ss.i18n._t('NewRelicPerformanceReport.SERVER_REQUESTS', '_Server Requests'),
                        fillColor: 'rgba(40,112,153,0.2)',
                        strokeColor: 'rgba(40,112,153,1)',
                        pointColor: 'rgba(40,112,153,1)',
                        pointStrokeColor: '#FFFFFF',
                        pointHighlightFill: '#FFFFFF',
                        pointHighlightStroke: 'rgba(40,112,153,1)',
                        data: setData,
                        rawData: timeSlices.HttpDispatcher
                    });
                    
                    timesLoaded=true;
                    
                    
                    //Calculate Average
                    var avg=total/timeSlices.HttpDispatcher.length;
                    self.find('.nr-server .nr-value').text(ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.RPM_SHORT_VALUE', '_%srpm'), avg.toFixed(2)));
                }
                
                
                //Add End User time
                if(timeSlices.EndUser!==false) {
                    //Build the set data
                    var setData=[];
                    var total=0;
                    for(var i=0;i<timeSlices.EndUser.length;i++) {
                        if(timesLoaded==false) {
                            times.push(self._formatDateTime(timeSlices.EndUser[i].from));
                        }
                        
                        setData.push(timeSlices.EndUser[i].values.call_count);
                        
                        total+=timeSlices.EndUser[i].values.call_count;
                    }
                    
                    chartData.push({
                        label: ss.i18n._t('NewRelicPerformanceReport.VISITOR_REQUESTS', '_Visitor Requests'),
                        fillColor: 'rgba(146,165,178,0.2)',
                        strokeColor: 'rgba(146,165,178,1)',
                        pointColor: 'rgba(146,165,178,1)',
                        pointStrokeColor: "#FFFFFF",
                        pointHighlightFill: '#FFFFFF',
                        pointHighlightStroke: 'rgba(146,165,178,1)',
                        data: setData,
                        rawData: timeSlices.EndUser
                    });
                    
                    timesLoaded=true;
                    
                    
                    //Calculate Average
                    var avg=total/timeSlices.EndUser.length;
                    self.find('.nr-browser .nr-value').text(ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.RPM_SHORT_VALUE', '_%srpm'), avg.toFixed(2)));
                }
                
                
                var chart=new Chart(context).NRLine({labels: times, datasets: chartData.reverse()}, {
                    bezierCurve: false,
                    pointHitDetectionRadius: 10,
                    legendTemplate: '<ul class="nr-report-graph-legend"><% for (var i=datasets.length-1; i>=0; i--){%><li style="background-color:<%=datasets[i].strokeColor%>;color:<%=datasets[i].pointStrokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
                    scaleLabel: function(valuePayload) {
                        return '  '+parseFloat(valuePayload.value).toFixed(2);
                    },
                    customTooltips: function(tooltip) {
                        if(!tooltip) {
                            self.hideTooltip();
                            return;
                        }
                        
                        self.showTooltip(tooltip);
                    },
                    multiTooltipTemplate: function(point) {
                        return self.tooltipTemplate(point);
                    }
                });
                
                
                //Add the legend
                self.find('.nr-report-canvas-wrap').after(chart.generateLegend());
                
                
                //Store the chart object
                self.setChart(chart);
                
                
                //Hide the loading
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();
            },
            
            /**
             * Displays the tooltip
             * @param {object} tooltip Tooltip positioning data
             */
            showTooltip: function(tooltip) {
                if(tooltip.labels) {
                    tooltip.labels=tooltip.labels.reverse();
                    var i=1;
                    while(i<tooltip.labels.length) {
                        tooltip.labels[i]=tooltip.labels[i].replace(/<span class="time-span">(.*?)<\/span>/, '');
                        
                        i++;
                    }
                    
                    tooltip.text=tooltip.labels.join('<hr/>');
                }
                
                return this._super(tooltip);
            },
            
            /**
             * Renders the point data into html to be used in the tooltip
             * @param {object} point Point object
             * @return {string}
             */
            tooltipTemplate: function(point) {
                var self=$(this);
                var result='';
                var toTime=new Date(point.rawData.to);
                var fromTime=new Date(point.rawData.from);
                var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));
                
                result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                result+='<b>'+point.datasetLabel+'</b>';
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.RPM_VALUE', '_%s rpm'), point.rawData.values.call_count.toFixed(2));
                
                return result;
            },
            
            /**
             * Resets the report
             */
            reset: function() {
                var self=$(this);
                
                self.find('.nr-server .nr-value').text(ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.RPM_SHORT_VALUE', '_%srpm'), '0.00'));
                self.find('.nr-browser .nr-value').text(ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.RPM_SHORT_VALUE', '_%srpm'), '0.00'));
                
                this._super();
            }
        });
        
        
        /**
         * Server Apdex and Browser Apdex Graph
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-apdex').entwine({
            HelpTextSet: false,
            
            /**
             * Renders the graph data
             * @param {array} data Data for the graph
             * @param {string} startTime Start time for the data
             * @param {string} endTime End time for the data
             */
            renderGraph: function(timeSlices, startTime, endTime) {
                var self=$(this);
                
                if(!timeSlices) {
                    self.addClass('no-data');
                    
                    return;
                }
                
                
                self.removeClass('no-data');
                
                
                //Update the help text
                if(self.getHelpTextSet()==false) {
                    var helpText=self.find('.nr-report-header .nr-report-help-text');
                    if(helpText) {
                        var helpContent='<b>'+ss.i18n._t('NewRelicPerformanceReport.SERVER_APDEX', '_Server Apdex')+'</b><br />';
                        var sectionDesc=ss.i18n._t('NewRelicPerformanceReport.SERVER_APDEX_HELP', "Your website's Apdex T-value is set to {{threshold}} seconds. That means requests responding in less than {{threshold}} seconds are satisfying (s), responding between 0.5 seconds and 2.0 seconds are tolerating (t), and responding in more than 2.0 seconds are frustrating (f).");
                        
                        //Replace the server apdex
                        if(timeSlices.Apdex!==false) {
                            sectionDesc=sectionDesc.replace(/\{\{threshold\}\}/g, timeSlices.Apdex[0].values.threshold);
                        }else {
                            sectionDesc=sectionDesc.replace(/\{\{threshold\}\}/g, ss.i18n._t('NewRelicPerformanceReport.NOT_AVAILABLE', 'N/A'));
                        }
                        helpContent+=sectionDesc+'<hr />';
                        
                        
                        helpContent+='<b>'+ss.i18n._t('NewRelicPerformanceReport.VISITOR_APDEX', '_Visitor Apdex')+'</b><br />';
                        sectionDesc=ss.i18n._t('NewRelicPerformanceReport.VISITOR_APDEX_HELP', "Your app's Visitor Apdex T-value is set to {{enduser_threshold}} seconds. That means visitor requests responding in less than {{enduser_threshold}} seconds to the end user are satisfying (s), responding between {{enduser_threshold}} seconds and 28.0 seconds are tolerating (t), and responding in more than 28.0 seconds are frustrating (f).");
                        
                        //Replace the EndUser apdex
                        if(timeSlices.EndUser!==false) {
                            sectionDesc=sectionDesc.replace(/\{\{enduser_threshold\}\}/g, timeSlices.EndUser[0].values.threshold);
                        }else {
                            sectionDesc=sectionDesc.replace(/\{\{enduser_threshold\}\}/g, ss.i18n._t('NewRelicPerformanceReport.NOT_AVAILABLE', 'N/A'));
                        }
                        helpContent+=sectionDesc;
                        
                        helpText.html(helpContent);
                    }
                    
                    self.setHelpTextSet(true);
                }
                
                
                var context=self.find('.nr-report-canvas').get(0).getContext('2d');
                var times=[];
                var chartData=[];
                var timesLoaded=false;
                var alreadyCrit=false;
                
                //Add Server Apdex 
                if(timeSlices.Apdex!==false) {
                    var setData=[];
                    var total=0;
                    for(var i=0;i<timeSlices.Apdex.length;i++) {
                        times.push(self._formatDateTime(timeSlices.Apdex[i].from));
                        setData.push(timeSlices.Apdex[i].values.score);
                        
                        total+=timeSlices.Apdex[i].values.score;
                    }

                    chartData.push({
                        label: ss.i18n._t('NewRelicPerformanceReport.SERVER_APDEX', '_Server Apdex'),
                        fillColor: 'rgba(40,112,153,0.2)',
                        strokeColor: 'rgba(40,112,153,1)',
                        pointColor: 'rgba(40,112,153,1)',
                        pointStrokeColor: '#FFFFFF',
                        pointHighlightFill: '#FFFFFF',
                        pointHighlightStroke: 'rgba(40,112,153,1)',
                        data: setData,
                        rawData: timeSlices.Apdex
                    });
                    
                    timesLoaded=true;
                    
                    
                    //Calculate Average
                    var avg=total/timeSlices.Apdex.length;
                    self.find('.nr-server .nr-value').text(avg.toFixed(2));
                    
                    
                    //Alerting
                    var warnLvl=parseFloat(self.attr('data-warn-lvl'));
                    var critLvl=parseFloat(self.attr('data-crit-lvl'));
                    if(warnLvl>0 && critLvl>0) {
                        var alertIcon=self.find('.nr-report-header .nr-report-title .nr-report-alert-icon');
                        
                        if(avg<=critLvl) {
                            if(alertIcon.length==0) {
                                alertIcon=self.find('.nr-report-header .nr-report-title').append('<span class="nr-report-alert-icon"></span>');
                            }
                            
                            alertIcon.attr('title', ss.i18n._t('NewRelicPerformanceReport.APDEX_CRIT', '_Server Apdex is well below acceptable levels over the last 30 minutes'));
                            self.addClass('nr-report-graph-crit');
                            alreadyCrit=true;
                        }else if(avg<=warnLvl) {
                            if(alertIcon.length==0) {
                                alertIcon=self.find('.nr-report-header .nr-report-title').append('<span class="nr-report-alert-icon"></span>');
                            }
                            
                            alertIcon.attr('title', ss.i18n._t('NewRelicPerformanceReport.APDEX_WARN', '_Server Apdex is below acceptable levels over the last 30 minutes'));
                            self.addClass('nr-report-graph-warn');
                        }
                    }
                }
                
                
                //Add End User time
                if(timeSlices.EndUser!==false) {
                    //Build the set data
                    var setData=[];
                    var total=0;
                    for(var i=0;i<timeSlices.EndUser.length;i++) {
                        if(timesLoaded==false) {
                            times.push(self._formatDateTime(timeSlices.EndUser[i].from));
                        }
                        
                        setData.push(timeSlices.EndUser[i].values.score);
                        
                        total+=timeSlices.EndUser[i].values.score;
                    }
                    
                    chartData.push({
                        label: ss.i18n._t('NewRelicPerformanceReport.VISITOR_APDEX', '_Visitor Apdex'),
                        fillColor: 'rgba(146,165,178,0.2)',
                        strokeColor: 'rgba(146,165,178,1)',
                        pointColor: 'rgba(146,165,178,1)',
                        pointStrokeColor: "#FFFFFF",
                        pointHighlightFill: '#FFFFFF',
                        pointHighlightStroke: 'rgba(146,165,178,1)',
                        data: setData,
                        rawData: timeSlices.EndUser
                    });
                    
                    timesLoaded=true;
                    
                    
                    //Calculate Average
                    var avg=total/timeSlices.EndUser.length;
                    self.find('.nr-browser .nr-value').text(avg.toFixed(2));
                    
                    
                    //Alerting
                    var warnLvl=parseFloat(self.attr('data-browser-warn-lvl'));
                    var critLvl=parseFloat(self.attr('data-browser-crit-lvl'));
                    if(warnLvl>0 && critLvl>0) {
                        var alertIcon=self.find('.nr-report-header .nr-report-title .nr-report-alert-icon');
                        
                        if(avg<=critLvl) {
                            if(alertIcon.length==0) {
                                alertIcon=self.find('.nr-report-header .nr-report-title').append('<span class="nr-report-alert-icon"></span>');
                            }
                            
                            var alertIconTitle=alertIcon.attr('title');
                            alertIcon.attr('title', (alertIconTitle ? alertIconTitle+'. ':'')+ss.i18n._t('NewRelicPerformanceReport.BROWSER_APDEX_CRIT', '_End User Apdex is well below acceptable levels over the last 30 minutes'));
                            
                            if(alreadyCrit==false) {
                                self.removeClass('nr-report-graph-warn').addClass('nr-report-graph-crit');
                            }
                        }else if(avg<=warnLvl) {
                            if(alertIcon.length==0) {
                                alertIcon=self.find('.nr-report-header .nr-report-title').append('<span class="nr-report-alert-icon"></span>');
                            }

                            
                            var alertIconTitle=alertIcon.attr('title');
                            alertIcon.attr('title', (alertIconTitle ? alertIconTitle+'. ':'')+ss.i18n._t('NewRelicPerformanceReport.BROWSER_APDEX_WARN', '_End User Apdex is below acceptable levels over the last 30 minutes'));
                            
                            if(alreadyCrit==false) {
                                self.addClass('nr-report-graph-warn');
                            }
                        }
                    }
                }
                
                
                var chart=new Chart(context).NRLine({labels: times, datasets: chartData.reverse()}, {
                    bezierCurve: false,
                    pointHitDetectionRadius: 10,
                    legendTemplate: '<ul class="nr-report-graph-legend"><% for (var i=datasets.length-1; i>=0; i--){%><li style="background-color:<%=datasets[i].strokeColor%>;color:<%=datasets[i].pointStrokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>',
                    scaleLabel: function(valuePayload) {
                        return '  '+parseFloat(valuePayload.value).toFixed(2);
                    },
                    customTooltips: function(tooltip) {
                        if(!tooltip) {
                            self.hideTooltip();
                            return;
                        }
                        
                        self.showTooltip(tooltip);
                    },
                    multiTooltipTemplate: function(point) {
                        return self.tooltipTemplate(point);
                    }
                });
                
                
                //Add the legend
                self.find('.nr-report-canvas-wrap').after(chart.generateLegend());
                
                
                //Store the chart object
                self.setChart(chart);
                
                
                //Hide the loading
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();
            },
            
            /**
             * Displays the tooltip
             * @param {object} tooltip Tooltip positioning data
             */
            showTooltip: function(tooltip) {
                if(tooltip.labels) {
                    tooltip.labels=tooltip.labels.reverse();
                    var i=1;
                    while(i<tooltip.labels.length) {
                        tooltip.labels[i]=tooltip.labels[i].replace(/<span class="time-span">(.*?)<\/span>/, '');
                        
                        i++;
                    }
                    
                    tooltip.text=tooltip.labels.join('<hr/>');
                }
                
                return this._super(tooltip);
            },
            
            /**
             * Renders the point data into html to be used in the tooltip
             * @param {object} point Point object
             * @return {string}
             */
            tooltipTemplate: function(point) {
                var self=$(this);
                var result='';
                var toTime=new Date(point.rawData.to);
                var fromTime=new Date(point.rawData.from);
                var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));
                
                result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                result+='<b>'+point.datasetLabel+'</b>';
                result+='<br />'+point.rawData.values.score.toFixed(2)+' '+self._calculateRating(point.rawData.values.score);
                result+='<br />Sample Size: '+point.rawData.values.count;
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.SATISFIED_VALUE', '_Satisfied: %s'), point.rawData.values.s+' ('+(point.rawData.values.count>0 ? Math.round((point.rawData.values.s/point.rawData.values.count)*100):0)+'%)');
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.TOLERATING_VALUE', '_Tolerating: %s'),point.rawData.values.t+' ('+(point.rawData.values.count>0 ? Math.round((point.rawData.values.t/point.rawData.values.count)*100):0)+'%)');
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.FRUSTRATED_VALUE', '_Frustrated: %s'), point.rawData.values.f+' ('+(point.rawData.values.count>0 ? Math.round((point.rawData.values.f/point.rawData.values.count)*100):0)+'%)');
                
                return result;
            },
            
            /**
             * Resets the report
             */
            reset: function() {
                var self=$(this);
                
                self
                    .removeClass('nr-report-graph-warn')
                    .removeClass('nr-report-graph-crit');
                
                self.find('.nr-server .nr-value').text(ss.i18n._t('NewRelicPerformanceReport.NOT_AVAILABLE', 'N/A'));
                self.find('.nr-browser .nr-value').text(ss.i18n._t('NewRelicPerformanceReport.NOT_AVAILABLE', 'N/A'));
                
                this._super();
            },
            
            /**
             * Gets the friendly apdex rating (i.e Excellent, Good, Fair, etc)
             * @param {float} score Apdex Score
             * @return {string}
             */
            _calculateRating: function(score) {
                if(score>=0.94) {
                    return ss.i18n._t('NewRelicPerformanceReport.APDEX_EXCELLENT', '_Excellent');
                }else if(score>=0.85) {
                    return ss.i18n._t('NewRelicPerformanceReport.APDEX_GOOD', '_Good');
                }else if(score>=0.7) {
                    return ss.i18n._t('NewRelicPerformanceReport.APDEX_FAIR', '_Fair');
                }else if(score>=0.5) {
                    return ss.i18n._t('NewRelicPerformanceReport.APDEX_POOR', '_Poor');
                }else {
                    return ss.i18n._t('NewRelicPerformanceReport.APDEX_UNACCEPTABLE', '_Unacceptable');
                }
            }
        });
        
        
        /**
         * Error Rate Graph
         */
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-error-rate').entwine({
            /**
             * Renders the graph data
             * @param {array} data Data for the graph
             * @param {string} startTime Start time for the data
             * @param {string} endTime End time for the data
             */
            renderGraph: function(timeSlices, startTime, endTime) {
                var self=$(this);
                
                if(!timeSlices.Errors) {
                    self.addClass('no-data');
                    
                    return;
                }
                

                self.removeClass('no-data');
                
                var context=self.find('.nr-report-canvas').get(0).getContext('2d');
                var total=0;
                var reqTotal=0;
                var times=[];
                var chartData=[{
                                label: ss.i18n._t('NewRelicPerformanceReport.ERROR_RATE', '_Error Rate'),
                                fillColor: 'rgba(40,112,153,0.2)',
                                strokeColor: 'rgba(40,112,153,1)',
                                pointColor: 'rgba(40,112,153,1)',
                                pointStrokeColor: '#FFFFFF',
                                pointHighlightFill: '#FFFFFF',
                                pointHighlightStroke: 'rgba(40,112,153,1)',
                                data: [],
                                rawData: []
                           }];
                
                for(var i=0;i<timeSlices.Errors.length;i++) {
                    times.push(self._formatDateTime(timeSlices.Errors[i].from));
                    
                    //Store the call count
                    timeSlices.Errors[i].values.call_count=timeSlices.HttpDispatcher[i].values.call_count;
                    
                    
                    total+=timeSlices.Errors[i].values.error_count;
                    reqTotal+=timeSlices.Errors[i].values.call_count;
                    
                    
                    chartData[0].data.push(((timeSlices.Errors[i].values.error_count/timeSlices.Errors[i].values.call_count)*100).toFixed(3));
                }
                
                
                //Calculate Percentage
                var percentage=((total/reqTotal)*100).toFixed(2);
                self.find('.nr-rate-percent .nr-value').text(percentage+'%');
                
                
                //Alerting
                var warnLvl=parseFloat(self.attr('data-warn-lvl'));
                var critLvl=parseFloat(self.attr('data-crit-lvl'));
                if(warnLvl>0 && critLvl>0) {
                    var alertIcon=self.find('.nr-report-header .nr-report-title .nr-report-alert-icon');
                    
                    if(percentage>=warnLvl) {
                        if(alertIcon.length==0) {
                            alertIcon=self.find('.nr-report-header .nr-report-title').append('<span class="nr-report-alert-icon"></span>');
                        }
                        
                        alertIcon.attr('title', ss.i18n._t('NewRelicPerformanceReport.ERROR_RATE_WARN', '_Error Rate is above acceptable levels over the last 30 minutes'));
                        self.addClass('nr-report-graph-warn').removeClass('nr-report-graph-crit');
                    }else if(percentage>=critLvl) {
                        if(alertIcon.length==0) {
                            alertIcon=self.find('.nr-report-header .nr-report-title').append('<span class="nr-report-alert-icon"></span>');
                        }
                        
                        alertIcon.attr('title', ss.i18n._t('NewRelicPerformanceReport.ERROR_RATE_CRIT', '_Error Rate is well above acceptable levels over the last 30 minutes'));
                        self.removeClass('nr-report-graph-warn').addClass('nr-report-graph-crit');
                    }
                }
                
                
                //Store the raw data
                chartData[0].rawData=timeSlices.Errors;
                
                
                //Init Graph
                var chart=new Chart(context).NRLine({labels: times, datasets: chartData}, {
                    bezierCurve: false,
                    pointHitDetectionRadius: 10,
                    scaleLabel: function(valuePayload) {
                        return '  '+parseFloat(valuePayload.value).toFixed(3)+'%';
                    },
                    customTooltips: function(tooltip) {
                        if(!tooltip) {
                            self.hideTooltip();
                            return;
                        }
                        
                        self.showTooltip(tooltip);
                    },
                    tooltipTemplate: function(point) {
                        return self.tooltipTemplate(point);
                    }
                });
                
                //Store the chart object
                self.setChart(chart);
                
                
                //Hide the loading
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();
            },
            
            /**
             * Renders the point data into html to be used in the tooltip
             * @param {object} point Point object
             * @return {string}
             */
            tooltipTemplate: function(point) {
                var self=$(this);
                var result='';
                var toTime=new Date(point.rawData.to);
                var fromTime=new Date(point.rawData.from);
                var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));
                
                result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.ERROR_RATE_VALUE', '_Error Rate: %s'), ((point.rawData.values.error_count/point.rawData.values.call_count)*100).toFixed(3));
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.ERRORS_PER_MIN', '_Errors Per Minute: %s'), point.rawData.values.errors_per_minute);
                result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.REQUESTS_PER_MIN', '_Requests Per Minute: %s'), point.rawData.values.call_count);
                
                return result;
            },
            
            /**
             * Resets the report
             */
            reset: function() {
                var self=$(this);
                
                self.find('.nr-rate-percent .nr-value').text('0.00%');
                
                this._super();
            }
        });
    });
    
    function initChart() {
        //Set Chart Defaults
        Chart.defaults.global.responsive=true;
        
        Chart.types.Line.extend({
            name: 'NRLine',
            initialize:  function(data){
                //Declare the extension of the default point, to cater for the options passed in to the constructor
                this.PointClass=Chart.Point.extend({
                    offsetGridLines: this.options.offsetGridLines,
                    strokeWidth: this.options.pointDotStrokeWidth,
                    radius: this.options.pointDotRadius,
                    display: this.options.pointDot,
                    hitDetectionRadius: this.options.pointHitDetectionRadius,
                    ctx: this.chart.ctx,
                    inRange: function(mouseX){
                        return (Math.pow(mouseX-this.x, 2) < Math.pow(this.radius + this.hitDetectionRadius,2));
                    },
                    rawData: {}
                });
                
                this.datasets=[];
                
                //Set up tooltip events on the chart
                if(this.options.showTooltips){
                    Chart.helpers.bindEvents(this, this.options.tooltipEvents, function(evt){
                        var activePoints=(evt.type!=='mouseout' ? this.getPointsAtEvent(evt):[]);
                        this.eachPoints(function(point){
                            point.restore(['fillColor', 'strokeColor']);
                        });
                        
                        Chart.helpers.each(activePoints, function(activePoint){
                            activePoint.fillColor=activePoint.highlightFill;
                            activePoint.strokeColor=activePoint.highlightStroke;
                        });
                        
                        this.showTooltip(activePoints);
                    });
                }
                
                //Iterate through each of the datasets, and build this into a property of the chart
                Chart.helpers.each(data.datasets, function(dataset){
                    var datasetObject={
                        label: dataset.label || null,
                        fillColor: dataset.fillColor,
                        strokeColor: dataset.strokeColor,
                        pointColor: dataset.pointColor,
                        pointStrokeColor: dataset.pointStrokeColor,
                        points: []
                    };
                    
                    this.datasets.push(datasetObject);
                    
                    
                    Chart.helpers.each(dataset.data, function(dataPoint, index) {
                        //Add a new point for each piece of data, passing any required data to draw.
                        datasetObject.points.push(new this.PointClass({
                            value: dataPoint,
                            label: data.labels[index],
                            datasetLabel: dataset.label,
                            strokeColor: dataset.pointStrokeColor,
                            fillColor: dataset.pointColor,
                            highlightFill: dataset.pointHighlightFill || dataset.pointColor,
                            highlightStroke: dataset.pointHighlightStroke || dataset.pointStrokeColor,
                            rawData: dataset.rawData[index] || {}
                        }));
                    },this);
                    
                    
                    this.buildScale(data.labels);
                    
                    
                    this.eachPoints(function(point, index){
                        Chart.helpers.extend(point, {
                            x: this.scale.calculateX(index),
                            y: this.scale.endPoint
                        });
                        
                        point.save();
                    }, this);
                },this);
                
                
                this.render();
            },
            addData: function(valuesArray, label) {
                //Map the values array for each of the datasets
                helpers.each(valuesArray, function(valueObj, datasetIndex) {
                    //Add a new point for each piece of data, passing any required data to draw.
                    this.datasets[datasetIndex].points.push(new this.PointClass({
                        value: valueObj.value,
                        label: label,
                        datasetLabel: this.datasets[datasetIndex].label,
                        x: this.scale.calculateX(this.scale.valuesCount+1),
                        y: this.scale.endPoint,
                        strokeColor: this.datasets[datasetIndex].pointStrokeColor,
                        fillColor: this.datasets[datasetIndex].pointColor,
                        rawData: valueObj.rawData
                    }));
                },this);

                this.scale.addXLabel(label);
                //Then re-render the chart.
                this.update();
            }
        });
        
        Chart.defaults.NRLine.legendTemplate='<ul class="nr-report-graph-legend"><% for (var i=0; i<datasets.length; i++){%><li style="background-color:<%=datasets[i].strokeColor%>;color:<%=datasets[i].pointStrokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>';
        
        
        Chart.MultiTooltip = Chart.MultiTooltip.extend({
            initialize: function() {
                this.font = Chart.helpers.fontString(this.fontSize,this.fontStyle,this.fontFamily);

                this.titleFont = Chart.helpers.fontString(this.titleFontSize,this.titleFontStyle,this.titleFontFamily);

                this.titleHeight = 0;
                this.width = 0;
                this.height = 0;
                
                this.ctx.font = this.titleFont;
            }
        });
    }
})(jQuery);