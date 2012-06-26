// The Employee Data Access Object (DAO). Encapsulates logic (in this case SQL statements) to access employee data.
directory.dao.EmployeeDAO = function(db) {
    this.db = db;
};

_.extend(directory.dao.EmployeeDAO.prototype, {

    findByName: function(key, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT e.id, e.firstName, e.lastName, e.title, e.picture, count(r.id) reportCount " +
                    "FROM employee e LEFT JOIN employee r ON r.managerId = e.id " +
                    "WHERE (e.firstName || ' ' || e.lastName LIKE ?) AND e.deleted <> 1 " +
                    "GROUP BY e.id ORDER BY e.lastName, e.firstName LIMIT 30";
                tx.executeSql(sql, ['%' + key + '%'],
                    function(tx, results) {
                        var len = results.rows.length,
                            employees = [],
                            i = 0;
                        for (; i < len; i = i + 1) {
                            employees[i] = results.rows.item(i);
                        }
                        callback(employees);
                    }
                );
            },
            this.txErrorHandler
        );
    },

    findById: function(id, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT e.id, e.firstName, e.lastName, e.title, e.city, e.officePhone, e.cellPhone, e.email, e.managerId, m.firstName managerFirstName, m.lastName managerLastName, e.picture, count(r.id) reportCount " +
                    "FROM employee e " +
                    "LEFT JOIN employee r ON r.managerId = e.id " +
                    "LEFT JOIN employee m ON e.managerId = m.id " +
                    "WHERE e.id=:id AND e.deleted <> 1";
                tx.executeSql(sql, [id],
                    function(tx, results) {
                        callback(results.rows.length === 1 ? results.rows.item(0) : null);
                    }
                );
            },
            this.txErrorHandler
        );
    },

    findByManager: function(managerId, callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT e.id, e.firstName, e.lastName, e.title, e.picture, count(r.id) reportCount " +
                    "FROM employee e LEFT JOIN employee r ON r.managerId = e.id " +
                    "WHERE e.managerId = ? AND e.deleted <> 1 " +
                    "GROUP BY e.id ORDER BY e.lastName, e.firstName";

                tx.executeSql(sql, [managerId], function(tx, results) {
                    var len = results.rows.length,
                        employees = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        employees[i] = results.rows.item(i);
                    }
                    callback(employees);
                });
            },
            this.txErrorHandler
        );
    },

    // Check if employee table exists
    isInitialized: function(callback) {
        var self = this;
        this.db.transaction(
            function(tx) {
                var sql = "SELECT name FROM sqlite_master WHERE type='table' AND name=:tableName";
                tx.executeSql(sql, ['employee'], function(tx, results) {
                    if (results.rows.length === 1) {
                        console.log('Database is initialized');
                        callback(true);
                    } else {
                        console.log('Database is not initialized');
                        callback(false);
                    }
                });
            },
            this.txErrorHandler
        );
    },

    initialize: function(callback) {
        var self = this;
        this.isInitialized(function(result) {
            if (result) {
                callback();
            } else {
                self.createTable(function() {
                    self.populate(callback);
                });
            }
        });
    },

    // Create Employee table
    createTable: function(callback) {
        var self = this;
        this.db.transaction(
            function(tx) {
                var sql =
                    "CREATE TABLE IF NOT EXISTS employee ( " +
                    "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    "firstName VARCHAR(50), " +
                    "lastName VARCHAR(50), " +
                    "department VARCHAR(50), " +
                    "title VARCHAR(50), " +
                    "managerId INTEGER, " +
                    "city VARCHAR(50), " +
                    "officePhone VARCHAR(50), " +
                    "cellPhone VARCHAR(50), " +
                    "email VARCHAR(50), " +
                    "twitterId VARCHAR(50), " +
                    "blogURL VARCHAR(200), " +
                    "picture VARCHAR(200), " +
                    "deleted INTEGER, " +
                    "lastModified VARCHAR(50))";
                console.log('Creating EMPLOYEE table');
                tx.executeSql(sql);
            },
            this.txErrorHandler,
            function(tx) {
                callback();
            }
        );
    },

    // Populate employee table with ample data for ou-of-the-box experience
    populate: function(callback) {
        this.db.transaction(
            function(tx) {
                console.log('Inserting employees');
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (12,'Steven','Wells',4,'Software Architect','Engineering','617-000-0012','781-000-0012','swells@fakemail.com','Boston, MA','pics/Steven_Wells.jpg','@fakeswells',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (11,'Amy','Jones',5,'Sales Representative','Sales','617-000-0011','781-000-0011','ajones@fakemail.com','Boston, MA','pics/Amy_Jones.jpg','@fakeajones',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (10,'Kathleen','Byrne',5,'Sales Representative','Sales','617-000-0010','781-000-0010','kbyrne@fakemail.com','Boston, MA','pics/Kathleen_Byrne.jpg','@fakekbyrne',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (9,'Gary','Donovan',2,'Marketing','Marketing','617-000-0009','781-000-0009','gdonovan@fakemail.com','Boston, MA','pics/Gary_Donovan.jpg','@fakegdonovan',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (8,'Lisa','Wong',2,'Marketing Manager','Marketing','617-000-0008','781-000-0008','lwong@fakemail.com','Boston, MA','pics/Lisa_Wong.jpg','@fakelwong',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (7,'Paula','Gates',4,'Software Architect','Engineering','617-000-0007','781-000-0007','pgates@fakemail.com','Boston, MA','pics/Paula_Gates.jpg','@fakepgates',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (5,'Ray','Moore',1,'VP of Sales','Sales','617-000-0005','781-000-0005','rmoore@fakemail.com','Boston, MA','pics/Ray_Moore.jpg','@fakermoore',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (6,'Paul','Jones',4,'QA Manager','Engineering','617-000-0006','781-000-0006','pjones@fakemail.com','Boston, MA','pics/Paul_Jones.jpg','@fakepjones',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (3,'Eugene','Lee',1,'CFO','Accounting','617-000-0003','781-000-0003','elee@fakemail.com','Boston, MA','pics/Eugene_Lee.jpg','@fakeelee',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (4,'John','Williams',1,'VP of Engineering','Engineering','617-000-0004','781-000-0004','jwilliams@fakemail.com','Boston, MA','pics/John_Williams.jpg','@fakejwilliams',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (2,'Julie','Taylor',1,'VP of Marketing','Marketing','617-000-0002','781-000-0002','jtaylor@fakemail.com','Boston, MA','pics/Julie_Taylor.jpg','@fakejtaylor',NULL,'2010-06-0319:01:19',0)");
                tx.executeSql("INSERT INTO employee (id,firstName,lastName,managerId,title,department,officePhone,cellPhone,email,city,picture,twitterId,blogURL,lastModified,deleted) VALUES (1,'James','King',0,'President and CEO','Corporate','617-000-0001','781-000-0001','jking@fakemail.com','Boston, MA','pics/James_King.jpg','@fakejking',NULL,'2010-06-0319:01:19',0)");
            },
            this.txErrorHandler,
            function(tx) {
                callback();
            }
        );
    },

    getLastSync: function(callback) {
        this.db.transaction(
            function(tx) {
                var sql = "SELECT MAX(lastModified) as lastSync FROM employee";
                tx.executeSql(sql, this.txErrorHandler,
                    function(tx, results) {
                        var lastSync = results.rows.item(0).lastSync;
                        console.log('Last local timestamp is ' + lastSync);
                        callback(lastSync);
                    }
                );
            }
        );
    },

    sync: function(cbSuccess, cbError) {

        var self = this;
        console.log('Starting synchronization...');
        this.getLastSync(function(lastSync){
            var syncURL = window.localStorage.getItem("syncURL");
            self.getChanges(syncURL, lastSync,
                function (changes) {
                    if (changes.length > 0) {
                        self.applyChanges(changes, cbSuccess, cbError);
                    } else {
                        console.log('Nothing to synchronize');
                        cbSuccess(0);
                    }
                },
                cbError
            );
        });

    },

    getChanges: function(syncURL, modifiedSince, cbSuccess, cbError) {
        console.log("Getting server changes since  " + modifiedSince + " at " + syncURL);
        $.ajax({
            url: syncURL,
            data: {modifiedSince: modifiedSince},
            dataType:"json",
            success:function (data) {
                console.log("The server returned " + data.length + " changes that occurred after " + modifiedSince);
                cbSuccess(data);
            },
            error: function(model, response) {
                cbError("Can't get changes from the server. Make sure you the synchronization endpoint is available.");
            }
        });

    },

    applyChanges: function(employees, cbSuccess, cbError) {
        this.db.transaction(
            function(tx) {
                var l = employees.length;
                var sql =
                    "INSERT OR REPLACE INTO employee " +
                    "(id, firstName, lastName, managerId, title, department, officePhone, cellPhone, email, city, picture, twitterId, blogURL, deleted, lastModified) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                console.log('Inserting or Updating in local database:');
                var e;
                for (var i = 0; i < l; i++) {
                    $('#count').html(i);
                    e = employees[i];
                    console.log(e.id + ' ' + e.firstName + ' ' + e.lastName + ' ' + e.title + ' ' + e.officePhone + ' ' + e.deleted + ' ' + e.lastModified);
                    var params = [e.id, e.firstName, e.lastName, e.managerId, e.title, e.department, e.officePhone, e.cellPhone, e.email, e.city, e.picture, e.twitterId, e.blogURL, e.deleted, e.lastModified];
                    tx.executeSql(sql, params);
                }
                console.log('Synchronization complete (' + l + ' items synchronized)');
                cbSuccess(l);
            },
            function(tx) {
                cbError(tx.message);
            }
        );
    },


    dropTable: function(callback) {
        this.db.transaction(
            function(tx) {
                console.log('Dropping EMPLOYEE table');
                tx.executeSql('DROP TABLE IF EXISTS employee');
            },
            this.txErrorHandler,
            function() {
                console.log('Table employee successfully DROPPED in local SQLite database');
                callback();
            }
        );
    },

    reset: function(callback) {
        var self = this;
        this.dropTable(function() {
           self.createTable(function(){
               callback();
           });
        });
    },

    txErrorHandler: function(tx) {
        showAlert(tx.message, "Transaction Error");
    }

});


// Overriding Backbone's sync method. Replace the default RESTful services-based implementation
// with a simple local database approach.
Backbone.sync = function(method, model, options) {

    var dao = new model.dao(directory.db);

    if (method === "read") {
        if (model.id) {
            dao.findById(model.id, function(data) {
                options.success(data);
            });
        } else if (model.managerId) {
            dao.findByManager(model.managerId, function(data) {
                options.success(data);
            });
        } else {
            dao.findAll(function(data) {
                options.success(data);
            });
        }
    }

};