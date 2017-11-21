# Toq
Toq is a Moq-inspired mocking library for TypeScript, with support for AVA.

# Installation
`npm install --save-dev @asynchrony/toq`

# Usage

## Basic Usage
Consider the following class:
```typescript
class TypeToMock {
    get property() { 
        return 'whatever'; 
    }

    function(argument: string) {
        return argument;
    }
}
```

We can mock its members like this:
```typescript
let toq = new Toq(TypeToMock);
let instance = toq.object;

toq.setup(x => x.property).returns('I am fake');
instance.property //'I am fake'

toq.setup(x => x.function('cake')).returns('is gross');
toq.setup(x => x.function('pie')).returns('can be nice');
instance.function('cake'); //'is gross'
instance.function('pie'); //'can be nice'

instance.function('some other value'); //undefined
```

## Any
You can also use placeholders:
```typescript
toq.setup(x => x.function(Any<string>())).returns('you get this for anything');
instance.function('a'); //'you get this for anything'
instance.function('b'); //'you get this for anything'
```
More specific setups override less specific ones when determining return value:
```typescript
toq.setup(x => x.function('setup').returns('I specifically set up this call');
instance.function('a'); //'you get this for anything'
instance.function('setup'); //'I specifically set up this call'
```
When there are multiple setups with the same specificity (same number of `Any<T>` arguments), the more recent setup wins:
```typescript
toq.setup(x => x.function('setup').returns('first setup');
toq.setup(x => x.function('setup').returns('second setup');
instance.function('setup'); //'second setup'

toq.setup(x => x.function(Any<string>())).returns('any setup');
instance.function('setup');//still 'second setup'
```

## Callback
You can specify a callback to be called when a setup is invoked.

Callbacks and call tracking are performed for *all* matching setups, even if their return values are overriden by a higher setup match.
```typescript
toq.setup(x => x.function('a')).callback<string>(arg => console.log(`arg was ${arg}`));
instance.function('a'); //prints 'arg was a'
```
Callbacks are commonly used along with `Any<T>` to perform more complex validation:
```typescript
toq.setup(x => x.function(Any<string>())).callback<string>(arg => {
    if (arg[0] != 'a')
        throw new Error("The arg didn't start with 'a'!");
});
instance.function('b'); //throws an exception
```

## Verify and Optional
You can call `verify()` on a Toq to verify that all configured calls have occured:
```typescript
toq.setup(x => x.function('you must call me with this string'));
toq.verify(); //throws an exception
```
Setups marked with `optional()` will not trigger exceptions if they are not called:
```typescript
toq.setup(x => x.function(Any<string>()));
toq.setup(x => x.function('I am optional')).optional();

instance.function('satisfying the Any<> setup');

toq.verify(); //no exception
```

## Limit
You can call limit to ensure that no access you have *not* setup has occured:
```typescript
toq.setup(x => x.function('this is the only valid string'));
instance.function('this is the only valid string');
instance.function('this was not set up');

toq.verify(); //no exception
toq.limit(); //throws an exception
```

## Classify
Sometimes you need to mock an interface. However, interfaces don't exist at runtime and cannot be passed as parameters. For these cases, you can create a proxy class to mock via `Classify<TInterface>()`:

```typescript
interface Thing { 
    doThing(): void;
}

let mock = new Toq(Thing); //Compile error

let ClassyThing = classify<Thing>();
let mock = new Toq(ClassyThing);
mock.setup(x => x.doThing()); //Happy times
```

# AVA support
Toq has built-in support for testing, leveraging the AVA framwork. Let's imagine we have a type we want to test, `Subject`:
```typescript
class Subject {
    constructor(private dependency: Dependency) { }

    public pureFunction(): boolean {
        return !this.dependency.getBoolean();
    }

    public sideEffect(effectToCause: any): void {
        this.dependency.causeSideEffect(effectToCause);
    }
}
```
And this dependency:
```typescript
class Dependency {
    public getBoolean() { return true; }
    public causeSideEffect(effectToCause: any) { }
}
```
We can test `Subject` with a `Fixture<Subject>` like this:
```typescript
//Define a fixture with <Subject, ...DependencyTypes>
@avaFixture(Subject, Dependency)
class SubjectFixture extends Fixture<Subject> {

    @avaTest
    public returns_negation_of_dependency_boolean(t: TestContext) {
        let coinFlip = Math.random() > 0.5;
        this.mock(Dependency)
            .setup(x => x.getBoolean())
            .returns(coinFlip);
        
        let result = this.testObject.pureFunction();
        t.is(result, !coinFlip);
    }

    @avaTest
    public causes_side_effect(t: TestContext) {
        let effect = Math.random();
        this.mock(Dependency)
            .setup(x => x.causeSideEffect(effect));

        this.testObject.causeSideEffect(effect);

        this.mock(Dependency).verify();
    }
}
```

## `@beforeEach` and `@only`
There are a few other helpful decorators for fixtures, `@beforeEach` and `@only`.

`@beforeEach` defines a function that should be run before each test in the fixture:

```typescript
@avaFixture(Subject, Dependency)
class SubjectFixture extends Fixture<Subject> {
    @beforeEach
    public void setup(t: TestContext) {
        //setup this.mock(T), or do any other setup
    }
}
```

`@only` is equivalent to `test.only()` in vanilla AVA. It specifies that only tests decorated with it should be run in the current file:
```typescript
@only
@avaTest
public t1(t: TestContext) {
    //I'll run
}

@avaTest
public t2(t: TestContext) {
    //I won't run
}
```

## Other AVA notes
`@avaTest` tests are run *in parallel* and *in isolation*. They each get a separate instance of the `Fixture<Subject>` class as their `this`. This brings with it a few things to remember:

* `@beforeEach` only runs once on a given instance.
* Any state on your fixture (instance members you define for instance) will be completely independent of other `@avaTests` in the same fixture.
* Any `this.mock(TMock)` setup done in an `@avaTest` is isolated to that test.
* Any `this.mock(TMock)` setup done in the `@beforeEach` runs on each instance though, so it will affect each `@avaTest` independently.


This means that, barring globals and statics, you should not be able to interfere with one test from another - they each get their own sandbox. An example is illustrative:

```typescript
@avaFixture(Subject, Dependency)
class SubjectFixture extends Fixture<Subject> {
    private localState: string;

    @beforeEach
    public void setup(t: TestContext) {
        this.localState = "I am stateful";
    }

    @avaTest
    public t1(t: TestContext) {
        t.is(this.localState, "I am stateful");
        this.localState = "I have mucked with the state";
    }

    @avaTest
    public t2(t: TestContext) {
        t.is(this.localState, "I am stateful");
        this.localState = "I have also mucked with the state";
    }
}
```
Both of these tests will pass, because `t1()` and `t2()` will be passed different instances of `SubjectFixture`.