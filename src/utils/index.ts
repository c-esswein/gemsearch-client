
/**
 * Wrapper for fetch to set XMLHttpRequest header. Response from server is 
 * pretty printed (and huge) otherwise.
 * @inheritDoc
 */
export function xFetch(input: RequestInfo, init: RequestInit = {}) {
    init = {headers: {'X-Requested-With': 'XMLHttpRequest'}, ...init};
    return fetch(input, init);
}

interface ThrottleSettings {
    
    /**
     * If you'd like to disable the leading-edge call, pass this as false.
     */
    leading?: boolean;

    /**
     * If you'd like to disable the execution on the trailing-edge, pass false.
     */
    trailing?: boolean;
}

interface _Cancelable {
    cancel(): void;
}

/**
 * Creates and returns a new, throttled version of the passed function, that, when invoked repeatedly,
 * will only actually call the original function at most once per every wait milliseconds. Useful for
 * rate-limiting events that occur faster than you can keep up with.
 * By default, throttle will execute the function as soon as you call it for the first time, and,
 * if you call it again any number of times during the wait period, as soon as that period is over.
 * If you'd like to disable the leading-edge call, pass {leading: false}, and if you'd like to disable
 * the execution on the trailing-edge, pass {trailing: false}.
 * @param func Function to throttle `waitMS` ms.
 * @param wait The number of milliseconds to wait before `fn` can be invoked again.
 * @param options Allows for disabling execution of the throttled function on either the leading or trailing edge.
 * @return `fn` with a throttle of `wait`.
 */
export function throttle<T extends Function>(func: T, wait: number, options: ThrottleSettings): T & _Cancelable {
    let context, args, result;
    let timeout = null;
    let previous = 0;
    if (!options) options = {};
    const later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    return function() {
        const now = Date.now();
        if (!previous && options.leading === false) {
        previous = now;
        }
        const remaining = wait - (now - previous);
        context = this as any;
        args = arguments;
        if (remaining <= 0 || remaining > wait) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) {
            context = args = null;
        }
        } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
        }
        return result;
    } as any;
}
