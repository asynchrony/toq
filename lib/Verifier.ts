import { MockConfig } from './MockConfig'
import { FunctionConfig } from './FunctionConfig'

export class Verifier<TMock extends object> {
    constructor(private config: MockConfig<TMock>, private type: new () => TMock) {

    }

    private getCallExpression(asFunc: FunctionConfig) : string {
        let callExpression = asFunc.params ? `(${asFunc.params.map(x => JSON.stringify(x)).join(',')})` : '';
        return `${asFunc.memberName}${callExpression}`;
    }

    public verify(): void {
        let uncalled = this.config.uncalledSetups;
        if (uncalled.length > 0) {
            let uncalledErrors = uncalled.map(x => this.getCallExpression(x as FunctionConfig));
            throw new Error(`The following calls on ${(this.type as any).name} were setup, but not invoked: \n${uncalledErrors.join('\n')}`);
        }
    }

    public limit(): void {
        let unconfigured = this.config.unconfiguredCalls;
        if (unconfigured.length > 0) {
            let inappropriateCalls = unconfigured.join(', ');
            throw new Error(`The following members were accessed on ${(this.type as any).name}, but were not set up: \n${inappropriateCalls}`);
        }
    }
}