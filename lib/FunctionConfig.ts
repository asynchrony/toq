import { MemberConfig } from './MemberConfig'

export class FunctionConfig extends MemberConfig {
    public params: Array<any>;

    constructor(public name: string, params: Array<any>) {
        super();
        this.params = params;
    }
}