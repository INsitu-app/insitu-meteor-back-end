Router.configure({
    layoutTemplate: "layout",
    loadingTemplate: "loading",
    notFoundTemplate: "error"
});

BaseController = RouteController.extend({
    data: function () {
        return {
            routerParams: this.params
        };
    }
});

AuthController = BaseController.extend({
    onBeforeAction: function () {
        if (Meteor.userId()) {
            this.redirect("models")
        } else {
            this.next();
        }
    }
});

AdminController = BaseController.extend({
    onBeforeAction: function () {
        if (!Meteor.userId()) {
            this.render("error")
        } else {
            this.next();
        }
    },
    waitOn: function(){
        return [
            Meteor.subscribe("Models"),
            Meteor.subscribe("Presets"),
            Meteor.subscribe("Collections")
        ]
    },
});

Router.route("/", {
    name: "home",
    template: "home",
    controller: BaseController
});

Router.route("/admin", {
    name: "auth",
    template: "auth",
    controller: AuthController
});

Router.route("/admin/login", {
    name: "login",
    template: "login",
    controller: AuthController
});

Router.route("/admin/signup", {
    name: "signup",
    template: "signup",
    controller: AuthController
});

Router.route("/admin/models/:collection?", {
    name: "models",
    template: "models",
    controller: AdminController,
    onBeforeAction: function () {
        if (this.params.collection == "uploads") {
            this.render("uploads");
        } else {
            this.next();
        }
    }
});

Router.route("/admin/models/uploads/:collection?", {
    name: "uploads",
    template: "uploads",
    controller: AdminController
});

Router.route("/admin/models/editor/:id", {
    name: "editor",
    template: "editor",
    controller: AdminController
});
