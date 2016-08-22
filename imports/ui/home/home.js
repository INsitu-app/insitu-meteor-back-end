import "./home.less";
import "./home.html";

import { Template } from "meteor/templating";



Template.home.onCreated(() => {
    $(document.body).on("load", "#viewer", () => {
        console.warn("done");
    });

    //let frame = new Frame(window);
    //
    //setTimeout(function () {
    //    $("#viewer").on("load", () => {
    //        console.warn("done");
    //    });
    //
    //    frame.connect($("#viewer").get(0).contentWindow);
    //
    //    frame.send("config", {
    //        a: 12354645712,
    //        b: 32423423
    //    });
    //}, 400);
});

Template.home.onRendered(() => {
    //let frame = new Frame(window);
    //
    //setTimeout(function () {
    //    frame.connect($("#viewer").get(0).contentWindow);
    //
    //    frame.send("config", {
    //        a: 12354645712,
    //        b: 32423423
    //    });
    //}, 100);
});

