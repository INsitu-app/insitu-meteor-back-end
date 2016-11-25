import Busboy from "busboy";

import { Models } from "../../api/models.js";
import { Collections } from "../../api/collections.js";

Router.route("/api/upload", {where: "server"})
    .get((req, res) => {
        res.writeHead(200, { Connection: 'close' });
        res.end(`
            <html>
                <head>
                </head>
                <body>
                    <form method="POST" enctype="multipart/form-data">
                        <input type="text" name="textfield"><br>
                        <input type="file" name="filefield"><br>
                        <input type="submit">
                    </form>
                </body>
            </html>
        `);
    })
    .post((req, res) => {
        var busboy = new Busboy({
            headers: req.headers
        });

        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);

            file.on('data', function (data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
            });

            file.on('end', function () {
                console.log('File [' + fieldname + '] Finished');
            });
        });

        busboy.on('field', function (fieldname, value) {
            console.log('Field [' + fieldname + ']: value: ' + value);
        });

        busboy.on('finish', function () {
            console.log('Done parsing form!');

            res.writeHead(303, {Connection: 'close', Location: '/api/upload'});
            res.end();
        });

        req.pipe(busboy);
    });

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
        //let user = Accounts.findUserByEmail("testtest@test.com");
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
