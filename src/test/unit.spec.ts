import test from "ava";
import {transformation} from "../lib";
import {TranscurseError, Transformation} from "../lib";
test("empty transcurse", t => {
    const freshEmpty = new Transformation();
    t.is(freshEmpty.apply(500), 500);
});

test("empty() function", t => {
    const zero = transformation();
    t.is(zero.apply(500), 500);
});

test("single simple transform", t => {
   const single = transformation(x => 1);
   t.is(single.apply(5), 1);
   t.is(single.apply(5), 1);
});

test("single transform next == null", t => {
    t.plan(3);
    const single = transformation(c => {
        t.is(c.next, null);
        t.assert(typeof c.recurse === "function");
        return 1;
    });
    t.is(single.apply(5), 1);
});

test("single transform recurse", t => {
    t.plan(3);
    const single = transformation(c => {
        t.pass();
        if (c.val === 5) return 9;
        return c.recurse(5);
    });

    t.is(single.apply(10), 9);
});

test("double transform", t => {
    t.plan(2);
    const double = transformation(c => {
        return c.next(c.val);
    }, c => {
        t.is(c.val, 8);
        return 10;
    });
    t.is(double.apply(8), 10);
});

test("double transform recurse", t => {
    const double = transformation(c => {
        return c.next(`${c.val}a`);
    }, c => {
        if (c.val.length < 3) return c.recurse(`${c.val}b`);
        return c.val;
    });
    t.is(double.apply(""), "aba");
});

test("recursion into identical value errors", t => {
    let count = 0;
    const single = transformation(c => {
        count++;
        return c.recurse(c.val);
    });
    let err = t.throws(() => single.apply(1));
    t.true(err instanceof TranscurseError);
    t.is(count, 1);
});

test("recursion into identical value errors deeper", t => {
    let count = 0;
    let single = transformation(c => {
        count++;
        if (c.val === 4) return c.recurse(c.val / 2);
        return c.recurse(c.val + 1);
    });
    let err = t.throws(() => single.apply(1));
    t.true(err instanceof TranscurseError);
    t.is(count, 4);
});

test("context object remains the same", t => {
    let ctxts = [[], []];
    let single = transformation(c => {
        ctxts[c.val].push(ctxts);
        return c.next(c.val);
    }, c => {
        ctxts[c.val].push(ctxts);
        if (c.val === 1) return 0;
        return c.recurse(c.val + 1);
    });

    t.is(single.apply(0), 0);
    t.true(ctxts[0][0] === ctxts[0][1]);
    t.true(ctxts[1][0] === ctxts[1][1]);
});

test("add adds steps in reverse precedence", t => {
    let empty = transformation();
    let double = empty.and(
        c => c.next(c.val + 1),
        c => c.val
    );
    t.is(double.apply(0), 1);
});

test("empty and is idempotent", t => {
    let empty = transformation();
    t.is(empty, empty.and());
});

test("catches non-function argument", t => {
    let err = t.throws(() => transformation(100 as any));
    t.true(err instanceof TranscurseError);

    err = t.throws(() => transformation(() => {}, null));
    t.true(err instanceof TranscurseError);
});

test("transcurse(transcurse)", t => {
    let a = transformation(c => c.val + 1);
    let result = transformation(a);
    t.is(result.apply(1), 2);
    let b = transformation(c => 1 + c.next(c.val), result);
    t.is(b.apply(1), 3);
});