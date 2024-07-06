export function throttle(fn: Function, delay: number) {
  let last = 0;

  return (...args: any[]) => {
    const now = new Date().getTime();

    if (now - last < delay)
      return;
    last = now;

    return fn(...args);
  };
}