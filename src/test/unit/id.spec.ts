import test from "ava";
import {id} from "../../lib";
test("works", t => {
    const idt = id;
    t.is(idt.apply(5), 5);
    t.is(idt.apply(100), 100);
});
