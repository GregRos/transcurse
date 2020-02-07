import test from "ava";
import {Standard} from "../../lib";

test("works", t => {
    const id = Standard.id;
    t.is(id.apply(5), 5);
    t.is(id.apply(100), 100);
});
