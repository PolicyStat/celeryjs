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
        options = $.extend({}, Celery.defaultOptions, options);

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

;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('celerygroup', [], function() {
            return factory();
        });
    } else {
        // Browser globals
        root.CeleryGroup = factory();
    }
}(this, function() {
    var CeleryGroup = function(celeryJSOptionList, options) {
        options = $.extend({}, CeleryGroup.defaultOptions, options);
        var offset = 0;

        function wrappedAlways(task) {
            runCeleryJS(celeryJSOptionList.shift());
            options.callbacks.always(task);
        }

        function runCeleryJS(celeryJSOptions) {
            if (typeof celeryJSOptions === 'undefined') {
                return;
            }
            var result = CeleryJS(celeryJSOptions);
            result.always(wrappedAlways);
            result.done(options.callbacks.done);
            result.fail(options.callbacks.fail);
            result.progress(options.callbacks.progress);
            result.then(options.callbacks.then);
        }
        for (var i = 0; i < options.pollConcurrency; i++) {
            setTimeout(function() {
                runCeleryJS(celeryJSOptionList.shift());
            }, offset);
            offset += options.offset;
        }
    };
    CeleryGroup.defaultOptions = {
        callbacks: {
            always: function() {},
            done: function() {},
            fail: function() {},
            progress: function() {},
            then: function() {}
        },
        offset: 510,
        pollConcurrency: 5
    };
    return CeleryGroup;
}));
