(function($) {
    $.entwine('ss.nrintegration', function($) {
        $('.cms-content.NewRelicPerformanceReport .nr-report-wrapper').entwine({
            onadd: function() {
                this._super();

                //Bootstrap Chart.js
                initChart();

                var self=$(this);


                //Retrieve the data
                $.ajax({
                    url: self.attr('data-alerts-incidents-feed'),
                    dataType: 'json',
                    success: function(response) {
                        self._processAlertsData(response);
                    },
                    error: function(res, status, xhr) {
                        self._onAlertsRetrieveError(res, status, xhr);
                    }
                });
            },

            /**
             * Refreshes the data
             */
            refreshData: function() {
                this._super();

                var self=$(this);

                //Retrieve the data
                $.ajax({
                    url: self.attr('data-alerts-incidents-feed'),
                    dataType: 'json',
                    success: function(response) {
                        self._processAlertsData(response);
                    },
                    error: function(res, status, xhr) {
                        self._onAlertsRetrieveError(res, status, xhr);
                    }
                });
            },

            /**
             * Processes the data received from the api
             * @param response
             */
            _processAlertsData: function(response) {
                //Verify we have a good response
                if(response.error) {
                    statusMessage(ss.i18n._t('NewRelicPerformanceReport.LOAD_ERROR', '_Failed to retrieve data from New Relic'), 'error');
                    if(console.error) {
                        console.error(response.error.title);
                    }

                    return;
                }


                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-alerts-incidents').renderTable(response);
            },

            /**
             * Handles when an error comes back from request
             * @param {string} errorThrown HTML Error Text
             * @param {string} status Status text
             * @param {jqXHR} xhr jQuery XHR Response
             */
            _onAlertsRetrieveError: function(errorThrown, status, xhr) {
                if(console.error) {
                    console.error(errorThrown, status, xhr);
                }

                $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-alerts-incidents').addClass('no-data');
            }
        });

        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-alerts-incidents').entwine({
            Config: {
                policies: [],
                conditions: []
            },

            onadd: function() {
                this.setConfig(JSON.parse(this.closest('.nr-report-wrapper').attr('data-alerts-config')));

                this._super();
            },

            /**
             * Handles rendering the table based on the data
             * @param data Data returned from the api
             */
            renderTable: function(data) {
                var self=$(this);
                var config=this.getConfig();


                if(!data.incidents || data.incidents.length==0) {
                    self.addClass('no-data');
                    return;
                }


                var tableBody=self.find('.nr-report-table-wrap table tbody');
                for(var i=0;i<data.incidents.length;i++) {
                    var incident=data.incidents[i];
                    var row=$('<tr class="incident-row"/>')
                                .attr('data-incident-id', incident.id)
                                .attr('data-opened-at', incident.opened_at)
                                .attr('data-closed-at', incident.closed_at)
                                .attr('data-violations', (incident.links && incident.links.violations.join(',') ? incident.links.violations:''));


                    //Append the id
                    row.append($('<td/>').text(incident.id));


                    //Append the policy name
                    var policyIndex=this.findByProperty(config.policies, 'id', incident.links.policy_id);
                    row.append($('<td/>').text((policyIndex>=0 ? config.policies[policyIndex].name:'')));


                    //Append the open time
                    row.append($('<td/>').text(this.friendlyDateTime(new Date(incident.opened_at))));


                    //Append the closed time
                    var closedCol=$('<td/>');
                    if(incident.closed_at>incident.opened_at) {
                        closedCol.text(this.friendlyDateTime(new Date(incident.closed_at)));
                    }else {
                        closedCol.text('In Progress');
                    }

                    row.append(closedCol);


                    //Append the duration
                    var durrCol=$('<td/>');
                    if(incident.closed_at>incident.opened_at) {
                        durrCol.text(this.friendlyDuration(incident.closed_at-incident.opened_at));
                    }else {
                        durrCol.text(this.friendlyDuration(new Date().getTime()-incident.opened_at));
                    }

                    row.append(durrCol);


                    tableBody.append(row);
                }


                //Show the table
                self.find('.nr-report-table-wrap').removeClass('data-loading');


                //Hide the loading
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();
            },

            /**
             * Resets the report
             */
            reset: function() {
                var self=$(this);


                //Remove the no-data class
                self.removeClass('no-data');


                //Hide the table
                self.find('.nr-report-table-wrap').addClass('data-loading');


                //Remove the table
                self.find('.nr-report-table-wrap table tbody').empty();


                //Display the loading spinner
                self.find('.cms-content-loading-overlay, .cms-content-loading-spinner').show();
            },

            /**
             * Generates a friendly date/time string from the given Date object
             * @param {Date} date Date Object
             * @return {string}
             */
            friendlyDateTime: function(date) {
                var monthNames=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                return monthNames[date.getMonth()]+' '+
                        date.getDate()+', '+
                        date.getFullYear()+' '+
                        (date.getHours()>11 ? date.getHours()-11:(date.getHours()==0 ? '12':date.getHours()))+':'+
                        (date.getMinutes()<10 ? '0'+date.getMinutes():date.getMinutes())+
                        (date.getHours()<11 ? 'am':'pm');
            },

            /**
             * Converts number of milliseconds to a friendly duration in the format d hr m
             * @param {int} milliseconds Time in milliseconds
             * @return {string}
             */
            friendlyDuration: function(milliseconds) {
                var sec_num=milliseconds/1000;
                var days=Math.floor(sec_num/(3600*24));
                var hours=Math.floor((sec_num-(days*(3600*24)))/3600);
                var minutes=Math.floor((sec_num-(days*(3600*24))-(hours*3600))/60);

                return $.trim(
                                (days>0 ? days+'d ':'')+
                                (hours>0 ? hours+'h ':'')+
                                (minutes>0 ? minutes+'m':'')
                            );
            },

            /**
             * Finds a property by
             */
            findByProperty: function(array, attr, value) {
                if(array && array.length>0) {
                    for(var i=0;i<array.length;i++) {
                        if(array[i][attr]===value) {
                            return i;
                        }
                    }
                }

                return -1;
            }
        });

        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-alerts-incidents .nr-report-table-wrap table tbody tr.incident-row').entwine({
            onclick: function(e) {
                if(this.hasClass('data-loaded')) {
                    var row=$('#incident-'+this.attr('data-incident-id'));
                    if(row.length>0) {
                        row.toggle();
                    }

                    this.toggleClass('open');

                    return false;
                }

                var self=this;
                var container=this.closest('.nr-report-graph');
                var reportWrapper=this.closest('.nr-report-wrapper');
                var config=container.getConfig();

                //Stop the refresh timer
                reportWrapper.stopRefreshTimer();


                //Display the loading spinner
                container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').show();

                $.ajax({
                    url: this.closest('.nr-report-wrapper').attr('data-alerts-violations-feed'),
                    data: {
                        start_time: this.attr('data-opened-at'),
                        end_time: this.attr('data-closed-at'),
                        violations: this.attr('data-violations')
                    },
                    dataType: 'json',
                    method: 'post',
                    success: function(response) {
                        if(!response || response.error) {
                            //Reset the Refresh Timer
                            reportWrapper.resetRefreshTimer();

                            alert('Error Retrieving Incident Details, try again later');

                            container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();

                            return;
                        }

                        if(!response.violations || response.violations.length==0) {
                            //Reset the Refresh Timer
                            reportWrapper.resetRefreshTimer();

                            alert('Could not find details on the Incident');

                            container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();

                            return;
                        }


                        var dataRow=$('<tr class="incident-detail-row"/>').attr('id', 'incident-'+self.attr('data-incident-id'));
                        var dataTable=$('<table class="nr-report-table">'+
                                            '<thead>'+
                                                '<tr>'+
                                                    '<th>Violation</th>'+
                                                    '<th>Opened</th>'+
                                                    '<th>Closed</th>'+
                                                '</tr>'+
                                            '</thead>'+
                                        '</table>');
                        var dataTableBody=$('<tbody/>');
                        dataTable.append(dataTableBody);
                        dataRow.append($('<td colspan="5"/>').append(dataTable));


                        for(var i=0;i<response.violations.length;i++) {
                            var item=response.violations[i];
                            var itemRow=$('<tr class="violation-row"/>')
                                                .attr('data-violation-id', item.id)
                                                .addClass(item.priority);


                            itemRow.append($('<td/>').text(item.condition_name).prepend($('<span class="type-flag"/>').text(item.priority)));
                            itemRow.append($('<td/>').text(container.friendlyDateTime(new Date(item.opened_at))));

                            if(item.closed_at && item.closed_at>item.opened_at) {
                                itemRow.append($('<td/>').text(container.friendlyDateTime(new Date(item.closed_at))));
                            }else {
                                itemRow.append('<td class="closed-in-progress">In Progress</td>');
                            }

                            dataTableBody.append(itemRow);


                            var detailsRow=$('<tr class="violation-detail-row"/>').attr('id', 'violation-'+item.id);
                            var detailsTable=$('<table class="nr-report-table">'+
                                                    '<tfoot>'+
                                                        '<tr>'+
                                                            '<th>Duration</th>'+
                                                            '<th>Threshold</th>'+
                                                        '</tr>'+
                                                    '</tfoot>'+
                                                '</table>');
                            var detailsTableBody=$('<tbody/>');
                            detailsTable.append(detailsTableBody);
                            detailsRow.append($('<td colspan="3"/>').append(detailsTable));

                            var detailsItem=$('<tr/>');

                            if(item.closed_at && item.closed_at>item.opened_at) {
                                detailsItem.append($('<td/>').text(container.friendlyDuration(item.closed_at-item.opened_at)));
                            }else {
                                detailsItem.append('<td/>');
                            }

                            detailsItem.append($('<td/>').text(item.label));
                            detailsTable.append(detailsItem);

                            dataTableBody.append(detailsRow);


                            //If the condition can be found then display the option to view the graph
                            if(config.conditions.indexOf(item.links.condition_id)>=0) {
                                detailsTable.find('tfoot').append(
                                                                $('<tr class="alerts-graph-row"/>').append(
                                                                    $('<td colspan="2"/>').append(
                                                                        $('<a href="#" class="view-graph">View Graph</a>')
                                                                            .attr('data-opened-at', item.opened_at)
                                                                            .attr('data-closed-at', item.closed_at)
                                                                            .attr('data-condition-name', item.condition_name)
                                                                            .attr('data-condition-id', item.links.condition_id)
                                                                            .attr('data-condition-product', item.entity.product)
                                                                    )
                                                                )
                                                            );
                            }
                        }


                        //Append the row
                        self.after(dataRow);

                        //Flag as loaded
                        self.addClass('data-loaded');
                        self.addClass('open');


                        //Hide the loading spinner
                        container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();


                        //Reset the Refresh Timer
                        reportWrapper.resetRefreshTimer();
                    },
                    error: function(xhr, status, errorThrown) {
                        if(console.error) {
                            console.error(xhr, status, errorThrown);
                        }

                        //Hide the loading spinner
                        container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();

                        //Reset the Refresh Timer
                        reportWrapper.resetRefreshTimer();

                        alert('Error Retrieving Incident Details, try again later');
                    }
                });

                return false;
            }
        });

        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-alerts-incidents .nr-report-table-wrap table tbody tr.violation-row').entwine({
            onclick: function(e) {
                var row=$('#violation-'+this.attr('data-violation-id'));
                if(row.length>0) {
                    row.toggleClass('open');
                }

                this.toggleClass('open');

                return false;
            }
        });

        $('.cms-content.NewRelicPerformanceReport .nr-report-graph.nr-alerts-incidents .nr-report-table-wrap table tbody tr.violation-detail-row a.view-graph').entwine({
            DialogID: null,

            onclick: function(e) {
                var self=this;
                var container=this.closest('.nr-report-graph');
                var reportWrapper=this.closest('.nr-report-wrapper');

                //Stop the refresh timer
                reportWrapper.stopRefreshTimer();


                //Display the loading spinner
                container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').show();

                var chart;
                var isNRQL=(self.attr('data-condition-product') && self.attr('data-condition-product').toLowerCase()=='nrql');
                $.ajax({
                        url: (isNRQL==false ? reportWrapper.attr('data-alerts-metric-details'):reportWrapper.attr('data-alerts-nrql-data')),
                        dataType: 'json',
                        data: {
                            start_time: self.attr('data-opened-at'),
                            end_time: self.attr('data-closed-at'),
                            condition: self.attr('data-condition-id')
                        },
                        success: function(response) {
                            if(response.error) {
                                //Hide the loading spinner
                                container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();

                                //Reset the Refresh Timer
                                reportWrapper.resetRefreshTimer();

                                alert('Error Retrieving Graph, try again later');
                                return;
                            }


                            //Display the lightbox
                            var dialog=$('#nr-alerts-metric-dialog');
                            if(!dialog.length) {
                                dialog=$('<div class="ss-ui-dialog" id="nr-alerts-metric-dialog"><div class="canvas-wrap"><canvas></canvas><div class="nr-graph-tooltip"><!-- --></div></div></div>');
                                $('body').append(dialog);
                            }

                            var times=[];
                            var metricData=(isNRQL==false ? response.metric_data.metrics[0]:response.timeSeries);
                            var chartData=[
                                           {
                                            label: self.attr('data-condition-name'),
                                            fill: true,
                                            backgroundColor: 'rgba(40,112,153,0.2)',
                                            borderColor: 'rgba(40,112,153,1)',
                                            pointBackgroundColor: 'rgba(40,112,153,1)',
                                            pointBorderColor: '#FFFFFF',
                                            pointHoverBackgroundColor: '#FFFFFF',
                                            pointHoverBorderColor: 'rgba(40,112,153,1)',
                                            xHighlightRange: {
                                                begin: null,
                                                end: null,
                                            },
                                            data: [],
                                            rawData: (isNRQL==false ? metricData.timeslices:metricData)
                                        }
                                   ];

                            var openedAt=(isNRQL==false ? metricData.alert_begin:response.alert_begin);
                            var closedAt=(isNRQL==false ? metricData.alert_end:response.alert_end);
                            if(isNRQL==false) {
                                for(var i=0;i<metricData.timeslices.length;i++) {
                                    var time=self._formatDateTime(metricData.timeslices[i].from);
                                    times.push(time);

                                    if(openedAt==metricData.timeslices[i].from) {
                                        chartData[0].xHighlightRange.begin=i;
                                    }else if(closedAt==metricData.timeslices[i].from) {
                                        chartData[0].xHighlightRange.end=i;
                                    }


                                    if(metricData.name=='EndUser/Apdex' || metricData.name=='Apdex') {
                                        chartData[0].data.push(metricData.timeslices[i].values.score);
                                    }else if(metricData.name=='Errors/All') {
                                        chartData[0].data.push(((timeSlices.Errors[i].values.error_count/timeSlices.Errors[i].values.call_count)*100).toFixed(3));
                                    }else {
                                        if(console.error) {
                                            console.error('Unknown Metric Name: '+metricData.name);
                                        }

                                        //Hide the loading spinner
                                        container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();

                                        //Reset the Refresh Timer
                                        reportWrapper.resetRefreshTimer();

                                        alert('Error Retrieving Graph, try again later');

                                        return;
                                    }
                                }
                            }else {
                                for(var i=0;i<metricData.length;i++) {
                                    var time=self._formatDateTime(metricData[i].beginTimeSeconds);
                                    times.push(time);

                                    if(openedAt==metricData[i].beginTimeSeconds) {
                                        chartData[0].xHighlightRange.begin=i;
                                    }else if(closedAt==metricData[i].beginTimeSeconds) {
                                        chartData[0].xHighlightRange.end=i;
                                    }


                                    chartData[0].data.push(metricData[i].plot_value);
                                }
                            }

                            if(chartData[0].xHighlightRange.begin && !chartData[0].xHighlightRange.end) {
                                chartData[0].xHighlightRange.end=times.length-1;
                            }

                            dialog.nrdialog({
                                            'autoOpen': true,
                                            'maxWidth': 900,
                                            'maxHeight': 800,
                                            'open': function(e, ui) {
                                                var canvas=dialog.find('canvas');
                                                var context=canvas.get(0).getContext('2d');
                                                chart=new Chart(context, {
                                                    type: 'NRHighlightLine',
                                                    data: {labels: times, datasets: chartData},
                                                    options: {
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        legend: {
                                                            display: false
                                                        },
                                                        tooltips: {
                                                            enabled: false,
                                                            mode: 'index',
                                                            position: 'nearest',
                                                            custom: function(tooltip) {
                                                                if(tooltip.opacity==0) {
                                                                    self.hideTooltip();
                                                                    return;
                                                                }

                                                                self.showTooltip(tooltip);
                                                            },
                                                            callbacks: {
                                                                label: function(point, data) {
                                                                    return self.tooltipTemplate(point, data.datasets[point.datasetIndex].rawData[point.index], data.datasets[point.datasetIndex].label, metricData.name, isNRQL);
                                                                }
                                                            }
                                                        },
                                                        animation: {
                                                            duration: 0
                                                        },
                                                        hover: {
                                                            animationDuration: 0
                                                        },
                                                        responsiveAnimationDuration: 0,
                                                        elements: {
                                                            point: {
                                                                radius: 4,
                                                                hitRadius: 6,
                                                            },
                                                            line: {
                                                                tension: 0
                                                            }
                                                        },
                                                        scales: {
                                                            xAxes: [{
                                                                ticks: {
                                                                    autoSkip: false,
                                                                    maxRotation: 90
                                                                }
                                                            }],
                                                            yAxes: [{
                                                                ticks: {
                                                                    autoSkip: false,
                                                                    userCallback: function(tick) {
                                                                        if(metricData.name=='Errors/All') {
                                                                            return '  '+parseFloat(tick).toFixed(3)+'%';
                                                                        }

                                                                        return '  '+parseFloat(tick).toFixed(2);
                                                                    }
                                                                }
                                                            }]
                                                        }
                                                    }
                                                });

                                                canvas.data('chart', chart);
                                            },
                                            'close': function(e, ui) {
                                                //Destroy the graph
                                                if(chart) {
                                                    chart.destroy();
                                                }

                                                dialog.dialog('destroy');
                                                dialog.remove();
                                            }
                                        });


                            //Hide the loading spinner
                            container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();


                            //Reset the Refresh Timer
                            reportWrapper.resetRefreshTimer();
                        },
                        error: function(xhr, status, errorThrown) {
                            if(console.error) {
                                console.error(xhr, status, errorThrown);
                            }

                            //Hide the loading spinner
                            container.find('.cms-content-loading-overlay, .cms-content-loading-spinner').hide();

                            //Reset the Refresh Timer
                            reportWrapper.resetRefreshTimer();

                            alert('Error Retrieving Graph, try again later');
                        }
                    });


                return false;
            },

            /**
             * Renders the point data into html to be used in the tooltip
             * @param {object} point Point object
             * @param {object} rawData Raw data object
             * @param {string} datasetLabel Dataset Label
             * @param {string} metricName Metric Name
             * @param {bool} isNRQL If the condition is NRQL or not
             * @return {string}
             */
            tooltipTemplate: function(point, rawData, datasetLabel, metricName, isNRQL) {
                if(isNRQL) {
                    var self=$(this);
                    var result='';
                    var toTime=new Date(rawData.endTimeSeconds*1000);
                    var fromTime=new Date(rawData.beginTimeSeconds*1000);
                    var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                    var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));

                    result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                    result+='Value: '+point.yLabel;

                    return result;
                }else if(metricName=='Errors/All') {
                    var self=$(this);
                    var result='';
                    var toTime=new Date(rawData.to);
                    var fromTime=new Date(rawData.from);
                    var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                    var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));

                    result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                    result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.ERROR_RATE_VALUE', '_Error Rate: %s'), ((rawData.values.error_count/rawData.values.call_count)*100).toFixed(3));
                    result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.ERRORS_PER_MIN', '_Errors Per Minute: %s'), rawData.values.errors_per_minute);
                    result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.REQUESTS_PER_MIN', '_Requests Per Minute: %s'), rawData.values.call_count);

                    return result;
                }else if(metricName=='EndUser/Apdex' || metricName=='Apdex') {
                    var self=$(this);
                    var result='';
                    var toTime=new Date(rawData.to);
                    var fromTime=new Date(rawData.from);
                    var timeDiff=Math.floor((toTime.getTime()-fromTime.getTime())/60/1000);
                    var timeString=(timeDiff>1 ? ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME_PLURAL', '_%s minutes %s from %s - %s'):ss.i18n._t('NewRelicPerformanceReport.TIME_TO_TIME', '_%s minute %s from %s - %s'));

                    result+='<span class="time-span">'+ss.i18n.sprintf(timeString, timeDiff, self._formatDateTime(fromTime), self._formatDateTime(toTime))+'</span>';
                    result+='<b>'+datasetLabel+'</b>';
                    result+='<br />'+rawData.values.score.toFixed(2)+' '+self._calculateRating(rawData.values.score);
                    result+='<br />Sample Size: '+rawData.values.count;
                    result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.SATISFIED_VALUE', '_Satisfied: %s'), rawData.values.s+' ('+(rawData.values.count>0 ? Math.round((rawData.values.s/rawData.values.count)*100):0)+'%)');
                    result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.TOLERATING_VALUE', '_Tolerating: %s'),rawData.values.t+' ('+(rawData.values.count>0 ? Math.round((rawData.values.t/rawData.values.count)*100):0)+'%)');
                    result+='<br />'+ss.i18n.sprintf(ss.i18n._t('NewRelicPerformanceReport.FRUSTRATED_VALUE', '_Frustrated: %s'), rawData.values.f+' ('+(rawData.values.count>0 ? Math.round((rawData.values.f/rawData.values.count)*100):0)+'%)');

                    return result;
                }

                return point.xLabel+': '+point.yLabel;
            },

            /**
             * Hides the tooltip
             */
            hideTooltip: function() {
                $('#nr-alerts-metric-dialog .nr-graph-tooltip').hide();
            },

            /**
             * Displays the tooltip
             * @param {object} tooltip Tooltip positioning data
             */
            showTooltip: function(tooltip) {
                var tooltipDiv=$('#nr-alerts-metric-dialog .nr-graph-tooltip');
                var wrapper=$('#nr-alerts-metric-dialog');
                var content=[];
                for(var i=0;i<tooltip.body.length;i++) {
                    content.push(tooltip.body[i].lines.join('<br />'));
                }

                content=content.join('<hr />');

                tooltipDiv
                        .removeClass('arrow-top')
                        .removeClass('arrow-left')
                        .removeClass('arrow-right')
                        .html(content)
                        .show();


                var leftPos=(tooltip.caretX-Math.round(tooltipDiv.outerWidth()/2));
                var topPos=(tooltip.caretY-14-tooltipDiv.outerHeight());

                tooltipDiv.css('left', leftPos+'px').css('top', topPos+'px');


                //Alignment adjustment
                if(topPos<wrapper.position().top*-1) {
                    tooltipDiv.addClass('arrow-top').css('top', (tooltip.caretY+12)+'px');
                }

                if(leftPos<0) {
                    tooltipDiv
                            .removeClass('arrow-top')
                            .addClass('arrow-left')
                            .css('left', (tooltip.caretX+14)+'px')
                            .css('top', (tooltip.caretY-Math.round(tooltipDiv.outerHeight()/2))+'px');
                }else if(leftPos+tooltipDiv.outerWidth()>=wrapper.outerWidth()) {
                    tooltipDiv
                            .removeClass('arrow-top')
                            .addClass('arrow-right')
                            .css('left', (tooltip.caretX-14-tooltipDiv.outerWidth())+'px')
                            .css('top', (tooltip.caretY-Math.round(tooltipDiv.outerHeight()/2))+'px');
                }
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
    });

    $.widget("nrui.nrdialog", $.ssui.ssdialog, {
        Chart: null,

        _create: function() {
            $.ui.dialog.prototype._create.call(this);

            if(this.options.dialogExtraClass) this.uiDialog.addClass(this.options.dialogExtraClass);
        },
        open: function() {
            this._resizeCanvas();

            $.ui.dialog.prototype.open.call(this);

            // Resize events
            var self=this;
            $(window).bind('resize.ssdialog', function() {self._resizeCanvas();});
        },
        _resizeCanvas: function() {
            var opts={}, newWidth, newHeight, canvas=this.element.children('canvas');
            if(this.options.widthRatio) {
                newWidth=$(window).width()*this.options.widthRatio;
                if(this.options.minWidth && newWidth<this.options.minWidth) {
                    opts.width=this.options.minWidth;
                }else if(this.options.maxWidth && newWidth>this.options.maxWidth) {
                    opts.width=this.options.maxWidth;
                } else {
                    opts.width=newWidth;
                }
            }

            if(this.options.heightRatio) {
                newHeight=$(window).height()*this.options.heightRatio;
                if(this.options.minHeight && newHeight<this.options.minHeight) {
                    opts.height=this.options.minHeight;
                }else if(this.options.maxHeight && newHeight>this.options.maxHeight) {
                    opts.height=this.options.maxHeight;
                }else {
                    opts.height=newHeight;
                }
            }

            if(!jQuery.isEmptyObject(opts)) {
                this._setOptions(opts);

                // Resize canvas within dialog
                canvas.attr('width', opts.width-parseFloat(this.element.css('paddingLeft'))-parseFloat(this.element.css('paddingRight')));
                canvas.attr('height', opts.height-parseFloat(this.element.css('paddingTop'))-parseFloat(this.element.css('paddingBottom')));

                // Enforce new position
                if(this.options.autoPosition) {
                    this._setOption('position', this.options.position);
                }
            }

            //Update the Chart
            if(canvas.data('chart')) {
                canvas.data('chart').update();
            }
        }
    });


    /**
     * Extends the NR Line chart to allow highlighting
     */
    function initChart() {
        var originalLineDraw=Chart.controllers.line.prototype.draw;
        var originalInitialize=Chart.controllers.line.prototype.initialize;

        // Extend the line chart, in order to override the draw function.
        Chart.controllers.NRHighlightLine=Chart.controllers.line.extend({
            xHighlightRange: null,

            initialize: function(chart) {
                this.xHighlightRange=chart.chart.config.data.datasets[0].xHighlightRange;

                originalInitialize.apply(this, arguments);
            },
            //clear: function() {},
            draw: function() {
                var chart=this.chart;
                // Get the object that determines the region to highlight.
                var xHighlightRange=this.xHighlightRange;


                // If the object exists.
                if(xHighlightRange!==undefined) {
                    var ctx=chart.ctx;

                    var xRangeBegin=xHighlightRange.begin;
                    var xRangeEnd=xHighlightRange.end;

                    var xaxis=chart.scales['x-axis-0'];
                    var yaxis=chart.scales['y-axis-0'];

                    var xRangeBeginPixel=xaxis.getPixelForTick(xRangeBegin);
                    var xRangeEndPixel=xaxis.getPixelForTick(xRangeEnd);

                    ctx.save();

                    // The fill style of the rectangle we are about to fill.
                    ctx.fillStyle='rgba(255, 0, 0, 0.3)';
                    // Fill the rectangle that represents the highlight region. The parameters are the closest-to-starting-point pixel's x-coordinate,
                    // the closest-to-starting-point pixel's y-coordinate, the width of the rectangle in pixels, and the height of the rectangle in pixels, respectively.
                    ctx.fillRect(Math.min(xRangeBeginPixel, xRangeEndPixel), 0, Math.max(xRangeBeginPixel, xRangeEndPixel)-Math.min(xRangeBeginPixel, xRangeEndPixel), yaxis.bottom);

                    ctx.restore();
                }

                // Apply the original draw function for the line chart.
                originalLineDraw.apply(this, arguments);
            }
        });

        Chart.defaults.NRHighlightLine=Chart.defaults.line;
    }
})(jQuery);
