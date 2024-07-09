export class Notification<T = null> {
  code: symbol;
  data: T | null = null;
  constructor(code: symbol) {
    this.code = code;
  }

  setData(data: T) {
    this.data = data;
  }

  getDate(): T | null {
    return this.data;
  }

  setCode(code: symbol) {
    this.code = code;
  }

  getCode(): symbol {
    return this.code;
  }
}
