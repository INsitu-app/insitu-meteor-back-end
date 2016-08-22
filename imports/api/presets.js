import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

const Presets = new Mongo.Collection("presets");

if (Meteor.isServer) {
    Meteor.publish("Presets", () => {
        return Presets.find();
    });
}

export {
    Presets
}
