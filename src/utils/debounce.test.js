// @flow
import debounce from './debounce';

it('should debounce all the calls in the same tick', () => {
  let called = 0;
  const debounced = debounce(() => {
    called += 1;
    return called;
  });
  debounced();
  debounced();
  return debounced().then(one => {
    expect(called).toEqual(1);
    expect(called).toEqual(one);
  });
});

it('should debounce and run the function once in the next tick', () => {
  let called = 0;
  const debounced = debounce(() => (called += 1));
  debounced();
  return debounced().then(one => {
    expect(one).toEqual(1);
    debounced();
    return debounced().then(two => {
      expect(called).toEqual(2);
      expect(called).toEqual(two);
    });
  });
});
