
import { CancelablePromise } from 'utils/cancelablePromise';

const wait = (duration: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        window.setTimeout(() => {
            resolve();
        }, duration);
    });
};

/**
 * Makes sure that no api calls are executed in parallel. If fetch is pending
 * always the latest fetch is stored and executed after the pending one is resolved.
 */
export class ApiThrottle<T> {
    private lockPromise: CancelablePromise<void> = null;
    private pendingCall: CancelablePromise<T> = null;
    private nextCall: () => Promise<T> = null;
    private nextHandleLoaded: (T) => void = null;

    constructor() {
        this.handleFetchLoaded = this.handleFetchLoaded.bind(this);
        this.handleLockPromiseResolve = this.handleFetchLoaded.bind(this);
    }

    private fetch_(fetchGenerator: () => Promise<T>, handleLoaded: (T) => void) {
        this.pendingCall = new CancelablePromise(fetchGenerator());
        this.pendingCall.then(this.handleFetchLoaded).then(handleLoaded);
        
        
        this.lockPromise = new CancelablePromise(wait(300));
        this.lockPromise.then(this.handleLockPromiseResolve);
    }

    public fetch(fetchGenerator: () => Promise<T>, handleLoaded: (T) => void) {
        if (this.pendingCall) {
            // store next fetch
            this.nextCall = fetchGenerator;
            this.nextHandleLoaded = handleLoaded;
            return;
        }

        this.fetch_(fetchGenerator, handleLoaded);
    }

    private handleFetchLoaded(apiResult: T): T {
        this.pendingCall = null;
        this.checkNextCall();
        return apiResult;
    }

    private handleLockPromiseResolve() {
        this.lockPromise = null;
        this.checkNextCall();
    }

    private checkNextCall() {
        if (this.nextCall !== null && this.checkNextCall) {
            this.fetch_(this.nextCall, this.nextHandleLoaded);
            this.nextCall = null;
            this.nextHandleLoaded = null;
        }
    }

    /**
     * Dispose and cancel pending fetch.
     */
    public dispose() {
        if (this.pendingCall) {
            this.pendingCall.cancel();
            this.pendingCall = null;
            this.nextCall = null;
            this.nextHandleLoaded = null;
        }
    }
}
