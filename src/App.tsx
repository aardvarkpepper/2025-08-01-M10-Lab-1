import { useEffect, useRef, useState } from 'react'
import './App.css'

const App: React.FunctionComponent = (): React.ReactNode => {
  const [count, setCount] = useState<number>(0);
  const [arrayOfCount, setArrayOfCount] = useState([0]);
  const [theme, setTheme] = useState<string>("dark");
  const [delay, setDelay] = useState<number>(2);
  const [step, setStep] = useState<number>(1);
  const [focused, setFocused] = useState<boolean>(false);

  let focusedText = focused ? "This element is currently focused.  Pressing 'ArrowUp' and 'ArrowDown' will increment or decrement count." : "This element is not currently focused.  Pressing 'ArrowUp' and 'ArrowDown' will do nothing.";

  console.log('render');

  const handleDelay = () => {
    setDelay(prev => prev === 0 ? 2 : 0);
  }
  const handleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  }

  const handleToggleFocused = () => {
    setFocused(prev => {
      console.log(`Setting to ${!prev}`)
      return !prev
    });
  }

  const handleKeyDown = (event: any) => {
    console.log(`handleKeyDown detects ${event.code} while focused ${focused}`)
    if (event.code === 'ArrowUp') { // arrowup 0xE048
      console.log('up');
    } else if (event.code === 'ArrowDown') { // arrowdown 0xE050
      console.log('down');
    }
  }

  useEffect(() => {
    console.log('focus useEffect triggered');
    //     window.addEventListener('keydown', (this as any).handleKeyDown); results in App.tsx:41 Uncaught TypeError: Cannot read properties of undefined (reading 'handleKeyDown').

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log(`Attempting to remove eventlistener while focused ${focused}`);
      document.removeEventListener('keydown', handleKeyDown);
      // the problem is changing focus refreshes the page, so a new 'handleKeyDown' is created, so the remove reference doesn't work.
    };
  } // useEffect anon
  , [focused])

  /**
   * addEventListener(type: "keydown", listener: (this: Document, ev: KeyboardEvent) => any, options?: boolean | AddEventListenerOptions): void

Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.

The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.

When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.

When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.

When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.

If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.

The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.

MDN Reference
   */

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
    <div className='container vw100'>
      <div className={`${theme} textaligncenter`}>

        <div className='flexh jc-spacebetween border'>
          <h1>Module 10 Lab 1</h1>
          <button onClick={handleTheme}>Toggle {theme}</button>
        </div>

        <div className='flexh jc-spacebetween border'>
          <div className='flexh border alignitemscenter'>
            <h2>Time Delay: {delay} Seconds. </h2>
            <button onClick={handleDelay}>Set Delay To {delay === 0 ? 2 : 0} Seconds</button>
          </div>
        </div>

        <div className='flexh jc-spacebetween border'>
          <div className='flexh border'>
            <button className='reset-count'>Reset Count and Clear History</button>
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
            <button>Count++</button>
            <button>Count--</button>
          </div>
          <div className='flexh border alignitemscenter'>
            <div>
              <h2>Change Step Value</h2>
              <input type='number' value={step} onChange={() => {}}/>
            </div>

          </div>
        </div>

        <div className='flexh jc-spacebetween alignitemscenter border'>
          <div className='flexh border alignitemscenter'>
            <h2>Previous Counts:</h2>
            <div> 0, 1, 2, 3, 4, 3, 2, 3, 2, 1, 0, -1</div>
          </div>
        </div>




      </div>
    </div>
  )
}

export default App;
