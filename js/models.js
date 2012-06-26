// -------------------------------------------------- The Models ---------------------------------------------------- //

// The Employee Model
directory.models.Employee = Backbone.Model.extend({

    dao: directory.dao.EmployeeDAO,

    initialize: function() {
        this.reports = new directory.models.EmployeeCollection();
        this.reports.managerId = this.id;
    }

});

// The EmployeeCollection Model
directory.models.EmployeeCollection = Backbone.Collection.extend({

    dao: directory.dao.EmployeeDAO,

    model: directory.models.Employee,

    findByName: function(key) {
        var employeeDAO = new directory.dao.EmployeeDAO(directory.db),
            self = this;
        employeeDAO.findByName(key, function(data) {
            self.reset(data);
        });
    }

});
