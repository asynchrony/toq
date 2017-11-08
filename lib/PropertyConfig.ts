import { MemberConfig } from './MemberConfig'

export class PropertyConfig extends MemberConfig {    
    public isFunction: boolean = false;
    
    constructor(public memberName: string) {
        super();
    }
}