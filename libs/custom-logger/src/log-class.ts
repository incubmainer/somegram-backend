import { CustomLoggerService } from './custom-logger.service';

type Constructor<T = {}> = new (...args: any[]) => T;

interface LogClassOptions {
  level: string;
  loggerClassField: string;
  active?: () => boolean;
}

function safeStringify(value: any): string {
  try {
    return JSON.stringify(value);
  } catch {
    return 'can_not_parse';
  }
}

function logInput(
  logger: CustomLoggerService,
  level: string,
  methodName: string,
  startTime: number,
  args: any[],
) {
  const inputValues = safeStringify(args);
  logger.log(level, `input ${methodName}`, {
    method: methodName,
    startTime,
    inputValues,
  });
}

function logOutput(
  logger: CustomLoggerService,
  level: string,
  methodName: string,
  startTime: number,
  result: any,
) {
  const endTime = Date.now();
  const outputValues = safeStringify(result);
  logger.log(level, `output ${methodName}`, {
    method: methodName,
    endTime,
    outputValues,
    executionTime: endTime - startTime,
  });
}

function logError(
  logger: CustomLoggerService,
  level: string,
  methodName: string,
  startTime: number,
  err: any,
) {
  const endTime = Date.now();
  logger.log(level, `output ${methodName} error`, {
    method: methodName,
    endTime,
    outputValues: null,
    executionTime: endTime - startTime,
    outputError: safeStringify(err),
  });
}

async function handleAsyncMethod(
  logger: CustomLoggerService,
  level: string,
  methodName: string,
  startTime: number,
  result: Promise<any>,
) {
  try {
    const res = await result;
    logOutput(logger, level, methodName, startTime, res);
    return res;
  } catch (err) {
    logError(logger, level, methodName, startTime, err);
    throw err;
  }
}

function createLoggerDecorator(
  methodName: string,
  originalMethod: Function,
  loggerClassField: string,
  level: string,
) {
  return function (...args: any[]) {
    const logger: CustomLoggerService = this[loggerClassField];

    if (!logger) {
      throw new Error(`Logger not found at field ${loggerClassField}`);
    }

    const startTime = Date.now();
    logInput(logger, level, methodName, startTime, args);

    try {
      const result = originalMethod.apply(this, args);

      if (result && typeof result.then === 'function') {
        return handleAsyncMethod(logger, level, methodName, startTime, result);
      } else {
        logOutput(logger, level, methodName, startTime, result);
        return result;
      }
    } catch (err) {
      logError(logger, level, methodName, startTime, err);
      throw err;
    }
  };
}

export function LogClass(options: LogClassOptions) {
  const { level, loggerClassField, active = () => true } = options;

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
              loggerClassField,
              level,
            ).bind(this);
          }
        }
      }
    }

    Object.defineProperty(WrappedClass, 'name', { value: className });

    return WrappedClass;
  };
}
