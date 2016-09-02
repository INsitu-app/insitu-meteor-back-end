import { Accounts } from "meteor/accounts-base";

import { Models } from "../imports/api/models.js";
import { Presets } from "../imports/api/presets.js";
import { Collections } from "../imports/api/collections.js";

import "../imports/startup/router/api.js";

import "./upload.js";

Meteor.startup(() => {
    WebApp.rawConnectHandlers.use(function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        return next();
    });

    if (!Accounts.findUserByEmail("tim@landscaping.co.uk")) {
        Accounts.createUser({
            email: "tim@landscaping.co.uk",
            username: "tim",
            password: "C3darNur$3ry"
        });
    }

    if (!Presets.findOne({})) {
        Presets.insert({
            name: "mt-m-metal",
            typeMap: "metal",
            color: "#222222",
            specular: "#bbbbbb",
            shininess: 75,
            map: false,
            envMap: true,
            bumpMap: true,
            bumpScale: 0.00015,
            transparent: false,
            opacity: 1,
            reflectivity: 0.05
        });

        Presets.insert({
            name: "tg-glass",
            typeMap: "glass",
            color: "#444444",
            specular: "#777777",
            shininess: 100,
            map: false,
            envMap: true,
            bumpMap: false,
            bumpScale: 0,
            transparent: true,
            opacity: 0.5,
            reflectivity: 0.25
        });
    }
});
