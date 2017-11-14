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
let toqOfType = new Toq(TypeToMock);
let instance = toqOfType.object;

toqOfType.setup(x => x.property).returns('I am fake');
instance.property //'I am fake'

toqOfType.setup(x => x.function('cake')).returns('is gross');
toqOfType.setup(x => x.function('pie')).returns('can be nice');
instance.function('cake'); //'is gross'
instance.function('pie'); //'can be nice'

instance.function('some other value'); //undefined
```

## Any
You can also use placeholders:
```typescript
toqOfType.setup(x => x.function(Any<string>())).returns('you get this for anything');
instance.function('a'); //'you get this for anything'
instance.function('b'); //'you get this for anything'
```
More specific setups override less specific ones when determining return value:
```typescript
toqOfType.setup(x => x.function('setup').returns('I specifically set up this call');
instance.function('a'); //'you get this for anything'
instance.function('setup'); //'I specifically set up this call'
```
When there are multiple setups with the same specificity (same number of `Any<T>` arguments), the more recent setup wins:
```typescript
toqOfType.setup(x => x.function('setup').returns('first setup');
toqOfType.setup(x => x.function('setup').returns('second setup');
instance.function('setup'); //'second setup'

toqOfType.setup(x => x.function(Any<string>())).returns('any setup');
instance.function('setup');//still 'second setup'
```

## Callback
You can specify a callback to be called when a setup is invoked.

Callbacks and call tracking are performed for *all* matching setups, even if their return values are overriden by a higher setup match.
```typescript
toqOfType.setup(x => x.function('a')).callback<string>(arg => console.log(`arg was ${arg}`));
instance.function('a'); //prints 'arg was a'
```
Callbacks are commonly used along with `Any<T>` to perform more complex validation:
```typescript
toqOfType.setup(x => x.function(Any<string>())).callback<string>(arg => {
    if (arg[0] != 'a')
        throw new Error("The arg didn't start with 'a'!");
});
instance.function('b'); //throws an exception
```

## Verify and Optional
You can call verify() on a Toq to verify that all configured calls have occured:
```typescript
toqOfType.setup(x => x.function('you must call me with this string'));
toqOfType.verify(); //throws an exception
```
Setups marked with `optional()` will not trigger exceptions if they are not called:
```typescript
toqOfType.setup(x => x.function(Any<string>()));
toqOfType.setup(x => x.function('I am optional')).optional();

instance.function('satisfying the Any<> setup');

toqOfType.verify(); //no exception
```

## Limit
You can call limit to ensure that no access you have *not* setup has occured:
```typescript
toqOfType.setup(x => x.function('this is the only valid string'));
instance.function('this is the only valid string');
instance.function('this was not set up');

toqOfType.verify(); //no exception
toqOfType.limit(); //throws an exception
```

# AVA support
WIP