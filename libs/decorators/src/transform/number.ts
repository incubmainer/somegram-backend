import { Transform, TransformFnParams } from 'class-transformer';

export const TransformToNumber = () =>
  Transform(({ value }: TransformFnParams) => {
    const numberValue = +value;
    if (isNaN(numberValue) || !Number.isInteger(numberValue)) {
      return false;
    }
    return numberValue;
  });
