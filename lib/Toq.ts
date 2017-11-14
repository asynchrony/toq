import { MockConfig } from './MockConfig'
import { MemberConfig } from './MemberConfig'
import { mockSetupObject } from './MockSetupObject'
import { CallConfigurer } from './CallConfigurer'
import { FunctionConfig } from './FunctionConfig'
import { Any } from './Any'
import { Verifier } from './Verifier'

export class Toq<TMock extends object> {
    private config: MockConfig<TMock>;
    private verifier: Verifier<TMock>;
    private builtMock: TMock;
    public typeName: string;        

    constructor(public type: new () => TMock) {
        this.config = new MockConfig(type);
        this.verifier = new Verifier(this.config, type);
        this.typeName = (type as any).name;
    }

    public setup<TReturn>(setup: (config: TMock) => TReturn): CallConfigurer<TReturn> {
        let mockSetup = mockSetupObject<TMock>();
        let setupResult = setup(mockSetup) as any;
        let memberConfig = setupResult as MemberConfig;

        this.config.addCall(memberConfig);
        return new CallConfigurer<TReturn>(memberConfig);
    }

    public get object(): TMock {
        this.builtMock = this.builtMock || this.config.createMock();
        return this.builtMock;
    }

    public verify(): void {
        this.verifier.verify();
    }

    public limit(): void {
        this.verifier.limit();
    }
}

export function classify<TInterface>() : new() => TInterface {
    interface ctor {
        new(): TInterface
    }

    return {} as ctor;
}
