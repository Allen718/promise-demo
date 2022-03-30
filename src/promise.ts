import * as chai from "chai";
class Promise1 {
  callbacks = [];
  state = "pending";
  private resolveOrReject(state, data, i) {
    if (this.state !== "pending") return;
    this.state = state;
    nextTick(() => {
      this.callbacks.forEach((handle) => {
        if (typeof handle[i] === "function") {
          let x;
          try {
            x = handle[i].call(undefined, data);
          } catch (error) {
            return handle[2].reject(error);
          }
          handle[2].resolveWith(x);
        }
      });
    });
  }
  resolve(result) {
    this.resolveOrReject("fulfilled", result, 0);
  }
  reject(reason) {
    this.resolveOrReject("rejected", reason, 1);
  }
  constructor(fn) {
    if (typeof fn !== "function") {
      throw new Error("必须接受函数为参数");
    }
    fn(this.resolve.bind(this), this.reject.bind(this));
  }

  then(succeed?, fail?) {
    const handle = [];
    if (typeof succeed === "function") {
      handle[0] = succeed;
    }
    if (typeof fail === "function") {
      handle[1] = fail;
    }
    handle[2] = new Promise1(() => {});
    this.callbacks.push(handle);
    return handle[2];
  }
  resolveWithSelf() {
    this.reject(new TypeError());
  }
  resolveWithPromise(x) {
    x.then(
      (result) => {
        this.resolve(result);
      },
      (reason) => {
        this.reject(reason);
      }
    );
  }
  resolveWithThenable(x) {
    try {
      x.then(
        (y) => {
          this.resolveWith(y);
        },
        (r) => {
          this.reject(r);
        }
      );
    } catch (e) {
      this.reject(e);
    }
  }
  resolveWithObject(x) {
    let then;
    try {
      then = x.then;
    } catch (error) {
      this.reject(error);
    }
    if (x instanceof Function) {
      this.resolveWithThenable(x);
    } else {
      this.resolve(x);
    }
  }

  resolveWith(x) {
    if (this === x) {
      this.resolveWithSelf();
    } else if (x instanceof Promise1) {
      this.resolveWithPromise(x);
    } else if (x instanceof Object) {
      this.resolveWithObject(x);
    } else {
      this.resolve(x);
    }
  }
}
function nextTick(fn) {
  if (process !== undefined && typeof process.nextTick === "function") {
    return process.nextTick(fn);
  } else {
    var counter = 1;
    var observer = new MutationObserver(fn);
    var textNode = document.createTextNode(String(counter));

    observer.observe(textNode, {
      characterData: true,
    });

    counter = counter + 1;
    textNode.data = String(counter);
  }
}
export default Promise1;
