########
celeryjs
########

JavaScript module
for asynchronously handling
Celery task results
from the browser.

Requirements
############

At least jQuery 1.5.
Not tested in jQuery 2.0.

How it works
############

``celeryjs``
uses a combination of
``setTimeout``
and
``setInterval``
with
`jQuery.ajax <http://api.jquery.com/jQuery.ajax/>`_
and
`Deferred Object <http://api.jquery.com/category/deferred-object/>`_.

Usage
#####

``celeryjs``
exposes a single function
``CeleryJS``
that returns a
`Deferred Object <http://api.jquery.com/category/deferred-object/>`_.

.. code-block:: javascript

    var celery = CeleryJS({
        url: '/task/.../status',
        checkInterval: 3000,  // (default) milliseconds
        ajax: {               // (default) options passed to jQuery.ajax
            cache: false,
            dataType: 'json',
        }
    });
    // Called when task.status is not SUCCESS or FAILURE (e.g. PENDING)
    celery.progress(function(task) {
        updateTaskStatus(task.status);
    });
    // Called when task.status is FAILURE or the ajax request fails
    celery.fail(function(task) {
        displayError(task);
    });
    // Called when task.status is SUCCESS
    celery.done(function(task) {
        displayResult(task.result);
    });
    // Always called
    celery.always(function(task) {
        hideLoadingSpinner();
    });

Celery task status format
#########################

``celeryjs``
expects the URL
that you pass to it
to return a JSON object
that has the format below.

.. code-block:: javascript

    {
        task: {
            status: "SUCCESS"|"FAILURE"|"..."
        }
    }

``task.status``
corresponds to
`AsyncResult.state
<http://celery.readthedocs.org/en/latest/reference/celery.result.html#celery.result.AsyncResult.state>`_.

Additional keys and values may be present.

The above JSON object is
a subset of the format used by
`django-celery <https://github.com/celery/django-celery>`_'s
``celery-task_status`` URL.
