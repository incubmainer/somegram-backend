export class Notification<T = null, E = null> {
  code: symbol;
  data: T | null = null;
  errors: E[] = [];
  constructor(code: symbol) {
    this.code = code;
  }

  setData(data: T): void {
    this.data = data;
  }

  getData(): T | null {
    return this.data;
  }

  setCode(code: symbol) {
    this.code = code;
  }

  getCode(): symbol {
    return this.code;
  }

  addError(error: E) {
    this.errors.push(error);
  }

  addErrors(errors: E[]) {
    this.errors.push(...errors);
  }

  getErrors(): E[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}
