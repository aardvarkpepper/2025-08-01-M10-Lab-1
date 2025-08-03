import { useCallback, useEffect, useState } from 'react';
import './App.css';

const App: React.FunctionComponent = (): React.ReactNode => {

  console.log('render');

  const initialStepDelay = 3;
  const initialCount = 0;

  const [count, setCount] = useState<number>(initialCount);
  const [arrayOfCount, setArrayOfCount] = useState([initialCount]);
  const [theme, setTheme] = useState<string>("dark");
  const [delay, setDelay] = useState<number>(initialStepDelay);
  const [step, setStep] = useState<number>(1);
  const [focused, setFocused] = useState<boolean>(false);
  const [feedbackArray, setFeedbackArray] = useState<string[]>([]); // feedbackArray is strictly additive unless it's wiped, so as an exception, it is safe to use index number as a key.
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [renderCount, setRenderCount] = useState<number>(1);

  let focusedText = focused ? "This element is currently focused.  Pressing 'ArrowUp' and 'ArrowDown' will increment or decrement count." : "This element is not currently focused.  Pressing 'ArrowUp' and 'ArrowDown' will do nothing.";

  const handleDelay = () => {
    setDelay(prev => prev === 0 ? initialStepDelay : 0);
  };

  const handleKeyDown = useCallback((event: any) => {
    if (event.code === 'ArrowUp') {
      let newValue: number;
      setCount(prev => {
        newValue = prev + step;
        return newValue;
      });
      setArrayOfCount(prev2 => [...prev2, newValue]);
    } else if (event.code === 'ArrowDown') {
      let newValue: number;
      setCount(prev => {
        newValue = prev - step;
        return newValue;
      });
      setArrayOfCount(prev2 => [...prev2, newValue]);
    }
  }, [step]); // if 'step' is not included, useCallback uses old values of 'step'.

  const handleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const handleToggleFocused = () => {
    setFocused(prev => {
      return !prev;
    });
  };

  // note this needs to wipe memory too.
  const handleReset = () => {
    setCount(prev => 0); // may prevent re-render?
    setArrayOfCount(prev => [0]);
  }

  const handleStepChange = (stepValue: number) => {
    setStep(stepValue);
  };

  const handleStepDown = () => {
    let newValue: number;
    setCount(prev => {
      newValue = prev - step;
      // console.log(`hSD firing with ${step}`);
      return newValue;
    });
    setArrayOfCount(prev2 => [...prev2, newValue]);
  };

  const handleStepUp = () => {
    let newValue: number;
    setCount(prev => {
      newValue = prev + step;
      // console.log(`hSU firing with ${step}`);
      return newValue;
    });
    setArrayOfCount(prev2 => [...prev2, newValue]);
  };

  //whenever count changes, save to localstorage
  // useeffect cleanup if count changes again before 'save' completes.
  // reset button clears tracked history (?).
  /**
   * 1.  Initial load.  useEffect assigns initial values.
   * 2.  When count changes, save to localStorage.
   * 3.  'cleanup' - suppose the user refreshes page.  I think this may cause useEffect cleanup to run.
   */

  const loadFromLocalStorage = () => {
    const retrieveObject = JSON.parse(localStorage.getItem('m10-lab-1') as any);
    console.log(`loadFromLocalStorage invoked with ${JSON.stringify(retrieveObject)}`);
    setCount(retrieveObject.count);
    setArrayOfCount(retrieveObject.arrayOfCount);
    setTheme(retrieveObject.theme);
    setDelay(retrieveObject.delay);
    setStep(retrieveObject.step);
    setFocused(retrieveObject.focused);
    setFeedbackArray(retrieveObject.feedbackArray);
    // setErrorMessage(retrieveObject.errorMessage);
    setErrorMessage(`loadFromLocalStorage render to move data into state.`)
  };

  const saveToLocalStorage = () => {
    const storeObject = {
      count: count,
      arrayOfCount: arrayOfCount,
      theme: theme,
      delay: delay,
      step: step,
      focused: focused,
      feedbackArray: feedbackArray,
      errorMessage: errorMessage
    };
    console.log(`saveToLocalStorage invoked with ${JSON.stringify(storeObject)}`);
    localStorage.setItem('m10-lab-1', JSON.stringify(storeObject));
  };

  useEffect(() => {
    // console.log('focus useEffect triggered');
    if (focused) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      // console.log(`Attempting to remove eventlistener while focused ${focused}`);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focused]);



  /**
   * This simulates saving to a remote API.  Presumably the remote API has some sort of functionality to ensure save data is processed properly.  That is, if a user tries to save a file at time index 1, 2, and 3 in that order, the server may receive those requests at time index 2, 1, 3 in that order.  The server might track 'time sent' then resolve based on that.
   * Here, the 'server' resolves based on arrayOfCount.length.  First, data is saved async with a 2 second delay, and 'isPseudoLoading' is set to true.  This disables saving.  (Alternately, I could randomize the delay for each; might do this anyways in the end, or rotate through some array for controlled behavior for testing.  Randomizing delay could cause save requests to be received in odd order as described previously).
   * 
   * The async delay and prevention of new saves means data is saved at a point in time, after which changes in state can happen, after which 'isPseudoLoading' is set to false and new saves are allowed again.  That means save data can be out of date.
   * 
   * However, when the window is shut down or refreshed, useEffect's return function should run.  This return function will instantly save data.  I don't know what happens if it's saved async (note to try this).  This means even though currently saved data is out of state, the saved data is updated with the last updated state in useEffect's cleanup.
   * 
   * In other words, while the window is running, saved data can be out of date, especially when a user spams state changes while the saving function is turned off.  However, closing or refreshing should update the data.
   * 
   * Note:  I should load the data on loading the page once with useEffect [].
   */

  useEffect(() => {
    let timeoutId: number;
    try {
      timeoutId = setTimeout((one: string) => {
        setFeedbackArray(prev => {
          return [`Data saved with count ${one} and count history [${arrayOfCount}].`, ...prev]
        }); // mixing references for future reference.  Eh.
      }, delay * 1000, String(count));
    } catch (error) {
      if (error instanceof Error) {
        console.error('An error of type Error has occurred while performing useEffect, possibly related to async.', error.message);
      } else {
        console.error('An error that is not of type Error has occurred while performing useEffect, possibly related to async.', String(error));
      }
      setErrorMessage(`Error of ${error instanceof Error ? 'type Error' : 'unknown type'} has occured, possibly related to async.`);
    } finally {
      return () => {
        console.log(`useEffect cleanup for save operations invoked. ${renderCount}`);
        setRenderCount(prev => prev + 1);
        setErrorMessage(`useEffect cleanup for save operations invoked. ${renderCount}`);
        clearTimeout(timeoutId);
        // saveToLocalStorage();
        /**
         * saveToLocalStorage cannot be executed during cleanup phase.  When count (listed in this useEffect's dependencies changes, this cleanup function runs before the state of count is updated.  Therefore data that was loaded from localStorage during the initial render gets overwritten.  Could bypass this with useRef, but probably that's beyond scope of assignment).  Besides, return is for cleanup of things executed in the useEffect, not separate functions.  Possibly this may have some bearing.
         */
         
      }
    }
  }, [count, arrayOfCount]) // test if this causes execution of useEffect twice.
  // the internals do NOT cause a change in count or arrayOfCount so should not cause infinite re-renders.

  /**
  Use useEffect to save the current count to local storage whenever it changes.
  Ensure you handle potential race conditions or cleanup if the count changes again before the “save” completes. (Hint: cleanup function in useEffect).
  */

  useEffect(() => {
    loadFromLocalStorage();
  },[]); // run once on render / reload, then no cleanup.

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 0);
    return () => {
      clearTimeout(timeoutId)
    };
  },[count, arrayOfCount, theme, delay, step, focused, feedbackArray, errorMessage]);
  // in case waiting for async isn't enough, additional 500 ms.

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
          <div className='mediumsize'>New entries for 'count' are printed and saved to localStorage after a {delay} second delay.</div>
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
          <div>{arrayOfCount.join(",")}</div>
        </div>
      </div>

      <div className='jc-spaceevenly border'>
        {feedbackArray.map((element, index) => <div key={`${index}`} className='nth-child'>{(index === 0) ? `LAST ENTRY: ${element}` : element}</div>)}
      </div>

      <div>{errorMessage}</div>

    </div>
  )
}

export default App;