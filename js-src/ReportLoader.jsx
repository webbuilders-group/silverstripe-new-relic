import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import Loading from 'components/Loading/Loading';

(function($) {
    $.entwine('ss.nrintegration', function($) {
        $('.NewRelicPerformanceReport .nr-report-graph.loading .nr-report-inner').entwine({
            onmatch: function() {
                this._super();
                
                const container = $('<div class="cms-loading-container"/>');
                this.append(container);
                
                ReactDOM.render(
                    <Loading />,
                    container[0]
                );
            },
            onunmatch: function() {
                this._super();
                
                const container = this.find('.cms-loading-container');
                if (container && container.length) {
                    ReactDOM.unmountComponentAtNode(container[0]);
                    container.remove();
                }
            }
        });
    });
})(jQuery);