import { MemberConfig } from './MemberConfig'

export class PropertyConfig extends MemberConfig {
    constructor(public name: string) {
        super();
    }
}