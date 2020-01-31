import test from "ava";
import { Transforms } from "../../lib";

test("works", t => {
    const id = Transforms.id;
    t.is(id.apply(5), 5);
    t.is(id.apply(100), 100);
});
