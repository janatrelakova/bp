import react, { ChangeEvent, SyntheticEvent, useEffect, useRef, useState } from 'react';
import * as y from 'yjs';
import './YSharedTextField.css';
import { WebrtcProvider } from 'y-webrtc';
import { Line } from 'react-lineto';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Alert, Snackbar, SnackbarCloseReason } from '@mui/material';

const YSharedTextField = () => {
    const doc = useRef(new y.Doc());
    const sharedString = useRef(doc.current.getArray('shared-string'));
    const [inputValue, setInputValue] = useState(
      sharedString.current.toString() ?? ""
    );

    const sharedObjects = useRef(doc.current.getArray('shared-object'));

    const [inputObjects, setInputObjects] = useState(
        sharedObjects.current.toArray() as number[][] ?? [] as number[][]
    );

    const [open, setOpen] = useState(false);


    useEffect(() => {
        new WebrtcProvider("shared-page", doc.current);

        const provider = new IndexeddbPersistence("shared-page", doc.current);

        provider.on('synced', () => {
            console.log('content from the database is loaded');
            setOpen(true);
        });
    
        sharedString.current.observeDeep(() => {
          setInputValue(sharedString.current.toArray().toString());
        });

        sharedObjects.current.observeDeep(() => {
            setInputObjects(sharedObjects.current.toArray() as number[][]);
        });

      }, []);

      const handleToastClose = (event: SyntheticEvent<Element, Event>) => {
        if (event.type === 'clickaway') {
          return;
        }
    
        setOpen(false);
      };

      
  const handleClose = (event: any, reason: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };


    const handleClick = (event: any) => {
        if (sharedString.current.toArray()) {
          //sharedString.current.delete(0, sharedString.toString().length);
        }
    
        sharedString.current.insert(0, [42]);
      };   

    let lastClick : number[] = [500, 500];
    let even : boolean = false;
      
    const handleCanvasClick = (event: any) => {
        if (even) {
            sharedObjects.current.push([[lastClick[0] , lastClick[1], event.clientX, event.clientY]]);
            console.log('Even length ' +  event.clientX + " " + event.clientY)
            even = true;
        } else {
            lastClick = [event.clientX, event.clientY];
            console.log('Odd length ' +  event.clientX + " " + event.clientY)
            even = true;
        }
    };
   
    return (
        <>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleToastClose} severity="success" sx={{ width: '100%' }}>
                    This is a success message!
                </Alert>
            </Snackbar>
          <h2>Type something:</h2>
          <button onClick={handleClick}>Click me</button>
          <textarea
            value={inputValue}
            style={{ width: "98%", height: "100%" }}
          />
          <div id='canvas' className="canvas-container canvas" onClick={handleCanvasClick}>
              <div>
                  {inputObjects.map((item: number[]) => {
                      return <Line x0={item[0]} y0={item[1]} x1={item[2]} y1={item[3]} />
                  })}
              </div>
          </div>
        </>
      );
}
export default YSharedTextField;
