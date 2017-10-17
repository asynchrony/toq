import { MemberConfig } from './MemberConfig'
import { FunctionConfig } from "./FunctionConfig";

export class CallMatcher {
    private matches(params: Array<any>, config: MemberConfig) {
        let funcMatch = config as FunctionConfig;
        if (params.length > 0 && (!funcMatch.params || funcMatch.params.length == 0)) {
            return false;
        }

        if (funcMatch.params && params.length != funcMatch.params.length) {
            return false;
        }

        for(var i = 0; i < params.length; i++) {
            if (funcMatch.params[i] != params[i]) {
                return false;
            }
        }

        return true;
    }

    public match(name: string, params: Array<any>, calls: Array<MemberConfig>) : MemberConfig {
        let nameMatches = calls.filter(x => x.name == name);
        for(var nameMatch of nameMatches) {
            if (this.matches(params, nameMatch)) {
                return nameMatch;
            }            
        }
        return null;
    }
}