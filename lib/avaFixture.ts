import { Fixture } from './Fixture'
import { TestRegister } from './TestRegister'
import test from 'ava'

export function avaFixture<TClass>(constructor?: new (...dependencies: Array<any>) => TClass, ...depedencyTypes: Array<new () => any>) {
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
