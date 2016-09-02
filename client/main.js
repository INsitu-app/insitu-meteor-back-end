/**
 * Startup
 */
import "../imports/startup/accounts.js";
import "../imports/startup/router/routes.js";

/**
 * UI
 */
import "../imports/ui/auth/auth.js";
import "../imports/ui/body/body.js";

/**
 * Meteor
 */
Meteor.startup(() => {
    UI.registerHelper("currentRouteName",function(){
        return Router.current() && Router.current().route ? Router.current().route.getName() : false;
    });
});
