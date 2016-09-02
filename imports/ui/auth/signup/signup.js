import "./signup.html";
import "./signup.less";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base";

Template.signup.events({
    "submit form"(event) {
        event.preventDefault();

        const email = $("[name=email]").val();
        const username = $("[name=username]").val();
        const password = $("[name=password]").val();

        Accounts.createUser({
            email: email,
            username: username,
            password: password
        }, (err) => {
            if (err) {
                $(".help-block").text(err.reason).parent().removeClass("hide");
                return false;
            }

            Router.go("models");
        });
    }
});
