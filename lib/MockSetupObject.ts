import { FunctionConfig } from './FunctionConfig'
import { PropertyConfig } from './PropertyConfig'

export function mockSetupObject<TMock extends object>() : TMock {
    let handler: ProxyHandler<TMock> = {
        get(target: TMock, name: string) {
            let propertyVersion = (...args: any[]) => {
                return new FunctionConfig(name, args);
            };
            let prop = new PropertyConfig(name);
            Object.assign(propertyVersion, prop);
            Object.setPrototypeOf(propertyVersion, (prop as any).__proto__);;
            return propertyVersion;
        }
    };

    return new Proxy({} as TMock, handler);
}
