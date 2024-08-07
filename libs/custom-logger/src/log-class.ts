import { CustomLoggerService } from './custom-logger.service';

type Constructor<T = {}> = new (...args: any[]) => T;

interface LogClassOptions {
  level: string;
  loggerClassField: string;
  active?: () => boolean;
}

export function LogClass(options: LogClassOptions) {
  const { level, loggerClassField, active = () => true } = options; // Устанавливаем значение по умолчанию

  return function <T extends Constructor>(Base: T) {
    if (!active()) {
      return Base;
    }

    const className = Base.name;

    class WrappedClass extends Base {
      constructor(...args: any[]) {
        super(...args);

        const methodNames = Object.getOwnPropertyNames(Base.prototype);
        for (const methodName of methodNames) {
          if (
            methodName !== 'constructor' &&
            typeof this[methodName] === 'function'
          ) {
            const originalMethod = this[methodName];
            this[methodName] = createLoggerDecorator(
              methodName,
              originalMethod,
            ).bind(this);
          }
        }

        function createLoggerDecorator(
          methodName: string,
          originalMethod: Function,
        ) {
          return function (...args: any[]) {
            const logger: CustomLoggerService = this[loggerClassField];

            if (!logger) {
              throw new Error(`Logger not found at field ${loggerClassField}`);
            }

            const startTime = Date.now();
            const inputValues = JSON.stringify(args);
            logger.log(level, `input ${methodName}`, {
              method: methodName,
              startTime,
              inputValues,
            });

            try {
              const result = originalMethod.apply(this, args);

              if (result && typeof result.then === 'function') {
                return result
                  .then((res: any) => {
                    const endTime = Date.now();
                    logger.log(level, `output ${methodName}`, {
                      method: methodName,
                      endTime,
                      outputValues: JSON.stringify(res),
                      executionTime: endTime - startTime,
                    });
                    return res;
                  })
                  .catch((err: any) => {
                    const endTime = Date.now();
                    logger.log(level, `output ${methodName} error`, {
                      method: methodName,
                      endTime,
                      outputValues: null,
                      executionTime: endTime - startTime,
                      outputError: JSON.stringify(err),
                    });
                    throw err;
                  });
              } else {
                const endTime = Date.now();
                logger.log(level, `output ${methodName}`, {
                  method: methodName,
                  endTime,
                  outputValues: JSON.stringify(result),
                  executionTime: endTime - startTime,
                });
                return result;
              }
            } catch (err) {
              const endTime = Date.now();
              logger.log(level, `output ${methodName} error`, {
                method: methodName,
                endTime,
                outputValues: null,
                executionTime: endTime - startTime,
                outputError: JSON.stringify(err),
              });
              throw err;
            }
          };
        }
      }
    }

    Object.defineProperty(WrappedClass, 'name', { value: className });

    return WrappedClass;
  };
}
