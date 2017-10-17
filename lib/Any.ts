
export function Any<T>() : T {
    return new IsAny() as any;
}

export class IsAny {
    public IsAny : boolean = true;
    public toJSON(thing: any) {
        return "Any<T>";
    }
}