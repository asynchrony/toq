import { Toq } from "./Toq";

export abstract class Fixture<TClass> {    
    protected testObject: TClass;
    private mocks: Array<Toq<any>> = [];

    constructor(typeCtor: new(...dependencies: Array<any>) => TClass, ...depedencyTypes: Array<new () => any>) {
        for (var dependencyType of depedencyTypes) {
            let mock = new Toq(dependencyType);
            this.mocks.push(mock);
        }

        this.testObject = new typeCtor(...this.mocks.map(x => x.object));
    }

    protected mock<TMock extends object>(ctor: new () => TMock) : Toq<TMock> {
        for(var mock of this.mocks) {
            if (mock.type === ctor) {
                return mock as Toq<TMock>;
            }
        }
        throw new Error(`No mock of type ${ctor.name} is available.`);
    }
}
