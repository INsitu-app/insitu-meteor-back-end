import { Mongo } from "meteor/mongo";
import { Collections } from "./collections.js";

const Models = new Mongo.Collection("models", {
    transform(document) {
        document.collection = Collections.findOne({
            _id: document.collection
        });

        return document;
    }
});

function SaveModelMaterial(id, original, params) {
    let material = {
        name: original.name,
        map: params.map || original.map,
        envMap: params.envMap || original.envMap,
        bumpMap: params.bumpMap || original.bumpMap,
        typeMap: params.typeMap || original.typeMap || "none",
        color: params.color || original.color,
        specular: params.specular || original.specular,
        transparent: params.transparent || original.transparent,
        opacity: params.opacity || original.opacity,
        reflectivity: params.reflectivity || original.reflectivity,
        shininess: params.shininess || original.shininess,
        bumpScale: params.bumpScale || original.bumpScale,
        preset: params.name || ''
    };

    let model = Models.findOne({
        "_id": id,
        "materials.name": original.name
    });

    if (model) {
        for (var key in model.materials) {
            if (model.materials.hasOwnProperty(key)) {
                if (model.materials[key].name == original.name) {
                    model.materials[key] = material;
                    break;
                }
            }
        }

        Models.update({
            _id: id
        }, {
            $set: {
                materials: model.materials
            }
        });
    } else {
        Models.update({
            _id: id
        }, {
            $push: {
                materials: material
            }
        });
    }

    return material;
}

if (Meteor.isServer) {
    Meteor.publish("Models", () => {
        return Models.find();
    });
}

export {
    Models,
    SaveModelMaterial
}
