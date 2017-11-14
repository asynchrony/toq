import { MemberConfig } from './MemberConfig';

export class CallConfigurer<TReturn> {
    constructor(private memberConfig: MemberConfig) {
    }

    public returns(value: TReturn): CallConfigurer<TReturn> {
        this.memberConfig.return = value;
        return this;
    }

    public callback<T1 = any, T2 = any, T3 = any, T4 = any>(callback: (a?: T1, b?: T2, c?: T3, d?: T4) => void) : CallConfigurer<TReturn> {
        this.memberConfig.callback = callback;
        return this;
    }

    public handler<T1 = any, T2 = any, T3 = any, T4 = any>(handler: (a?: T1, b?: T2, c?: T3, d?: T4) => TReturn) : CallConfigurer<TReturn> {
        this.memberConfig.handler = handler;
        return this;
    }

    public optional() {
        this.memberConfig.optional = true;
    }
}