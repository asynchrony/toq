import { MockConfig } from './MockConfig'
import { MemberConfig } from './MemberConfig'
import { MockSetupObject } from './MockSetupObject'
import { CallConfigurer } from './CallConfigurer'

export class Toq<TMock> {
    private config: MockConfig<TMock>;
    constructor(private type: new () => TMock) {
        this.config = new MockConfig<TMock>(type);
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
}

class Thing {
    public GetNumber(value: number): number {
        return 12;
    }

    public String: string = "";
}

let toq = new Toq(Thing);

toq.setup(x => x.String).returns("kek");
toq.setup(x => x.GetNumber(12)).returns(18);

let mock = toq.object;

console.log(mock.GetNumber(12));
console.log(mock.String);
console.log(mock.GetNumber(1337));