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

    public createMock(): TMock {
        let _this = this;

        let handler: ProxyHandler<TMock> = {
            get(target: TMock, name: string) {
                let configuredCall = _this.matcher.matchName(name, _this.configuredCalls);
                if (configuredCall == null) {
                    _this.unconfiguredCalls.push(name);
                    return undefined;
                }
    
                if (configuredCall.isFunction) {
                    return (...params: any[]): any => {
                        let functionCall = _this.matcher.match(name, params, _this.configuredCalls);
                        if (functionCall == null) {
                            _this.unconfiguredCalls.push(name);
                            return undefined;
                        }
                        return functionCall.execute(params)
                    };
                }
                else {
                    return configuredCall.execute([])
                }
            }
        };
        return new Proxy({} as TMock, handler);
    }
}