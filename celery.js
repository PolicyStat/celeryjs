;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('celeryjs', [], function() {
            return factory();
        });
    } else {
        // Browser globals
        root.CeleryJS = factory();
    }
}(this, function() {
    var Celery = function(options) {
        options = $.extend({}, options, Celery.defaultOptions);

        var deferred = $.Deferred();
        var intervalId = null;

        var ajaxOptions = $.extend({}, options.ajax);
        ajaxOptions.url = options.url;

        function handleStatus(data) {
            if (data === null) {
                return;
            }
            var task = data.task;
            if (task === null) {
                return;
            }

            var handler = deferred.notify;
            if (task.status === 'FAILURE') {
                clearInterval(intervalId);
                handler = deferred.reject;
            }
            if (task.status === 'SUCCESS') {
                clearInterval(intervalId);
                handler = deferred.resolve;
            }
            handler(task);
        }

        function checkStatus() {
            var xhr = $.ajax(ajaxOptions);
            xhr.fail(function(data) {
                clearInterval(intervalId);
                deferred.reject(data);
            });
            xhr.done(handleStatus);
        }

        setTimeout(checkStatus, 0);
        intervalId = setInterval(checkStatus, options.checkInterval);

        return deferred;
    };
    Celery.defaultOptions = {
        checkInterval: 3000,
        ajax: {
            cache: false,
            dataType: 'json'
        }
    };
    return Celery;
}));
