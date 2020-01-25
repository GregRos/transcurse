import {TranscurseError} from "./errors";

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
    next(value: TIn): TOut;
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

function compile(steps: TranscurseStep[]): TranscurseFunction {
    if (steps.length === 0) return x => x;
    let curSkip = null as (this: TranscurseControl, value: any) => any;
    for (let i = 0; i < steps.length; i++) {
        let z = i;
        let lastNext = curSkip;
        curSkip = function(this: TranscurseControl, value: any) {
            let step = steps[z];
            this.next = lastNext;
            (this as any).val = value;
            return step(this);
        };
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
            val: null
        } as TranscurseControl;

    };

    return x => {
        let ctx = createTransformCtx(new Set([x]));
        return ctx.next(x);
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
    and(...steps: LikeTranscurseStep<TIn, TOut>[]): Transformation<TIn, TOut> {
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
