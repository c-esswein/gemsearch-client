
import { CancelablePromise } from 'utils/cancelablePromise';

/**
 * Makes sure that no api calls are executed in parallel. If fetch is pending
 * always the latest fetch is stored and executed after the pending one is resolved.
 */
export class ApiThrottle<T> {
    private pendingCall: CancelablePromise<T> = null;
    private nextCall: () => Promise<T> = null;
    private nextHandleLoaded: (T) => void = null;

    constructor() {
        this.handleFetchLoaded = this.handleFetchLoaded.bind(this);
    }

    private fetch_(fetchGenerator: () => Promise<T>, handleLoaded: (T) => void) {
        this.pendingCall = new CancelablePromise(fetchGenerator());
        this.pendingCall.then(this.handleFetchLoaded).then(handleLoaded);
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

    private handleFetchLoaded() {
        this.pendingCall = null;

        if (this.nextCall !== null) {
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
