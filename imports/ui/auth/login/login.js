import "./login.html";
import "./login.less";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

Template.login.events({
    "submit form"(event) {
        event.preventDefault();

        var email = $("[name=email]").val();
        var password = $("[name=password]").val();

        Meteor.loginWithPassword(email, password, (err) => {
            if (err) {
                $(".help-block").text(err.reason).parent().removeClass("hide");
                return false;
            }

            Router.go("models");
        });

        console.log("login: ", email, password);
    }
});
