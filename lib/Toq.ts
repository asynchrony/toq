import { MockConfig } from './MockConfig'
import { MemberConfig } from './MemberConfig'
import { MockSetupObject } from './MockSetupObject'
import { CallConfigurer } from './CallConfigurer'
import { FunctionConfig } from './FunctionConfig'
import { Any } from './Any'
import { Verifier } from './Verifier'

export class Toq<TMock> {
    private config: MockConfig<TMock>;
    private verifier: Verifier<TMock>;

    constructor(private type: new () => TMock) {
        this.config = new MockConfig(type);
        this.verifier = new Verifier(this.config, type);
    }

    public setup<TReturn>(setup: (config: TMock) => TReturn): CallConfigurer<TReturn> {
        let mockSetup = new MockSetupObject(this.type);
        let setupResult = setup(mockSetup as any) as any;
        let memberConfig = setupResult as MemberConfig;

        this.config.addCall(memberConfig);
        return new CallConfigurer<TReturn>(memberConfig);
    }

    public get object(): TMock {
        return this.config.createMock();
    }

   public verify(): void {
       this.verifier.Verify();
   } 
}
