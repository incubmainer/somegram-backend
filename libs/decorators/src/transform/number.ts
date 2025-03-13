import { Transform, TransformFnParams } from 'class-transformer';

export const TransformToNumber = () =>
  Transform(({ value }: TransformFnParams) =>
    typeof value === 'number' ? value : Number(value),
  );
