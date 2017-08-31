(function($) {
    $.entwine('ss.nrintegration', function($) {
        $('.cms-content.NewRelicPerformanceReport .nr-report-wrapper').entwine({
            onadd: function() {
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
            /**
             * Handles rendering the table based on the data
             * @param data Data returned from the api
             */
            renderTable: function(data) {
                var self=$(this);


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


                    //Append the open time
                    row.append($('<td/>').text(this.friendlyDateTime(new Date(incident.opened_at))));


                    //Append the closed time
                    var closedCol=$('<td/>');
                    if(incident.closed_at>incident.opened_at) {
                        closedCol.text(this.friendlyDateTime(new Date(incident.closed_at)));
                    }

                    row.append(closedCol);


                    //Append the duration
                    var durrCol=$('<td/>');
                    if(incident.closed_at>incident.opened_at) {
                        durrCol.text(this.friendlyDuration(incident.closed_at-incident.opened_at));
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
                        (date.getHours()>11 ? date.getHours()-11:date.getHours()+1)+':'+
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
                        if(response.error) {
                            //Reset the Refresh Timer
                            reportWrapper.resetRefreshTimer();

                            alert('Error Retrieving Incident Details, try again later');
                            return;
                        }

                        if(!response.violations || response.violations.length==0) {
                            //Reset the Refresh Timer
                            reportWrapper.resetRefreshTimer();

                            alert('Could not find details on the Incident');
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
                        dataRow.append($('<td colspan="4"/>').append(dataTable));


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
                                itemRow.append('<td/>');
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
                        }


                        //Append the row
                        self.after(dataRow);

                        //Flag as loaded
                        self.addClass('data-loaded');

                        dataRow.show();
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
                    row.toggle();
                }

                this.toggleClass('open');

                return false;
            }
        });
    });
})(jQuery);
