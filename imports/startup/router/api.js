import { Models } from "../../api/models.js";
import { Collections } from "../../api/collections.js";

Router.route("/api/models", {where: "server"})
    .get((req, res) => {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(Models.find({}).fetch()));
    });

Router.route("/api/collections", {where: "server"})
    .get((req, res) => {
        let temp = {};
        let collections = [];
        let user = Accounts.findUserByEmail("tim@landscaping.co.uk");

        let query = {
            owner: user._id
        };

        if (req.query.owner) {
            query = {
                owner: req.query.owner
            };
        }

        let models = Models.find(query).fetch();

        models.forEach((model) => {
            if (model.collection) {
                if (temp[model.collection._id]) {
                    temp[model.collection._id].models.push(model);
                } else {
                    temp[model.collection._id] = {
                        name: model.collection.name,
                        models: [
                            model
                        ]
                    };
                }
            }
        });

        for (let key in temp) {
            collections.push(temp[key]);
        }

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(collections));
    });
