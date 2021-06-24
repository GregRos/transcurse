import test from "ava";
import {TranscurseError, Transcurse, transcurse} from "../../lib";
test("empty transcurse", t => {
    const freshEmpty = new Transcurse();
    t.is(freshEmpty.apply(500), 500);
});

test("empty() function", t => {
    const zero = transcurse();
    t.is(zero.apply(500), 500);
});

test("single simple transform", t => {
   const single = transcurse(x => 1);
   t.is(single.apply(5), 1);
   t.is(single.apply(5), 1);
});

test("fallback transform is identity", t => {
    const single = transcurse(c => c.next(c.val));
    t.is(single.apply(5), 5);
    t.is(single.apply(""), "");
});

test("single transform has isLast == true", t => {
    t.plan(3);
    const single = transcurse(c => {
        t.is(c.isLast, true);
        t.assert(typeof c.recurse === "function");
        return 1;
    });
    t.is(single.apply(5), 1);
});

test("single transform recurse", t => {
    t.plan(3);
    const single = transcurse(c => {
        t.pass();
        if (c.val === 5) return 9;
        return c.recurse(5, null);
    });

    t.is(single.apply(10), 9);
});

test("double transform", t => {
    t.plan(2);
    const double = transcurse(c => {
        return c.next(c.val);
    }, c => {
        t.is(c.val, 8);
        return 10;
    });
    t.is(double.apply(8), 10);
});

test("double transform changes isLast", t => {
    t.plan(4);
    const double = transcurse(c => {
        t.false(c.isLast);
        return c.next(c.val);
    }, c => {
        t.true(c.isLast);
        t.is(c.val, 8);
        return 10;
    });
    t.is(double.apply(8), 10);
});

test("c.next() - works", t => {
    const double = transcurse(c => {
        return c.next();
    }, c => c.val);

    t.is(double.apply(5), 5);
});

test("c.next(undefined) - isn't the same as c.next()", t => {
    const double = transcurse(c => {
        return c.next(undefined);
    }, c => c.val);

    t.is(double.apply(5), undefined);
});

test("double transform recurse", t => {
    const double = transcurse(c => {
        t.false(c.isLast);
        return c.next(`${c.val}a`);
    }, c => {
        t.true(c.isLast);
        if (c.val.length < 3) return c.recurse(`${c.val}b`, null);
        return c.val;
    });
    t.is(double.apply(""), "aba");
});

test("recursion into identical value errors", t => {
    let count = 0;
    const single = transcurse(c => {
        count++;
        return c.recurse(c.val, null);
    });
    let err = t.throws(() => single.apply(1));
    t.true(err instanceof TranscurseError);
    t.is(count, 1);
});

test("recursion into identical value errors deeper", t => {
    let count = 0;
    let single = transcurse(c => {
        count++;
        if (c.val === 4) return c.recurse(c.val / 2, null);
        return c.recurse(c.val + 1, null);
    });
    let err = t.throws(() => single.apply(1));
    t.true(err instanceof TranscurseError);
    t.is(count, 4);
});

test("context object remains the same", t => {
    let ctxts = [[], []];
    let single = transcurse(c => {
        ctxts[c.val].push(ctxts);
        return c.next(c.val);
    }, c => {
        ctxts[c.val].push(ctxts);
        if (c.val === 1) return 0;
        return c.recurse(c.val + 1, undefined);
    });

    t.is(single.apply(0), 0);
    t.true(ctxts[0][0] === ctxts[0][1]);
    t.true(ctxts[1][0] === ctxts[1][1]);
});

test("add adds steps in reverse precedence", t => {
    let empty = transcurse();
    let double = empty.pre(
        c => c.next(c.val + 1),
        c => c.val
    );
    t.is(double.apply(0), 1);
});

test("empty and is idempotent", t => {
    let empty = transcurse();
    t.is(empty, empty.pre());
});

test("catches non-function argument", t => {
    let err = t.throws(() => transcurse(100 as any));
    t.true(err instanceof TranscurseError);

    err = t.throws(() => transcurse(() => {}, null));
    t.true(err instanceof TranscurseError);
});

test("transcurse(transcurse)", t => {
    let a = transcurse(c => c.val + 1);
    let result = transcurse(a);
    t.is(result.apply(1), 2);
    let b = transcurse(c => 1 + c.next(c.val), result);
    t.is(b.apply(1), 3);
});
