import { FunctionConfig } from './FunctionConfig'
import { PropertyConfig } from './PropertyConfig'

export class MockSetupObject<TMock> {
    private createListner(name: string, type: string): () => any {
        return function (...params: Array<any>) {
            if (type == "function") {
                return new FunctionConfig(name, params);
            } else {
                return new PropertyConfig(name);
            }
        }
    }

    constructor(private ctor: new () => TMock) {
        let example = new ctor() as any;
        let keys = Object.getOwnPropertyNames(example).concat(Object.getOwnPropertyNames(example.__proto__));
        for (var key of keys) {
            let type = typeof (example[key]);
            let listener = this.createListner(key, type);
            if (type == "function") {
                let anyfied = this as any;
                anyfied[key] = listener;
            } else {
                Object.defineProperty(this, key, { get: listener });
            }
        }
    }
}