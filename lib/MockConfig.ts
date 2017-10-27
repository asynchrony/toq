import { MemberConfig } from './MemberConfig'
import { FunctionConfig } from "./FunctionConfig";
import { CallMatcher } from "./CallMatcher";

export class MockConfig<TMock> {
    private configuredCalls : Array<MemberConfig> = [];
    public unconfiguredCalls : Array<string> = [];
    public get uncalledSetups(): Array<MemberConfig> {
        return this.configuredCalls.filter(x => !x.called);
    }

    private matcher : CallMatcher;
    constructor(private ctor: new () => TMock) {       
        this.matcher = new CallMatcher();
    }

    public addCall(memberConfig: MemberConfig) {
        this.configuredCalls.push(memberConfig);
    }

    private createHandler(name: string) : () => any {
        let _this = this;
        return function(...params: Array<any>) {
            let configuredCall = _this.matcher.match(name, params, _this.configuredCalls);
            if (configuredCall != null) {
                return configuredCall.call(params);
            } else {
                _this.unconfiguredCalls.push(name);
                return undefined;
            }
        }
    } 

    public createMock(): TMock {
        let example = new this.ctor() as any;
        let mock = {} as any;
        let keys = Object.getOwnPropertyNames(example).concat(Object.getOwnPropertyNames(example.__proto__));
        for (var key of keys) {
            let type = typeof (example[key]);
            let handler = this.createHandler(key);
            if (type == "function") {
                mock[key] = handler;
            } else {
                Object.defineProperty(mock, key, { get: handler });
            }
        }

        return mock as TMock;
    }
}