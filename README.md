# Toq
Toq is a Moq-inspired mocking library for TypeScript, with support for AVA.

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

# AVA support
WIP