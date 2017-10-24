import { Fixture } from './Fixture'
import test from 'ava'
declare var v8debug: any;

export function avaFixture<TClass>(constructor: new (...dependencies: Array<any>) => TClass, ...depedencyTypes: Array<new () => any>) {
    return function (target: any) {
        let type = target as new (constructor: new (...dependencies: Array<any>) => TClass, ...dependencyTypes: Array<any>) => Fixture<TClass>;
        let register = type.prototype as TestRegister<TClass>;
        for (var registration of register.testRegistrations) {
            let isOnly = (register.onlyTests != undefined && register.onlyTests.indexOf(registration.methodName) != -1);
            let fixture = new type(constructor, ...depedencyTypes) as any;
            let testName = (type as any).name + ": " + registration.testName;

            if (isOnly) {
                test.only(testName, fixture[registration.methodName].bind(fixture));
            } else {
                test(testName, fixture[registration.methodName].bind(fixture));
            }
        }
    }
}

export function avaTest<TClass, T extends Fixture<TClass>>(target: T, propertyKey: string, descriptor: any) {
    let register = target as any as TestRegister<TClass>;
    if (register.testRegistrations == undefined) {
        register.testRegistrations = [];
    }

    register.testRegistrations.push(new TestRegistration(propertyKey));
}

export function only<TClass, T extends Fixture<TClass>>(target: T, propertyKey: string, descriptor: any) {
    let register = target as any as TestRegister<TClass>
    register.onlyTests = register.onlyTests || [];
    register.onlyTests.push(propertyKey);
}

class TestRegistration {
    public get testName(): string {
        return this.methodName.replace(new RegExp("_", "g"), ' ');
    }

    constructor(public methodName: string) {

    }
}

interface TestRegister<TClass> extends Fixture<TClass> {
    testRegistrations: Array<TestRegistration>;
    isOnly: boolean;
    onlyTests: Array<string>;
}
