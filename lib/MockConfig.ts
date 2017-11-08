import { MemberConfig } from './MemberConfig'
import { FunctionConfig } from "./FunctionConfig";
import { CallMatcher } from "./CallMatcher";

export class MockConfig<TMock extends object> {
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
        let _this = this;

        let handler: ProxyHandler<TMock> = {
            get(target: TMock, name: string) {
                let configuredCall = _this.matcher.match(name, [], _this.configuredCalls);
                return new Proxy(propertyVersion, {
                    apply(target: PropertyConfig, thisObject: any, args: any[]) {
                        return new FunctionConfig(target.name, args);
                    }
                });
            }
        };
        return new Proxy({} as TMock, handler);
    }
}