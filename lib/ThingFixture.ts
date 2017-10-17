import { Fixture } from './Fixture'
import { avaFixture, avaTest } from './ToqAva'
import { TestContext } from 'ava'

export class DependencyOne {
    public getTwelve(input: number): number {
        return 12;
    }
}

export class DependencyTwo {
    public getKek(input: string) : string {
        return "kek";
    }
}

export class Thing {
    constructor(private one: DependencyOne, private two: DependencyTwo) {

    }

    public oneTwoPunch() : string {
        return this.one.getTwelve(1337) + this.two.getKek("hello");
    }
}

@avaFixture(Thing, DependencyOne, DependencyTwo)
export class ThingFixture extends Fixture<Thing> {

    @avaTest
    public gets_twelve_and_kek(t: TestContext) {
        this.mock(DependencyOne)
            .setup(x => x.getTwelve(1337))
            .returns(18);
        
        this.mock(DependencyTwo)
            .setup(x => x.getKek("hello"))
            .returns(" awesome things");

        console.log(this.testObject.oneTwoPunch());
    }
}
