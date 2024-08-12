export function applyResizeObserverPolyfill() {
    const THROTTLE_TIMEOUT = 300;
  
    class ResizeObserverPolyfill {
      constructor(callback) {
        this.callback = callback;
        this.observables = new Map();
        this.boundCheck = this.check.bind(this);
        this.boundCheck._throttled = this.throttle(this.boundCheck, THROTTLE_TIMEOUT);
      }
  
      observe(target) {
        if (this.observables.has(target)) return;
        const observable = { target, size: { height: 0, width: 0 } };
        this.observables.set(target, observable);
        this.check();
      }
  
      unobserve(target) {
        this.observables.delete(target);
      }
  
      disconnect() {
        this.observables.clear();
      }
  
      check() {
        const changedEntries = [];
        this.observables.forEach((observable) => {
          const { target } = observable;
          const newSize = { height: target.clientHeight, width: target.clientWidth };
          if (newSize.height !== observable.size.height || newSize.width !== observable.size.width) {
            observable.size = newSize;
            changedEntries.push([target, newSize]);
          }
        });
        if (changedEntries.length > 0) {
          this.callback(changedEntries);
        }
        window.requestAnimationFrame(this.boundCheck._throttled);
      }
  
      throttle(func, limit) {
        let inThrottle;
        return function() {
          const args = arguments;
          const context = this;
          if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        }
      }
    }
  
    if (typeof window !== 'undefined' && !window.ResizeObserver) {
      window.ResizeObserver = ResizeObserverPolyfill;
      console.log('ResizeObserver polyfill applied');
    }
  
    // 전역 에러 핸들러 추가
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && /ResizeObserver loop completed with undelivered notifications/.test(args[0])) {
        return;
      }
      originalError.apply(console, args);
    };
  }