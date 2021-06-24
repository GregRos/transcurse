import {TranscurseError} from "./errors";

/**
 * An object used to control the transformation, such as by moving to the next
 * step.
 */
export interface TranscurseControl<TIn = any, TOut = any> {

    /**
     * The current value being transformed.
     */
    readonly val: TIn;

    /**
     * Restarts the entire transformation with `subValue` as a target.
     * @param subValue The value to transform.
     * @param key The key of the value was found under, if any.
     */
    recurse(subValue: TIn, key ?: string | symbol | number): TOut;

    /**
	 * Invokes the next step of the transformation, with `value` as a target.
	 * @param value The value to transform.
	 */
    next(value?: TIn): TOut;

    /**
     * Whether this is the last transformation step, with the next step being
     * the defualt identity transformation.
     */
    isLast: boolean;

    /**
     * The key the current value was found under, if any.
     */
     key: any;

    /**
     * Custom state.
     */
    state: any;
}

/**
 * A function used to transform a value.
 */
export interface TranscurseStep<TIn = any, TOut = any> {
    /**
	 *
	 * @param ctx An object containing the current value and functions to
	 *     control the process.
	 */
    (ctx: TranscurseControl<TIn, TOut>): TOut;
}

/**
 * The compiled result of a Transcurse transformation. A function that converts
 * a `TIn` to `TOut`.
 */
export interface TranscurseFunction<TIn = any, TOut = any> {
    (input: TIn, state?: any): TOut;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

function wrapStep(step: TranscurseStep, prevNext: any, isLast: boolean) {
    return function(this: TranscurseControl, value?: any) {
        const writable = this as Writeable<TranscurseControl>;
        if (arguments.length > 0) {
            writable.val = value;
        }
        writable.next = prevNext;
        writable.isLast = isLast;

        return step(this);
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
            recurse(obj, key) {
                if (set.has(obj)) {
                    throw new TranscurseError("Transformation has tried to do circular recursion.");
                }
                set.add(obj);
                try {
                    let newCtx = createTransformCtx(set);
                    newCtx.state = this.state;
                    newCtx.key = key;
                    return newCtx.next(obj);
                } finally {
                    set.delete(obj);
                }
            },
            next(x) {
                return firstSkip.call(this, x);
            },
            val: null,
            isLast: false,
            state: {}
        } as TranscurseControl;

    };

    return (x, state) => {
        let ctx = createTransformCtx(new Set([x]));
        ctx.state = state;
        return ctx.next(x);
    };
}

/**
 * A transcurse transformation, or a transformation step.
 */
export type LikeTranscurseStep<TIn, TOut> = TranscurseStep<TIn, TOut> | Transcurse<TIn, TOut>;

/**
 * A recursive transformation for objects of type `TFrom` to objects of type
 * `TTo`.
 */
export class Transcurse<TIn = any, TOut = any> {
    private _compiled: TranscurseFunction<TIn, TOut>;
    private readonly _steps: TranscurseStep<TIn, TOut>[];

    constructor(steps: LikeTranscurseStep<TIn, TOut>[] = []) {
        let flatSteps = [].concat.apply([], steps.map(x => x instanceof Transcurse ? x._steps : [x]));
        for (let step of flatSteps) {
            if (typeof step !== "function") {
                throw new TranscurseError("One of the arguments wasn't a Transformation or a function.");
            }
        }
        this._steps = flatSteps;
    }

    /**
     * Returns a new transformation with additional steps `steps`.
     * `steps` will be applied in immediately before `this`, with decreasing
     * precedence, from right to left.
     * @param steps
     */
    pre(...steps: LikeTranscurseStep<TIn, TOut>[]): Transcurse<TIn, TOut> {
        if (steps.length === 0) return this;
        return new Transcurse([...this._steps, ...steps.reverse()]);
    }

    /**
     * Compiles the transformation into a function, caching it, and returns it.
     */
    compile(): TranscurseFunction<TIn, TOut> {
        return this._compiled || (this._compiled = compile(this._steps));
    }

    /**
     * Applies the transformation on `input`.
     * @param input The input value.
     * @param state The state object, if any.
     */
    apply(input: TIn, state?: any): TOut {
        return this.compile()(input, state);
    }
}

/**
 * Creates a new Transformation instance, with the given steps, evaluated right
 * to left.
 * @param steps
 */
export function transcurse<TIn = any, TOut = any>(...steps: LikeTranscurseStep<TIn, TOut>[]) {
    return new Transcurse(steps.reverse());
}
