import { MemberConfig } from './MemberConfig'
import { FunctionConfig } from "./FunctionConfig"
import { IsAny } from "./Any"

export class CallMatcher {
    private matches(params: Array<any>, config: MemberConfig) {
        let funcMatch = config as FunctionConfig;
        if (params.length > 0 && (!funcMatch.params || funcMatch.params.length == 0)) {
            return false;
        }

        if (funcMatch.params && params.length != funcMatch.params.length) {
            return false;
        }

        for (var i = 0; i < params.length; i++) {
            if ((funcMatch.params[i] as IsAny).IsAny && params[i] != undefined) {
                continue;
            }

            if (funcMatch.params[i] != params[i]) {
                return false;
            }
        }

        return true;
    }

    public matchFunction(name: string, params: Array<any>, calls: Array<MemberConfig>): MatchSet {
        let nameMatches = calls.filter(x => x.memberName == name);
        let argMatches = nameMatches.filter(x => this.matches(params, x));
        let primary = argMatches.sort((a, b) => a.anyCount - b.anyCount)[0];
        if (primary) {
            return new MatchSet(primary, argMatches.filter(x => x != primary));
        } else {
            return null;
        }

    }

    public matchName(name: string, calls: Array<MemberConfig>): MemberConfig {
        let nameMatches = calls.filter(x => x.memberName == name);
        if (nameMatches.length == 0) {
            return undefined;
        }

        return nameMatches[0];
    }
}

export class MatchSet {
    constructor(public primary: MemberConfig, public secondaries: MemberConfig[]) { }
}