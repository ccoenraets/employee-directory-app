// -------------------------------------------------- Utilities ---------------------------------------------------- //

// The Template Loader. Used to asynchronously load templates located in separate .html files
directory.utils.templateLoader = {

    templates: {},

    load: function(names, callback) {

        var deferreds = [],
            self = this;

        $.each(names, function(index, name) {
            deferreds.push($.get('tpl/' + name + '.html', function(data) {
                self.templates[name] = data;
            }));
        });

        $.when.apply(null, deferreds).done(callback);
    },

    // Get template by name from hash of preloaded templates
    get: function(name) {
        return this.templates[name];
    }

};

function showAlert(message, title) {
    if (navigator.notification) {
        navigator.notification.alert(
            message,
            null, // callback
            title,
            'OK' // Button label
        );
    } else {
        alert(title + ": " + message);
    }
}
