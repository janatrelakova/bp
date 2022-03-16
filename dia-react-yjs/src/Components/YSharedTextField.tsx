import react, { ChangeEvent, useEffect, useRef, useState } from 'react';
import * as awarenessProtocol from 'y-protocols/awareness.js'
import * as y from 'yjs';
import './YSharedTextField.css';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Line } from 'react-lineto';
import { useGetDiagrams } from '../api/useGetDiagrams';

const YSharedTextField = () => {
    const doc = useRef(new y.Doc());
    const sharedString = useRef(doc.current.getArray('shared-string'));
    
    const [inputValue, setInputValue] = useState(
      sharedString.current.toString() ?? ""
    );

    //const [i, s] = useGetDiagrams('a');

    const sharedObjects = useRef(doc.current.getArray('shared-object'));

    const [inputObjects, setInputObjects] = useState(
        sharedObjects.current.toArray() as number[][] ?? [] as number[][]
    );

    let dbProvider : IndexeddbPersistence | null = null;

    useEffect(() => {
        const provider = new WebrtcProvider("shared-page", doc.current, {
            signaling: ['ws://localhost:4444'],
            // If password is a string, it will be used to encrypt all communication over the signaling servers.
            // No sensitive information (WebRTC connection info, shared data) will be shared over the signaling servers.
            // The main objective is to prevent man-in-the-middle attacks and to allow you to securely use public / untrusted signaling instances.
            password: null,
            // Specify an existing Awareness instance - see https://github.com/yjs/y-protocols
            awareness: new awarenessProtocol.Awareness(doc.current),
            // Maximal number of WebRTC connections.
            // A random factor is recommended, because it reduces the chance that n clients form a cluster.
            maxConns: 10,
            // Whether to disable WebRTC connections to other tabs in the same browser.
            // Tabs within the same browser share document updates using BroadcastChannels.
            // WebRTC connections within the same browser are therefore only necessary if you want to share video information too.
            filterBcConns: false,
            // simple-peer options. See https://github.com/feross/simple-peer#peer--new-peeropts for available options.
            // y-webrtc uses simple-peer internally as a library to create WebRTC connections.
            peerOpts: {}
        });

        const dbProvider = new IndexeddbPersistence('shared-page', doc.current);
        console.log(dbProvider);

        const x = dbProvider._db
            .then(r => {
                var response = r.transaction('updates').objectStore('updates').getAll();
                console.log(response);
                console.log(response.readyState);
                response.onsuccess = () => console.log(JSON.stringify(response.result));


            });

        console.log(x);

        console.log(dbProvider.db);

        sharedString.current.observeDeep(() => {
          setInputValue(sharedString.current.toArray().toString());
        });

        sharedObjects.current.observeDeep(() => {
            setInputObjects(sharedObjects.current.toArray() as number[][]);
        });

      }, []);

    const handleClick = (event: any) => {
        if (sharedString.current.toArray()) {
          //sharedString.current.delete(0, sharedString.toString().length);
        }
    
        sharedString.current.insert(0, [42]);
      };   

    let lastClick : number[] = [500, 500];
    let even : boolean = false;

    if (dbProvider != null) {
        console.log(dbProvider);
    } else {
        console.log("provider je null")
    }

      
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
