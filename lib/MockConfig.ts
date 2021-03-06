import { MemberConfig } from './MemberConfig'
import { FunctionConfig } from "./FunctionConfig";
import { CallMatcher } from "./CallMatcher";

export class MockConfig<TMock extends object> {
    private configuredCalls: Array<MemberConfig> = [];
    public unconfiguredCalls: Array<string> = [];
    public get uncalledSetups(): Array<MemberConfig> {
        return this.configuredCalls.filter(x => (!x.called && !x.optional));
    }

    private matcher: CallMatcher;
    constructor(private ctor: new () => TMock) {
        this.matcher = new CallMatcher();
    }

    private createFunctionHandler(name: string) {
        let _this = this;
        return (...params: any[]): any => {
            let matches = _this.matcher.matchFunction(name, params, _this.configuredCalls);
            if (matches == null) {
                _this.unconfiguredCalls.push(name);
                return undefined;
            } else {
                for (let secondary of matches.secondaries) {
                    secondary.execute(params);
                }
                return matches.primary.execute(params);
            }
        };
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
                    return _this.createFunctionHandler(name)
                }
                else {
                    return configuredCall.execute([])
                }
            }
        };
        return new Proxy({} as TMock, handler);
    }
}