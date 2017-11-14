export abstract class MemberConfig {
    public memberName: string;
    public optional: boolean = false;
    public abstract isFunction: boolean;

    private _handler: Function;
    private _callback: Function;
    private _return: any = undefined;
    private _called: number = 0;

    public execute(params: Array<any>) : any {
        this._called++;
        if (this._callback != undefined) {
            this._callback.apply(undefined, params);
        }

        if (this._handler != undefined) {
            return this._handler.apply(undefined, params);
        }
        return this._return;
    }
    
    public get called() {
        return this._called;
    }

    public set callback(callback: Function) {
        this._callback = callback;        
    }

    public set return(returnValue: any) {
        if (this._handler) {
            throw new Error(`Cannot set both return and handler for setup of ${this.memberName}`);
        }
        this._return = returnValue;
    }

    public set handler(handler: Function) {
        if (this._return) {
            throw new Error(`Cannot set both handler and return for setup of ${this.memberName}`);
        }
        this._handler = handler;        
    }
}