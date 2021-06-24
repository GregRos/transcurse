import test from "ava";
import {transcurse} from "../../lib";

test("state saved between steps", t => {
    const markerObj = {};
    const curse = transcurse(x => {
        t.is(x.state, markerObj);
        x.next();
    }, x => {
        t.is(x.state, markerObj);
    });
    curse.apply({}, markerObj);
    t.plan(2);
});

test("state preserved when recursing", t => {
    const markerObj = {};
    const curse = transcurse(x => {
        t.is(x.state, markerObj);
        if (x.val !== 1) {
            x.recurse(1);
        }
    });
    curse.apply({}, markerObj);
    t.plan(2);
});
