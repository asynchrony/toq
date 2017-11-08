import { MemberConfig } from './MemberConfig'

export class FunctionConfig extends MemberConfig {
    public params: Array<any>;
    public isFunction: boolean = true;

    constructor(public memberName: string, params: Array<any>) {
        super();
        this.params = params;
    }
}