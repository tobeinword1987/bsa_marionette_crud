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
        else if (!reAplpha.test(attrs.firstname)) {
            errors1.firstname = 'Firstname has to contain only letters';
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

ContactManager.UpdateBookView=Marionette.ItemView.extend({
    template:'#update_book_template',
    ui:{
        update_book_button:'#update_book_button'
    },
    events:{
        'click @ui.update_book_button': 'updateBook',
    },
    updateBook:function () {
        var updatebook = new ContactManager.AddBookModel({id:this.model.get('id')});
        updatebook.fetch();
        updatebook.set({
            title: this.$('input[id=updateTitle]').val(),
            author: this.$('input[id=updateAuthor]').val(),
            year: this.$('input[id=updateYear]').val(),
            genre: this.$('input[id=updateGenre]').val()
        });

        updatebook.save({}, {
            success: function (x) {
                var id = updatebook.get('id');
                if (!_.isEmpty(errors)) {
                    error_message = '';
                    for (key in errors) {
                        error_message = error_message + errors[key] + '<br/>';
                    }
                    $.flash(error_message);
                }
                else {
                    $.flash('Книга с названием \'' + updatebook.get('title')+'\' изменена');

                    booksCollection_g.set(updatebook,{remove: false},{merge: true});
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

ContactManager.UpdateUserView=Marionette.ItemView.extend({
    template:'#update_user_template',
    ui:{
        update_user_button:'#update_user_button'
    },
    events:{
        'click @ui.update_user_button': 'updateUser',
    },
    updateUser:function () {
        var updateuser = new ContactManager.AddUserModel({id:this.model.get('id')});
        updateuser.fetch();
        updateuser.set({
            firstname: this.$('input[id=updateFirstname]').val(),
            lastname: this.$('input[id=updateLastname]').val(),
            email: this.$('input[id=updateEmail]').val(),
        });

        updateuser.save({}, {
            success: function (x) {
                var id = updateuser.get('id');
                if (!_.isEmpty(errors1)) {
                    error_message = '';
                    for (key in errors1) {
                        error_message = error_message + errors1[key] + '<br/>';
                    }
                    $.flash(error_message);
                }
                else {
                    $.flash('Читатель с именем \'' + updateuser.get('firstname')+'\' изменен');

                    usersCollection_g.set(updateuser,{remove: false},{merge: true});
                    var allUsersTableView = new ContactManager.AllUsersTableView({
                        collection: usersCollection_g
                    });
                    ContactManager.mainRegion.show(allUsersTableView);
                }
            },
            error: function (x) {
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

ContactManager.AllBooksTableTrView = Marionette.ItemView.extend({
    tagName: 'tr',
    model: ContactManager.BookModel,
    template: '#allBooksTableTrTemplate',
    ui:{
        delete_book_button:'#delete_book_button',
        show_update_book_button:'#show_update_book_button'
    },
    events:{
        'click @ui.delete_book_button': 'deleteBook',
        'click @ui.show_update_book_button': 'showUpdateBookView'
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
    },
    showUpdateBookView:function(){
        var showUpdateBookView=new ContactManager.UpdateBookView({
            model:this.model
        });
        console.log(this.model);
        ContactManager.mainRegion.show(showUpdateBookView);
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
        delete_user_button:'#delete_user_button',
        show_update_user_button:'#show_update_user_button',
        show_free_books:'#show_free_books'
    },
    events:{
        'click @ui.delete_user_button': 'deleteUser',
        'click @ui.show_update_user_button': 'showUpdateUserView',
        'click @ui.show_free_books': 'showFreeBooksView'
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
        var allUsersTableView = new ContactManager.AllUsersTableView({
            collection: usersCollection_g
        });
        ContactManager.mainRegion.show(allUsersTableView);
    },
    showUpdateUserView:function(){
        var showUpdateUserView=new ContactManager.UpdateUserView({
            model:this.model
        });
        ContactManager.mainRegion.show(showUpdateUserView);
    },
    showFreeBooksView:function(){

        ContactManager.FreeBookModel=Backbone.Model.extend({
            url:'http://bsa_laravel_rest.local/users/'+this.model.get('id')+'/books'
        })

        ContactManager.AllFreeBooksCollection = Backbone.Collection.extend({
            url:'http://bsa_laravel_rest.local/users/'+this.model.get('id')+'/books',
            model: ContactManager.FreeBookModel
        });

        var user_id=this.model.get('id');
        var firstname=this.model.get('firstname');
        var lastname=this.model.get('lastname');

        var allFreeBooksCollection=new ContactManager.AllFreeBooksCollection();

        allFreeBooksCollection.fetch();

        console.log(allFreeBooksCollection);

        ContactManager.AllFreeBooksTableTrView = Marionette.ItemView.extend({
            tagName: 'tr',
            model: this.model,
            template: '#allFreeBooksTRTemplate',
            ui:{
                get_book_button:'#get_book_button'
            },
            events:{
                'click @ui.get_book_button':'getFreeBook'
            },
            getFreeBook:function () {
                var book_id=this.model.get('id');
                var title=this.model.get('title');
                ContactManager.FreeBookModel=Backbone.Model.extend({
                    url:'http://bsa_laravel_rest.local/users/'+user_id+'/books/'+book_id});

                var freeBookModel=new ContactManager.FreeBookModel({id:book_id});
                freeBookModel.fetch();
                console.log(freeBookModel);
                freeBookModel.set({user_id:user_id});
                console.log(freeBookModel);
                freeBookModel.save({},{
                    success: function (x) {
                            $.flash('Читатель '+firstname+' '+lastname+' успешно взял книгу c названием \''+title+'\'');
                            booksCollection_g.set(freeBookModel,{remove: false},{merge: true});

                            var allBooksTableView = new ContactManager.AllBooksTableView({
                                collection: booksCollection_g
                            });
                            ContactManager.mainRegion.show(allBooksTableView);
                    },
                    error: function (x) {
                        $.flash('Читателю не удалось взять книгу');
                    }
                });
            }
        });

        ContactManager.AllFreeBooksTableView = Marionette.CompositeView.extend({
            template: '#allFreeBooksTableHeadTemplate',
            tagName: "table",
            className: 'table table-striped table-bordered table-hover',
            childView: ContactManager.AllFreeBooksTableTrView,
        });


        var allFreeBooksTableView=new ContactManager.AllFreeBooksTableView({
            collection:allFreeBooksCollection
        });

        ContactManager.mainRegion.show(allFreeBooksTableView);
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
