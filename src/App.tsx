import { useCallback, useEffect, useState } from 'react'
import './App.css'

const App: React.FunctionComponent = (): React.ReactNode => {

  console.log('render');

  const initialStepDelay = 2;
  const initialCount = 0;

  const [count, setCount] = useState<number>(initialCount);
  const [arrayOfCount, setArrayOfCount] = useState([initialCount]);
  const [theme, setTheme] = useState<string>("dark");
  const [delay, setDelay] = useState<number>(initialStepDelay);
  const [step, setStep] = useState<number>(1);
  const [focused, setFocused] = useState<boolean>(false);

  let focusedText = focused ? "This element is currently focused.  Pressing 'ArrowUp' and 'ArrowDown' will increment or decrement count." : "This element is not currently focused.  Pressing 'ArrowUp' and 'ArrowDown' will do nothing.";

  const handleDelay = () => {
    setDelay(prev => prev === 0 ? initialStepDelay : 0);
  };

  const handleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const handleToggleFocused = () => {
    setFocused(prev => {
      console.log(`Setting to ${!prev}`);
      return !prev;
    });
  };

  const handleKeyDown = useCallback((event: any) => {
    if (event.code === 'ArrowUp') {
      // handleStepUp();
      let newValue: number;
      setCount(prev => {
        newValue = prev + step;
        console.log(`hKD firing with ${step}`);
        return newValue;
      });
      setArrayOfCount(prev2 => [...prev2, newValue]);
    } else if (event.code === 'ArrowDown') {
      let newValue: number;
      setCount(prev => {
        newValue = prev - step;
        console.log(`hKD firing with ${step}`);
        return newValue;
      });
      setArrayOfCount(prev2 => [...prev2, newValue]);
      // handleStepDown();
    }
  }, [step]); // dependencies: The list of all reactive values referenced inside of the fn code. Reactive values include props, state, and all the variables and functions declared directly inside your component body. If your linter is configured for React, it will verify that every reactive value is correctly specified as a dependency. The list of dependencies must have a constant number of items and be written inline like [dep1, dep2, dep3]. React will compare each dependency with its previous value using the Object.is comparison algorithm.  Note - previously had 'focused' in console.log; removed.

  // 'step' needs to be in dependencies.  If not, then stuff like NaN or whatever weird things show up, arrow keys don't do what they're supposed to.  Probably what's happening is the function is not really being called each time; it's stored in useCallback or something, along with any references to state.  When 'step' is not listed in dependencies, the old version of the function with the old version of 'step' is called, hence why it increments/decrements by 1 despite step being changed.  Listing 'step' in dependencies, I think causes useCallback to update the function when 'step' is updated, so 'step''s stored value in the stored function correctly updates.  Can't recreate the weird 'NaN' or 'object' or whatever.  Eh.

  // this thing needs to wipe memory too.
  const handleReset = () => {
    setCount(0);
    setArrayOfCount([0]);
  }

  const handleStepChange = (stepValue: number) => {
    setStep(stepValue);
  };

  const handleStepDown = () => {
    let newValue: number;
    setCount(prev => {
      newValue = prev - step;
      console.log(`hSD firing with ${step}`);
      return newValue;
    });
    setArrayOfCount(prev2 => [...prev2, newValue]); // calling setArrayOfCount inside setCount causes two renders, causing setArrayOfCount to trigger twice.  Alternate fix would be to simply use last value of setArrayOfCount for count.  Makes more sense in data terms too.  (Don't Repeat Yourself).  But keeping count and arrayOfCount as separate states allows getting used to mixing states, so it's good in the end.
  };

  const handleStepUp = () => {
    let newValue: number;
    setCount(prev => {
      newValue = prev + step;
      console.log(`hSU firing with ${step}`);
      return newValue;
    });
    setArrayOfCount(prev2 => [...prev2, newValue]);
  }

  useEffect(() => {
    console.log('focus useEffect triggered');
    if (focused) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      console.log(`Attempting to remove eventlistener while focused ${focused}`);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focused]);

  /**
   * Utilize the useEffect hook to perform side effects in response to state changes.
  Implement proper cleanup functions within useEffect to prevent memory leaks or unexpected behavior.
  
  Apply your knowledge to build a feature-rich counter with history tracking, auto-save, keyboard interactions, and a reset mechanism.
  
  Use useEffect to save the current count to local storage whenever it changes.
  Ensure you handle potential race conditions or cleanup if the count changes again before the “save” completes. (Hint: cleanup function in useEffect).
  
  Allow the user to increment the count by pressing the “ArrowUp” key.
  Allow the user to decrement the count by pressing the “ArrowDown” key.
  Use useEffect to add and remove these event listeners to the document.
  Ensure event listeners are cleaned up when the component unmounts or is no longer active.
  Toggle this with arrowup/arrowdown toggle.  'when the omp
  
   */

  return (

    <div className={`${theme} textaligncenter vhvw100 container`}>

      <div className='flexh jc-spacebetween border alignitemscenter bar1'>
        <h1>Module 10 Lab 1</h1>
        <div className='flexh border alignitemscenter'>
          <div>
            <div className='space-right'>Time Delay:</div>
            <h2>{delay} Seconds. </h2>
          </div>
          <button id='widebutton' onClick={handleDelay}>Set Delay To {delay === 0 ? initialStepDelay : 0} Seconds</button>
          <div className='mediumsize'>New entries for 'count' are printed and saved to localStorage after a {delay} second delay.  Any discrepancies in state are addressed in useEffect cleanup. </div>
        </div>
        <button onClick={handleTheme}>Toggle {theme}</button>
      </div>

      <div className='flexh jc-spaceevenly border'>
        <div className='flexh border alignitemscenter'>
          <div>
            <h2>Change Step Value</h2>
            <input type='number' value={step} onChange={(event) => { handleStepChange(Number(event.target.value)) }} />
          </div>
        </div>
        <div className='flexh border focusme alignitemscenter' tabIndex={0} onFocus={handleToggleFocused} onBlur={handleToggleFocused}>
          <div>
            <h2>Click or Tab Here To Focus</h2>
            <div className='count-text'>{focusedText}</div>
          </div>
          <div className='border'>
            <h2>Current Count:</h2>
            <h2> {count}</h2>
          </div>
          <button onClick={handleStepUp}>Count + {step}</button>
          <button onClick={handleStepDown}>Count - {step}</button>
        </div>
        <button id='widerbutton' className='reset-count' onClick={handleReset}>Reset Count and Clear History</button>
      </div>

      <div className='flexh jc-spaceevenly alignitemscenter border'>
        <div className='flexh border alignitemscenter'>
          <h2>Previous Counts:</h2>
          <div>{arrayOfCount.join(", ")}</div>
        </div>
      </div>


      <div className='flexh jc-spaceevenly border'>


      </div>




    </div>

  )
}

export default App;
