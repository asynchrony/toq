import { MockConfig } from './MockConfig'
import { FunctionConfig } from './FunctionConfig'

export class Verifier<TMock> {
    constructor(private config: MockConfig<TMock>, private type: new () => TMock) {

    }

    private getCallExpression(asFunc: FunctionConfig) : string {
        let callExpression = asFunc.params ? `(${asFunc.params.map(x => JSON.stringify(x)).join(',')})` : '';
        return `${asFunc.name}${callExpression}`;
    }

    public Verify(): void {
        let uncalled = this.config.getUncalled();
        if (uncalled.length > 0) {
            let uncalledErrors = uncalled.map(x => this.getCallExpression(x as FunctionConfig));
            throw new Error(`The following calls on ${(this.type as any).name} were setup, but not invoked: \n${uncalledErrors.join('\n')}`);
        }
    }
}