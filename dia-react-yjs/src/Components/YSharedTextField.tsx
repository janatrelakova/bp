import react, { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as y from 'yjs';
import './YSharedTextField.css';
import { WebrtcProvider } from 'y-webrtc';

const YSharedTextField = () => {
    const doc = useRef(new y.Doc());
    const sharedString = useRef(doc.current.getArray());
    const [inputValue, setInputValue] = useState(
      sharedString.current.toString() ?? ""
    );

    useEffect(() => {
        new WebrtcProvider("hello-room", doc.current);
    
        sharedString.current.observeDeep(() => {
          setInputValue(sharedString.current.toArray().toString());
        });
      }, []);


    const handleClick = (event: any) => {
        if (sharedString.current.toArray()) {
          //sharedString.current.delete(0, sharedString.toString().length);
        }
    
        sharedString.current.insert(0, [42]);
      };      
  
    return (
        <>
          <h2>Type something:</h2>
          <button onClick={handleClick}>Click me</button>
          <textarea
            value={inputValue}
            style={{ width: "100%", height: "100%" }}
          />
        </>
      );
}
export default YSharedTextField;
