import { FunctionConfig } from './FunctionConfig'
import { PropertyConfig } from './PropertyConfig'

export function mockSetupObject<TMock extends object>() : TMock {
    let handler: ProxyHandler<TMock> = {
        get(target: TMock, name: string) {
            let propertyVersion = new PropertyConfig(name);
            return new Proxy(propertyVersion, {
                apply(target: PropertyConfig, thisObject: any, args: any[]) {
                    return new FunctionConfig(target.name, args);
                }
            });
        }
    };

    return new Proxy({} as TMock, handler);
}
