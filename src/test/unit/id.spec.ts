import test from "ava";
import {Transcurses} from "../../lib";

test("works", t => {
    const id = Transcurses.id;
    t.is(id.apply(5), 5);
    t.is(id.apply(100), 100);
});
