import { useCallback, useEffect, useState } from 'react';
import './App.css';

const App: React.FunctionComponent = (): React.ReactNode => {

  //console.log('render');

  const initialStepDelay = 3;
  const initialCount = 0;

  const [count, setCount] = useState<number>(initialCount);
  const [arrayOfCount, setArrayOfCount] = useState<number[]>([initialCount]);
  const [theme, setTheme] = useState<string>("dark");
  const [delay, setDelay] = useState<number>(initialStepDelay);
  const [step, setStep] = useState<number>(1);
  const [focused, setFocused] = useState<boolean>(false);
  const [feedbackArray, setFeedbackArray] = useState<string[]>([]); // feedbackArray is strictly additive unless it's wiped, so as an exception it is safe to use index number as a key.
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [renderCount, setRenderCount] = useState<number>(1);

  let focusedText = focused ? "This element is currently focused.  Keypress 'ArrowUp' to increment count, 'ArrowDown' to decrement count." : "This element is not currently focused.  Pressing 'ArrowUp' and 'ArrowDown' will do nothing.";

  const handleDelay = () => {
    setDelay(prev => prev === 0 ? initialStepDelay : 0); // It's a little inelegant that handleDelay is separate to rendering of the button.  But button text shows whatever value state 'delay' is not set to.  This could be handled by making delay [indexToUse: number, arrayOfDelayValues: number[]] and changing indexToUse with +1 / %.
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

  // 'handleReset', I suppose should call a 'reinitialization' method that uses data imported from another file to reset all values.  The same functionality with modification could be used to load in user data files.  But this is fine for the assignment.
  const handleReset = () => {
    setCount(prev => 0); // may prevent re-render?
    setArrayOfCount(prev => [0]);
    localStorage.removeItem('m10-lab-1');
    setCount(initialCount);
    setArrayOfCount([initialCount]);
    setTheme("dark");
    setDelay(initialStepDelay);
    setStep(1);
    setFocused(false);
    setFeedbackArray([]);
    setErrorMessage(`Data has been reset.`);
    setRenderCount(1);
  }

  const handleStepChange = (stepValue: number) => {
    setStep(stepValue);
  };

  const handleStepDown = () => {
    let newValue: number;
    setCount(prev => {
      newValue = prev - step;
      return newValue;
    });
    setArrayOfCount(prev2 => [...prev2, newValue]);
  };

  const handleStepUp = () => {
    let newValue: number;
    setCount(prev => {
      newValue = prev + step;
      return newValue;
    });
    setArrayOfCount(prev2 => [...prev2, newValue]);
  };

  const loadFromLocalStorage = () => {
    const retrieveObject = JSON.parse(localStorage.getItem('m10-lab-1') as any);
    //console.log(`loadFromLocalStorage invoked with ${JSON.stringify(retrieveObject)}`);
    setCount(retrieveObject.count);
    setArrayOfCount(retrieveObject.arrayOfCount);
    setTheme(retrieveObject.theme);
    setDelay(retrieveObject.delay);
    setStep(retrieveObject.step);
    setFocused(retrieveObject.focused);
    setFeedbackArray(retrieveObject.feedbackArray);
    // setErrorMessage(retrieveObject.errorMessage);
    setErrorMessage(`loadFromLocalStorage render to move data into state.`)
    setRenderCount(retrieveObject.renderCount);
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
      errorMessage: errorMessage,
      renderCount: renderCount
    };
    //console.log(`saveToLocalStorage invoked with ${JSON.stringify(storeObject)}`);
    localStorage.setItem('m10-lab-1', JSON.stringify(storeObject));
  };

  useEffect(() => {
    if (focused) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [focused]);

  useEffect(() => {
    let timeoutId: number;
    try {
      timeoutId = setTimeout((one: string) => {
        setFeedbackArray(prev => {
          return [`Data printed with count ${one} and count history [${arrayOfCount}].`, ...prev]
        }); // mixing references ('one' + String(count)), and directly referencing values for future reference.
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
        //console.log(`useEffect cleanup for save operations invoked. ${renderCount}`);
        setRenderCount(prev => prev + 1);
        setErrorMessage(`useEffect cleanup for save operations invoked. ${renderCount}`);
        clearTimeout(timeoutId);
        /**
         * saveToLocalStorage cannot be executed during cleanup phase.  When count (listed in this useEffect's dependencies changes, this cleanup function runs before the state of count is updated.  So, data that was loaded from localStorage during the initial render gets overwritten.  Could bypass this with useRef, but probably that's beyond scope of assignment).  Besides, return is for cleanup of things executed in the useEffect, not separate functions.  Possibly this may have some bearing.
         * A similar issue occurs as data is both loaded and saved on render, but this is - workaround or a real solution, I can't say - at any rate, save is made async, so loading happens first.  Trying to make things async here, though, might cause weird side effects that I wouldn't want interacting with the rest of this useEffect's functinoality.  So I split loading and saving into separate useEffects.
         */
      }
    }
  }, [count, arrayOfCount]) // test if this causes execution of useEffect twice.
  // the internals do NOT cause a change in count or arrayOfCount so should not cause infinite re-renders.

  useEffect(() => {
    loadFromLocalStorage();
  }, []); // run once on render / reload, then no cleanup.

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToLocalStorage();
    }, 0);
    return () => {
      clearTimeout(timeoutId)
    };
  }, [count, arrayOfCount, theme, delay, step, focused, feedbackArray, errorMessage]);
  // saves async so loading of existing localStorage data completes before saving.  If not async, then localStorage data gets re-initialized then saved ten loaded.  Note in case waiting for async isn't enough, additional 500 ms or whatever.

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
          <div className='mediumsize'>A message displays at bottom of screen {delay} seconds after a user last changes count. </div>
        </div>
        <button onClick={handleTheme}>Toggle {theme}</button>
      </div>

      <div className='border'>
        <p>
          If delay is set to 3 seconds, no new message will display at bottom of screen until 3 seconds after the last update to count is made.
        </p>
        <p>
          (A patient user could sit all day updating count and nothing would print.)</p>
        <p>
          If a user makes, say, 10 updates, then allows the message to display, none of the messages before the last will display.  This illustrates the use of the cleanup function in useEffect, and how commands set to run inside setTimeout will not run if clearTimeout is used with the reference returned by setTimeout.
        </p>
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
      {/* <div>{errorMessage}</div> */}
    </div>
  )
}

export default App;