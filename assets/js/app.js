/**
 * Created by lyudmila on 14.08.16.
 */

var errors = {};
var errors1 = {};
var error_message = '';

var ContactManager = new Marionette.Application();

//Regions-------------------------------------------------------------------------------
ContactManager.addRegions({
    menuRegion: "#menu-region",
    mainRegion: "#main-region"
});

//Models----------------------------------------------------------------------------------

//    ----get book model-----

ContactManager.BookModel = Backbone.Model.extend({
    urlRoot: 'http://bsa_laravel_rest.local/books',
    defaults: {
        title: "",
        author: "",
        year: "",
        genre: "",
        reader: ""
    }
});

//    -----get book collection --------

ContactManager.BooksCollection = Backbone.Collection.extend({
    url: 'http://bsa_laravel_rest.local/books',
    model: ContactManager.BookModel,
    });

var booksCollection_g = new ContactManager.BooksCollection();
booksCollection_g.fetch();

//    ----get user model-----

ContactManager.UserModel = Backbone.Model.extend({
    urlRoot: 'http://bsa_laravel_rest.local/users',
    defaults: {
        firstname: "",
        lastname: "",
        email: ""
    }
});

//    ----get users collection-----

ContactManager.UsersCollection = Backbone.Collection.extend({
    url: 'http://bsa_laravel_rest.local/users',
    model: ContactManager.UserModel
});

var usersCollection_g = new ContactManager.UsersCollection();
usersCollection_g.fetch();

//    ----add_book_model-----

ContactManager.AddBookModel = Backbone.Model.extend({
    urlRoot: 'http://bsa_laravel_rest.local/books',
    defaults: {
        title: "",
        author: "",
        year: "",
        genre: "",
        user_id: ""
    },
    validate: function (attrs, options) {
        errors = {};
        var reAplpha = /^[A-Za-zА-Яа-я]*$/;
        var reYear = /^[0-9]*$/;

        if (attrs.title == '') {
            errors.title = "Title can't be blank";
        }
        if (attrs.author == '') {
            errors.author = "Author can't be blank";
        }
        else if (!reAplpha.test(attrs.author)) {
            errors.author = 'Lastname has to contain only letters';
        }
        if (attrs.genre == '') {
            errors.genre = "Genre can't be blank";
        }
        else if (!reAplpha.test(attrs.genre)) {
            errors.genre = 'Genre has to contain only letters';
        }

        if (attrs.year == '') {
            errors.year = "Year can't be blank";
        }
        else if (!reYear.test(attrs.year)) {
            errors.year = "Year is invalid";
        }
        else if ((attrs.year < 1000) || (attrs.year > 2016)) {
            errors.year = "The year must be at least 1000 and may not be greater than 2016";
        }

    }
});

//    ----add_user_model-----

ContactManager.AddUserModel = Backbone.Model.extend({
    urlRoot: 'http://bsa_laravel_rest.local/users',
    defaults:{
        firstname:"",
        lastname:"",
        email:""
    },
    validate:function (attrs,options) {
        errors1 = {};
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var reAplpha = /^[A-Za-zА-Яа-я]*$/;

        if (!attrs.firstname) {
            errors1.firstname = "FirstName can't be blank";
        }
        if (!attrs.lastname) {
            errors1.lastname = "Lastname can't be blank";
        }
        else if (!reAplpha.test(attrs.lastname)) {
            errors1.lastname = 'Lastname has to contain only letters';
        }

        if (!attrs.email) {
            errors1.email = "Email can't be blank";
        }
        else if (!re.test(attrs.email)) {
            errors1.email = "Email is invalid";
        }
    }
});


//Views------------------------------------------------------------------------------------

//    --------------------------------------Menu-------------------------------------------

ContactManager.MenuView = Marionette.ItemView.extend({
    template: '#menu_template',
    ui: {
        books_menu_href: '#books_menu_href',
        users_menu_href: '#users_menu_href',
        add_book_href: '#add_book_href',
        add_user_href: '#add_user_href'
    },
    events: {
        'click @ui.books_menu_href': 'showBooks',
        'click @ui.users_menu_href': 'showUsers',
        'click @ui.add_book_href': 'addBook',
        'click @ui.add_user_href': 'addUser'
    },
    showBooks: function () {
        var allBooksTableView = new ContactManager.AllBooksTableView({
            collection: booksCollection_g
        });

        ContactManager.mainRegion.show(allBooksTableView);
    },

    showUsers: function () {

        var allUsersTableView = new ContactManager.AllUsersTableView({
            collection: usersCollection_g
        });

        ContactManager.mainRegion.show(allUsersTableView);
    },

    addBook: function () {
        var addbookview = new ContactManager.AddBookView();

        ContactManager.mainRegion.show(addbookview);
    },

    addUser: function () {
        var adduserview = new ContactManager.AddUserView();

        ContactManager.mainRegion.show(adduserview);
    }
});

//    ------------------------------------Books--------------------------------------------------------

ContactManager.AllBooksTableTrView = Marionette.ItemView.extend({
    tagName: 'tr',
    model: ContactManager.BookModel,
    template: '#allBooksTableTrTemplate',
    ui:{
        delete_book_button:'#delete_book_button'
    },
    events:{
        'click @ui.delete_book_button': 'deleteBook'
    },
    deleteBook:function(){
        if(this.model.has('user_id'))
        {
            $.flash('Книга находиться у читателя. Нельзя удалить');
        }
        else {
            this.model.destroy({
                success:function(model, response){
                    $.flash('Вы успешно списали книгу из библиотеки');
                },
                error:function () {
                    $.flash('У вас не получилось списать книгу из библиотеки');
                }
            });
        }
    }
});

ContactManager.AllBooksTableView = Marionette.CompositeView.extend({
    template: '#allBooksTableHeadTemplate',
    tagName: "table",
    className: 'table table-striped table-bordered table-hover',
    childView: ContactManager.AllBooksTableTrView,
});

ContactManager.AddBookView = Marionette.ItemView.extend({
    template: '#add_book_template',
    ui: {
        add_book_button: '#add_book_button'
    },
    events: {
        'click @ui.add_book_button': 'addNewBook'
    },
    addNewBook: function () {
        var addnewbook = new ContactManager.AddBookModel();
        addnewbook.set({
            title: this.$('input[id=addNewTitle]').val(),
            author: this.$('input[id=addNewAuthor]').val(),
            year: this.$('input[id=addNewYear]').val(),
            genre: this.$('input[id=addNewGenre]').val()
        });

        addnewbook.save({}, {
            success: function (x) {
                var id = addnewbook.get('id');
                if (!_.isEmpty(errors)) {
                    error_message = '';
                    for (key in errors) {
                        error_message = error_message + errors[key] + '<br/>';
                    }
                    $.flash(error_message);
                }
                else {
                    $.flash('Вы добавили в библиотеку новую книгу с названием \'' + addnewbook.get('title')+'\'');

                    booksCollection_g.unshift(addnewbook);
                    var allBooksTableView = new ContactManager.AllBooksTableView({
                        collection: booksCollection_g
                    });
                    ContactManager.mainRegion.show(allBooksTableView);
                }
            },
            error: function (x) {
                if (!_.isEmpty(errors)) {
                    error_message = '';
                    for (key in errors) {
                        error_message = error_message + errors[key] + '<br/>';
                    }

                    $.flash(error_message);
                }
            }
        });

    }
});

//    ------------------------------------Users--------------------------------------------------------

ContactManager.AllUsersTableTrView = Marionette.ItemView.extend({
    tagName: 'tr',
    model: ContactManager.UserModel,
    template: '#allUsersTableTrTemplate',
    ui:{
        delete_user_button:'#delete_user_button'
    },
    events:{
        'click @ui.delete_user_button': 'deleteUser'
    },
    deleteUser:function(){
        console.log(this.model);
        var bookmod=booksCollection_g.findWhere({user_id:this.model.id});
        console.log(bookmod);
        if(bookmod!=null)
        {
            $.flash('У читателя есть задолженность по книгам');
        }
        else
        {
            this.model.destroy({
                success:function(model, response){
                    $.flash('Вы успешно выписали читателя из библиотеки');
                },
                error:function () {
                    $.flash('У читателя есть задолженность по книгам');
                }
            })
        }

    }
});

ContactManager.AllUsersTableView = Marionette.CompositeView.extend({
    template: '#allUsersTableHeadTemplate',
    tagName: "table",
    className: 'table table-striped table-bordered table-hover',
    childView: ContactManager.AllUsersTableTrView
});

ContactManager.AddUserView = Marionette.ItemView.extend({
    template: '#add_user_template',
    ui: {
        add_user_button: '#add_user_button'
    },
    events: {
        'click @ui.add_user_button': 'addNewUser'
    },
    addNewUser: function () {
        var addnewuser = new ContactManager.AddUserModel();
        addnewuser.set({
            firstname: this.$('input[id=addNewFirstname]').val(),
            lastname: this.$('input[id=addNewLastname]').val(),
            email: this.$('input[id=addNewEmail]').val()
        });

        addnewuser.save({}, {
            success: function (x) {
                var id = addnewuser.get('id');
                if (!_.isEmpty(errors1)) {
                    error_message = '';
                    for (key in errors1) {
                        error_message = error_message + errors1[key] + '<br/>';
                    }

                    $.flash(error_message);
                }
                else {
                    $.flash('Вы добавили в библиотеку нового пользователя ' + addnewuser.get('firstname')+' '+addnewuser.get('lastname'));

                    usersCollection_g.unshift(addnewuser);
                    var allUsersTableView = new ContactManager.AllUsersTableView({
                        collection: usersCollection_g
                    });
                    ContactManager.mainRegion.show(allUsersTableView);
                }
            },
            error: function(){
                if (!_.isEmpty(errors1)) {
                    error_message = '';
                    for (key in errors1) {
                        error_message = error_message + errors1[key] + '<br/>';
                    }

                    $.flash(error_message);
                }
            }
        });

    }
});

//    ------------------------start app ---------------------------------------------------------------------

ContactManager.on("start", function () {

    var menuView = new ContactManager.MenuView();

    ContactManager.menuRegion.show(menuView);
});

ContactManager.start();
