import test from "ava";
import {Standard} from "../../lib";
import { isObjectLike } from "lodash";

const structural = Standard.structural;
test("scalars", t => {
    const my = structural.pre(c => c.next(c.val));
    t.is(my.apply(5), 5);
    t.is(my.apply("abc"), "abc");
    t.is(my.apply(null), null);
    t.is(my.apply(undefined), undefined);
    const symb = Symbol("abc");
    t.is(my.apply(symb), symb);
});

test("array", t => {
    const my = structural.pre(c => Array.isArray(c.val) ? c.next() : typeof c.val);
    t.deepEqual(my.apply([1, "abc", {}]), ["number", "string", "object"]);
});

test("nested array", t => {
    const my = structural.pre(c => Array.isArray(c.val) ? c.next() : typeof c.val);
    t.deepEqual(my.apply([[1], [2]]), [["number"], ["number"]]);
});

test("object", t => {
    const my = structural.pre(c => isObjectLike(c.val) ? c.next() : typeof c.val);
    t.deepEqual(my.apply({
        a: "abc",
        b: "def"
    }), {
        a: "string",
        b: "string"
    });
});

test("nested object/array", t => {
    const my = structural.pre(c => isObjectLike(c.val) ? c.next() : typeof c.val);
    t.deepEqual(my.apply({
        a: {
            b: [1]
        },
        b: []
    }), {
        a: {
            b: ["number"]
        },
        b: []
    });
});

