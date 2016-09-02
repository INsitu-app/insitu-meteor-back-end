import "./navbar.html";
import "./navbar.less";

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

Template.navbar.events({
    "click .logout"() {
        Meteor.logout(() => {
            Router.go("auth");
        });
    }
});
