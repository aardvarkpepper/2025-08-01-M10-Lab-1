Re:  useCallback dependencies:

// dependencies: The list of all reactive values referenced inside of the fn code. Reactive values include props, state, and all the variables and functions declared directly inside your component body. If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency. The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3]. React will compare each dependency with its previous value using the Object.is comparison algorithm.  Note - previously had 'focused' in console.log; removed.

// 'step' needs to be in dependencies.  If not, then stuff like NaN or whatever weird things show up, arrow keys don't do what they're supposed to.  Probably what's happening is the function is not really being called each time; it's stored in useCallback or something, along with any references to state.  When 'step' is not listed in dependencies, the old version of the function with the old version of 'step' is called, hence why it increments/decrements by 1 despite step being changed.  Listing 'step' in dependencies, I think causes useCallback to update the function when 'step' is updated, so 'step''s stored value in the stored function correctly updates.  Can't recreate the weird 'NaN' or 'object' or whatever.  Eh.

Re:  setState inside setState: (for setting state of countarray in the process of setting count)

// calling setArrayOfCount inside setCount causes two renders, causing setArrayOfCount to trigger twice.  Alternate fix would be to simply use last value of setArrayOfCount for count.  Makes more sense in data terms too.  (Don't Repeat Yourself).  But keeping count and arrayOfCount as separate states allows getting used to mixing states, so it's good in the end.

## Notes

MDN notes on addEventListener mentioned if an AbortSignal is passed for options's signal, then event listener will be removed when signal is aborted.

## setTimeout

setTimeout((one: string) => {
  setFeedbackArray(prev => {
  console.log(`setTimeout:  The value of 'count' is ${count}; the value of 'one' is ${one}`);
  return [...prev, `Data is being saved with count value ${count}`]});
}, delay * 1000, String(count));

This prints the value of 'count' and 'one', which are the same value; the value existing at the time the setTimeout is called.

const printCount = () => {
  console.log(`printCount invoked.  Current value of count is ${count}`);
}

Writing this function outside setTimeout and invoking it still prints the current value of count.  This make perfect sense, as all that code is synchronous; I expect it's put in a stack or whatever it's called along with then-current references to value.

But what happens if value is stored in an object?  Regardless, I don't really want the value to change.  Could try making the called function async so it exits at the end, but eh.