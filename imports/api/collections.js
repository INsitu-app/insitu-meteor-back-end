import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

const Collections = new Mongo.Collection("collections");

if (Meteor.isServer) {
    Meteor.publish("Collections", () => {
        return Collections.find();
    });
}

export {
    Collections
}
