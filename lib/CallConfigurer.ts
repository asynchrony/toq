import { MemberConfig } from './MemberConfig';

export class CallConfigurer<TReturn> {
    constructor(private memberConfig: MemberConfig) {
    }

    public returns(value: TReturn): CallConfigurer<TReturn> {
        this.memberConfig.return = value;
        return this;
    }
}