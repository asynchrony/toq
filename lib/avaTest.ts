import { Fixture } from './Fixture'
import { TestRegister, TestRegistration } from './TestRegister'
import { avaFixture } from './avaFixture'

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
