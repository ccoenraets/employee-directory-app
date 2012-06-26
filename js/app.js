// Creating the application namespace
var directory = {
    models: {},
    views: {},
    utils: {},
    dao: {}
};

Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }

    if (this.iscroll) {
        console.log('destroying iscroll');
        this.iscroll.destroy();
        this.iscroll = null;
    }

    console.log('View undelegateEvents');
    this.undelegateEvents();
};

// ----------------------------------------------- The Application Router ------------------------------------------ //

directory.Router = Backbone.Router.extend({

    routes: {
        "":                         "list",
        "list":                     "list",
        "employees/:id":            "employeeDetails",
        "employees/:id/reports":    "directReports",
        "sync":                     "synchronize"
    },

    initialize: function() {

        var self = this;

        // Keep track of the history of pages (we only store the page URL). Used to identify the direction
        // (left or right) of the sliding transition between pages.
        this.pageHistory = [];

        // Register event listener for back button troughout the app
        $('#content').on('click', '.header-back-button', function(event) {
            window.history.back();
            return false;
        });

        // Check of browser supports touch events...
        if (document.documentElement.hasOwnProperty('ontouchstart')) {

            document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);

            // ... if yes: register touch event listener to change the "selected" state of the item
            $('#content').on('touchstart', 'a', function(event) {
                self.selectItem(event);
            });
            $('#content').on('touchend', 'a', function(event) {
                self.deselectItem(event);
            });
        } else {
//            ... if not: register mouse events instead
            $('#content').on('mousedown', 'a', function(event) {
                self.selectItem(event);
            });
            $('#content').on('mouseup', 'a', function(event) {
                self.deselectItem(event);
            });
        }

        // We keep a single instance of the SearchPage and its associated Employee collection throughout the app
        this.searchResults = new directory.models.EmployeeCollection();
        this.searchPage = new directory.views.SearchPage({model: this.searchResults});
        $(this.searchPage.el).attr('id', 'searchPage');
    },

    selectItem: function(event) {
        $(event.target).addClass('tappable-active');
    },

    deselectItem: function(event) {
        $(event.target).removeClass('tappable-active');
    },

    list: function() {
        var self = this;
        this.slidePage(this.searchPage);
    },

    employeeDetails: function(id) {
        var employee = new directory.models.Employee({id: id}),
            self = this;
        employee.fetch({
            success: function(data) {
                self.slidePage(new directory.views.EmployeePage({model: data}).render());
            }
        });
    },

    directReports: function(id) {
        var employee = new directory.models.Employee({id: id});
        employee.reports.fetch();
        this.slidePage(new directory.views.DirectReportPage({model: employee.reports}).render());
    },

    synchronize: function() {
        this.searchResults.reset();
        this.slidePage(new directory.views.SyncPage().render());
    },

    slidePage: function(page) {

        var slideFrom,
            self = this;

        // If there is no current page (app just started) -> No transition: Position new page in the view port
        if (!this.currentPage) {
            $(page.el).attr('class', 'page stage-center');
            $('#content').append(page.el);
            this.pageHistory = [window.location.hash];
            this.currentPage = page;
            return;
        }

        if (this.currentPage !== this.searchPage) {
            this.currentPage.close();
        }

        // Cleaning up: remove old pages that were moved out of the viewport
        $('.stage-right, .stage-left').not('#searchPage').remove();

        if (page === this.searchPage) {
            // Always apply a Back (slide from left) transition when we go back to the search page
            slideFrom = "left";
            $(page.el).attr('class', 'page stage-left');
            // Reinitialize page history
            this.pageHistory = [window.location.hash];
        } else if (this.pageHistory.length > 1 && window.location.hash === this.pageHistory[this.pageHistory.length - 2]) {
            // The new page is the same as the previous page -> Back transition
            slideFrom = "left";
            $(page.el).attr('class', 'page stage-left');
            this.pageHistory.pop();
        } else {
            // Forward transition (slide from right)
            slideFrom = "right";
            $(page.el).attr('class', 'page stage-right');
            this.pageHistory.push(window.location.hash);
        }

        $('#content').append(page.el);

        // Wait until the new page has been added to the DOM...
        setTimeout(function() {
            // Slide out the current page: If new page slides from the right -> slide current page to the left, and vice versa
            $(self.currentPage.el).attr('class', 'page transition ' + (slideFrom === "right" ? 'stage-left' : 'stage-right'));
            // Slide in the new page
            $(page.el).attr('class', 'page stage-center transition');
            self.currentPage = page;
        });

    }

});

$(document).ready(function() {
    directory.db = window.openDatabase("EmployeeDB", "1.0", "Employee Demo DB", 200000);
    var employeeDAO = new directory.dao.EmployeeDAO(directory.db);
    employeeDAO.initialize(function() {
        directory.utils.templateLoader.load(['search-page', 'report-page', 'employee-page', 'employee-list-item', 'sync-page'],
            function() {
                directory.app = new directory.Router();
                Backbone.history.start();
            });
    });
});