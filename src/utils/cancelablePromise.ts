
export interface PromiseError {
  isCanceled: boolean,
}

export class CancelablePromise<T> {    
    private innerPromise: Promise<T>;
    private outerPromise: Promise<T>;
    private canceled: boolean;    
    
    constructor(promise: Promise<T>) {
      this.innerPromise = promise;
      this.outerPromise = new Promise<T>((resolve, reject)=> {
        this.buildPromise(resolve, reject);
      });
      this.canceled = false;
    }
    
    public cancel(): void {
      this.canceled = true;
    }
    
    public isCanceled(): boolean {
      return this.canceled;
    }
     
    private buildPromise(resolve: (v: T) => void, reject: (reason: PromiseError) => void): void {
      const self = this;
      this.innerPromise
        .then((value: T) =>{
          if(!self.isCanceled()){
            // accept
            resolve(value);
          }
          else{
            // reject due to cancellation
            reject({isCanceled: true});
          }
        })
        .catch(error => {
          if(self.isCanceled()){
            // reject due to cancellation
            reject({isCanceled: true});
          } 
          else {
            // reject due to error
            reject(error);
          }
        });
    }
     
    public then<TResult>(onfulfilled?: (value: T) => (TResult | Promise<TResult>), onrejected?: (reason: any) => (T | Promise<T>)) {
      return this.outerPromise.then(onfulfilled, onrejected);
    }
  
    public catch<TResult>(handler: (reason: any) => TResult | Promise<TResult>) {
      return this.outerPromise.catch(handler);
    }
  }
