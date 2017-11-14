import { Fixture } from './Fixture'
import { TestContext } from 'ava';

export class TestRegistration {
    public get testName(): string {
        return this.methodName.replace(new RegExp("_", "g"), ' ');
    }

    constructor(public methodName: string) {

    }
}

export interface TestRegister<TClass> extends Fixture<TClass> {
    testRegistrations: Array<TestRegistration>;
    isOnly: boolean;
    onlyTests: Array<string>;
    beforeEachName: string;
}