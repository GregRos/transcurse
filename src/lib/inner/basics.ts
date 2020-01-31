import {TranscurseError} from "./errors";
import {Writable} from "stream";

/**
 * An object used to control the transformation, such as by moving to the next step.
 */
export interface TranscurseControl<TIn = any, TOut = any> {

    /**
     * The current value being transformed.
     */
    readonly val: TIn;

    /**
	 * Restarts the entire transformation with `subValue` as a target.
	 * @param subValue The value to transform.
	 */
    recurse(subValue: TIn): TOut;

    /**
	 * Invokes the next step of the transformation, with `value` as a target.
	 * @param value The value to transform.
	 */
    next(value?: TIn): TOut;

    /**
     * Whether this is the last transformation step, with the next step being
     * the defualt identity transformation.
     */
    readonly isLast: boolean;
}

/**
 * A function used to transform a value.
 */
export interface TranscurseStep<TIn = any, TOut = any> {
    /**
	 *
	 * @param ctx An object containing the current value and functions to control the process.
	 */
    (ctx: TranscurseControl<TIn, TOut>): TOut;
}

/**
 * A function that transforms.ts `TIn` to `TOut`
 */
export interface TranscurseFunction<TIn = any, TOut = any> {
    (input: TIn): TOut;
}



type Writeable<T> = { -readonly [P in keyof T]: T[P] };

function wrapStep(step: TranscurseStep, prevNext: any, isLast: boolean) {
    return function(this: TranscurseControl, value?: any) {
        if (arguments.length === 0) {
            value = this.val;
        }
        this.next = prevNext;
        const writable = this as Writeable<TranscurseControl>;
        writable.val = value;
        writable.isLast = isLast;
        const blah = step(this);
        return blah;
    };
}

export const idStep: TranscurseStep = wrapStep(c => {
    return c.val;
}, null, true);

function compile(steps: TranscurseStep[]): TranscurseFunction {
    let curSkip = idStep;
    for (let i = 0; i < steps.length; i++) {
        curSkip = wrapStep(steps[i], curSkip, i === 0);
    }
    let firstSkip = curSkip;

    let createTransformCtx = (set: Set<any>) => {
        return {
            recurse(obj) {
                if (set.has(obj)) {
                    throw new TranscurseError("Transformation has tried to do circular recursion.");
                }
                set.add(obj);
                try {
                    let ctx = createTransformCtx(set);
                    return ctx.next(obj);
                } finally {
                    set.delete(obj);
                }
            },
            next(x) {
                return firstSkip.call(this, x);
            },
            val: null,
            isLast: false
        } as TranscurseControl;

    };

    return x => {
        let ctx = createTransformCtx(new Set([x]));
        let blah = ctx.next(x);
        return blah;
    };
}

/**
 * A transcurse transformation or transformation step function.
 */
export type LikeTranscurseStep<TIn, TOut> = TranscurseStep<TIn, TOut> | Transformation<TIn, TOut>;

/**
 * A recursive transformation for objects of type `TFrom` to objects of type `TTo`.
 */
export class Transformation<TIn = any, TOut = any> {
    private _compiled: TranscurseFunction<TIn, TOut>;
    private readonly _steps: TranscurseStep<TIn, TOut>[];

    constructor(steps: LikeTranscurseStep<TIn, TOut>[] = []) {
        let flatSteps = [].concat.apply([], steps.map(x => x instanceof Transformation ? x._steps : [x]));
        for (let step of flatSteps) {
            if (typeof step !== "function") {
                throw new TranscurseError("One of the arguments wasn't a Transformation or a function.");
            }
        }
        this._steps = flatSteps;
    }

    /**
     * Returns a new transformation with additional steps `steps`.
     * `steps` will be applied in immediately before `this`, with decreasing precedence, from right to left.
     * @param steps
     */
    step(...steps: LikeTranscurseStep<TIn, TOut>[]): Transformation<TIn, TOut> {
        if (steps.length === 0) return this;
        return new Transformation([...this._steps, ...steps.reverse()]);
    }

    /**
     * Compiles the transformation into a function, caching it, and returns it.
     */
    compile(): (input: TIn) => TOut {
        return this._compiled || (this._compiled = compile(this._steps));
    }

    /**
     * Applies the transformation on `input`.
     * @param input The input value.
     */
    apply(input: TIn): TOut {
        return this.compile()(input);
    }
}

/**
 * Creates a new Transformation instance, with the given steps, evaluated right to left.
 * @param steps
 */
export function transformation<TIn = any, TOut = any>(...steps: LikeTranscurseStep<TIn, TOut>[]) {
    return new Transformation(steps.reverse());
}