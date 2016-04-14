(function($) {
    $.entwine('ss.nrintegration', function($) {
        $('.cms-content.NewRelicPerformanceReport .nr-report-wrapper').entwine({
            onadd: function(e) {
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
             * Processes the response from the server
             * @param {object} response Response from the server
             */
            _processData: function(response) {
                initChart();
                
                
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
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-server-response-time').renderGraph(data.HttpDispatcher, response.from, response.to);
                
                
                //Render the graph data for the EndUser
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-browser-load-time').renderGraph(data.EndUser, response.from, response.to);
                
                
                //Render the graph data for the Apdex and EndUser/Apdex
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-apdex').renderGraph({Apdex: data.Apdex, EndUser: data['EndUser/Apdex']}, response.from, response.to);
                
                
                //Render the graph data for the Throughput
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-throughput').renderGraph({HttpDispatcher: data.HttpDispatcher, EndUser: data.EndUser}, response.from, response.to);
                
                
                //Render the graph data for the Errors/all
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-error-rate').renderGraph(data['Errors/all'], response.from, response.to);
            },
            
            /**
             * Handles when an error comes back from request
             * @param {jqXHR} xhr jQuery XHR Response
             * @param {string} status Status text  
             * @param {string} errorThrown HTML Error Text
             */
            _onRetrieveError: function(xhr, status, errorThrown) {
                console.error(xhr, status, errorThrown);
                
                $('.cms-content.NewRelicPerformanceReport .nr-report-graph').addClass('no-data');
            }
        });
        
        
        $('.cms-content.NewRelicPerformanceReport .nr-report-graph').entwine({
            Chart: null,
            
            /**
             * Destroys the chart when unmatched
             */
            onunmatch: function() {
                console.log('unmatch');
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
                $(this).find('.nr-graph-tooltip').hide();
            },
            
            /**
             * Displays the tooltip
             * @param {object} tooltip Tooltip positioning data
             */
            showTooltip: function(tooltip) {
                var tooltipDiv=$(this).find('.nr-graph-tooltip');
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
            }
        });
        
        
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
                                label: 'Server Response Time',
                                fillColor: 'rgba(151,187,205,0.2)',
                                strokeColor: 'rgba(151,187,205,1)',
                                pointColor: 'rgba(151,187,205,1)',
                                pointStrokeColor: '#FFFFFF',
                                pointHighlightFill: '#FFFFFF',
                                pointHighlightStroke: 'rgba(151,187,205,1)',
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
                        return self._formatTime(valuePayload.value);
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
                
                result+=timeDiff+' minute'+(timeDiff>1 ? 's':'')+' from '+fromTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})+' - '+toTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
                result+='<br />'+self._formatTime(point.rawData.values.average_response_time)+' average';
                result+='<br />'+self._formatTime(point.rawData.values.max_response_time)+' maximum';
                result+='<br />'+self._formatTime(point.rawData.values.min_response_time)+' minimum';
                result+='<br />'+point.rawData.values.call_count+' requests';
                
                return result;
            }
        });
        
        
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
                                label: 'Client Response Time',
                                fillColor: 'rgba(220,220,220,0.2)',
                                strokeColor: 'rgba(220,220,220,1)',
                                pointColor: 'rgba(220,220,220,1)',
                                pointStrokeColor: "#FFFFFF",
                                pointHighlightFill: '#FFFFFF',
                                pointHighlightStroke: 'rgba(220,220,220,1)',
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
                        return self._formatTime(valuePayload.value);
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
                
                result+=timeDiff+' minute'+(timeDiff>1 ? 's':'')+' from '+fromTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})+' - '+toTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'});
                result+='<br />'+self._formatTime(point.rawData.values.average_response_time)+' average';
                result+='<br />'+self._formatTime(point.rawData.values.max_response_time)+' maximum';
                result+='<br />'+self._formatTime(point.rawData.values.min_response_time)+' minimum';
                result+='<br />'+point.rawData.values.call_count+' requests';
                
                return result;
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
    }
})(jQuery);