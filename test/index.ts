import * as chai from "chai";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import Promise1 from "../src/promise";
const assert = chai.assert;
chai.use(sinonChai);
describe("promise", () => {
  it("是一个类", () => {
    assert.isFunction(Promise1);
    assert.isObject(Promise1.prototype);
  });
  it("只接受函数为参数", () => {
    assert.throw(() => {
      //@ts-ignore
      new Promise1();
    });

    assert.throw(() => {
      //@ts-ignore
      new Promise1(1);
    });
    assert.throw(() => {
      //@ts-ignore
      new Promise1(false);
    });
  });
  it("会生成一个对象 此对象拥有.then方法", () => {
    const promise = new Promise1(() => {});
    assert.isFunction(promise.then);
  });
  it("接收的函数是立即执行函数", () => {
    const fn = sinon.fake();
    new Promise1(fn);
    assert(fn.called);
  });
  it("传入函数接受两个函数作为参数", () => {
    let called = false;
    const promise = new Promise1((resolve, reject) => {
      called = true;
      assert.isFunction(resolve);
      assert.isFunction(reject);
    });
    assert.isTrue(called);
  });
  it("函数fn接受resolve和reject两个函数作为参数", () => {
    const promise = new Promise1((resolve, reject) => {
      assert.isFunction(resolve);
      assert.isFunction(reject);
    });
  });
  it("promise.then(success)会在resolve被调用的的时候执行", (done) => {
    const success = sinon.fake();
    const promise = new Promise1((resolve, reject) => {
      assert.isFalse(success.called);
      resolve();

      setTimeout(() => {
        assert.isTrue(success.called);
        done();
      });

      console.log("执行了");
    });
    promise.then(success, () => {});
  });
  it("promise.then(null,fail)会在reject被调用的的时候执行", (done) => {
    const fail = sinon.fake();
    const promise = new Promise1((resolve, reject) => {
      assert.isFalse(fail.called);
      reject();

      setTimeout(() => {
        assert.isTrue(fail.called);
        done();
      });

      console.log("执行了");
    });
    promise.then(undefined, fail);
  });
  it("promise.then(succeed,fail) 参数为非函数时不起作用", () => {
    const promise = new Promise1((resolve, reject) => {
      resolve();
    });
    promise.then(false, () => {});
  });
  it("成功只会执行一次", (done) => {
    const succeed = sinon.fake();
    const fail = sinon.fake();
    const promise = new Promise1((resolve, reject) => {
      assert.isFalse(succeed.called);
      resolve(2333);
      resolve(23333);
      setTimeout(() => {
        assert.isTrue(succeed.calledOnce);
        assert.isTrue(promise.state === "fulfilled");
        assert(succeed.calledWith(2333));
        done();
      });
    });
    promise.then(succeed);
  });
  it("失败也只会执行一次", (done) => {
    const fail = sinon.fake();
    const promise = new Promise1((resolve, reject) => {
      assert.isFalse(fail.called);
      reject(2333);
      reject(23333);
      setTimeout(() => {
        assert.isTrue(fail.calledOnce);
        assert.isTrue(promise.state === "rejected");
        assert(fail.calledWith(2333));
        done();
      });
    });
    promise.then(null, fail);
  });
  it("我的代码未执行之前不得调用.then后面的函数", (done) => {
    const success = sinon.fake();
    const promise = new Promise1((resolve, reject) => {
      resolve();
      reject();
      console.log("hello world");

      assert.isFalse(success.called);
      setTimeout(() => {
        assert.isTrue(promise.state === "fulfilled");
        done();
      });
    });
    promise.then(success);
  });
  it("关于.then后面的函数的this问题", (done) => {
    function success() {
      "use strict";
      assert.isTrue(this === undefined);
    }
    const promise = new Promise1((resolve, reject) => {
      resolve();
      setTimeout(() => {
        assert.isTrue(promise.state === "fulfilled");
        done();
      });
    });
    promise.then(success);
  });
  it("then可以多次调用 并且依次执行", (done) => {
    const fn1 = sinon.fake();
    const fn2 = sinon.fake();
    const fn3 = sinon.fake();
    const callbacks = [fn1, fn2, fn3];
    const promise = new Promise1((resolve, reject) => {
      resolve();
      assert.isFalse(fn1.called);
      assert.isFalse(fn2.called);
      assert.isFalse(fn3.called);

      setTimeout(() => {
        assert.isTrue(promise.state === "fulfilled");
        assert.isTrue(fn1.called);
        assert.isTrue(fn2.called);
        assert.isTrue(fn3.called);
        assert(fn2.calledAfter(fn1));
        assert(fn3.calledAfter(fn2));
        done();
      });
    });
    promise.then(callbacks[0]);
    promise.then(callbacks[1]);
    promise.then(callbacks[2]);
  });
  it(".then调用后 返回一个promise", () => {
    const promise1 = new Promise1((resolve) => {});
    const promise2 = promise1.then(
      () => {},
      () => {}
    );
    assert(promise2 instanceof Promise1);
  });
  it(".then调用后 返回一个promise", () => {
    const promise1 = new Promise1((resolve) => {});
    const promise2 = promise1.then(
      () => {},
      () => {}
    );
    assert(promise2 instanceof Promise1);
  });
  it("2.2.7.1 如果 then(success, fail) 中的 success 返回一个值x, 运行 [[Resolve]](promise2, x) ", (done) => {
    const promise1 = new Promise1((resolve) => {
      resolve();
    }).then(() => "成功");
    promise1.then((result) => {
      assert.equal(result, "成功");
      done();
    });
  });
  it("的返回值是一个 Promise 实例，且成功了", (done) => {
    const promise1 = new Promise1((resolve) => {
      resolve();
    });
    const fn = sinon.fake();
    const promise2 = promise1.then(
      () => new Promise1((resolve, reject) => resolve())
    );
    promise2.then(fn);
    setTimeout(() => {
      assert(fn.called);
      done();
    });
  });
  it("的返回值是一个 Promise 实例，且失败", (done) => {
    const promise1 = new Promise1((resolve, reject) => {
      reject();
    });
    const fn = sinon.fake();
    const promise2 = promise1.then(
      null,
      () => new Promise1((resolve, reject) => reject())
    );
    promise2.then(null, fn);
    setTimeout(() => {
      assert(fn.called);
      done();
    }, 0);
  });
  it("的返回值是一个 Promise 实例，且失败", (done) => {
    const promise1 = new Promise1((resolve, reject) => {
      reject();
    });
    const fn = sinon.fake();
    const promise2 = promise1.then(
      null,
      () => new Promise1((resolve, reject) => reject())
    );
    promise2.then(null, fn);
    setTimeout(() => {
      assert(fn.called);
      done();
    }, 0);
  });
  it("的返回值是一个 Promise 实例，且失败", (done) => {
    const promise1 = new Promise1((resolve, reject) => {
      resolve();
    });
    const fn = sinon.fake();
    const promise2 = promise1.then(
      () => new Promise1((resolve, reject) => resolve())
    );
    promise2.then(fn);
    setTimeout(() => {
      assert(fn.called);
      done();
    }, 0);
  });
  it("2.2.7.2 如果success抛出一个异常e,promise2 必须被拒绝", done => {
    const promise1 = new Promise1((resolve, reject) => {
      resolve();
    });
    const fn = sinon.fake();
    const error = new Error();
    const promise2 = promise1.then(() => {
      throw error;
    });
    promise2.then(null, fn);
    setTimeout(() => {
      assert(fn.called);
      assert(fn.calledWith(error));
      done();
    });
  });
});
