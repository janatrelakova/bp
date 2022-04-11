import react, { useEffect, useRef, useState } from 'react';
import * as y from 'yjs';
import './DiagramPage.css';
import cytoscape, { Core, Stylesheet } from 'cytoscape';
import './DiagramComponent.css';
import * as awarenessProtocol from 'y-protocols/awareness.js'
import 'cytoscape-context-menus/cytoscape-context-menus.css';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';

var $ = require('jquery');

const contextMenus = require('cytoscape-context-menus');

(window as any).$ = $;
cytoscape.use(contextMenus);

(window as any).$ = $;
contextMenus(cytoscape, $);


type DiagramComponentProps = {
    room: string;
}

let cy: Core;

const DiagramComponent = ({room} : DiagramComponentProps) => {


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
        
        const provider = new WebrtcProvider(room, doc.current, {
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

        const dbProvider = new IndexeddbPersistence(room, doc.current);
        console.log(dbProvider);

        const x = dbProvider._db
            .then(e => {
                var response = e.transaction('updates').objectStore('updates').getAll();
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

      const registerContextMenu = (cy: Core) => {
        (cy as any).contextMenus({
            menuItems: [
              {
                id: 'hide',
                content: 'hide',
                tooltipText: 'hide',
                selector: 'node, edge',
                onClickFunction: function (event: any) {
                  const target = event.target;
                  target.data({ display: 'none' });
                },
            }
            ]
          });
      };

    useEffect(() => {
        cy = cytoscape({
            container: document.getElementById('cy'), // container to render in
            wheelSensitivity: 0.1,
            style: cyStylesheet,
        });
        registerContextMenu(cy);

    }, []);

    const handleClick = (event: any) => {
        if (sharedString.current.toArray()) {
          //sharedString.current.delete(0, sharedString.toString().length);
        }
    
        sharedString.current.insert(0, [42]);
      };   

    let lastClick : number[] = [500, 500];
    let even : boolean = false;
      /*
    if (dbProvider != null) {
        console.log(dbProvider);
    } else {
        console.log("provider je null")
    }
    */
      
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



    return(
        <>
          <h2>Type something:</h2>
          <button onClick={handleClick}>Click me</button>
          <textarea
            value={inputValue}
            style={{ width: "98%", height: "100%" }}
          />
          

          <div id="cy">
          </div>
        </>
    );
}

export default DiagramComponent;

export const cyStylesheet = [
    // cytoscape elements
    {
        selector: 'node[label]',
        style: {
            'content': 'data(MMRef.label)',
            'ghost': 'data(MMRef.essence)',
            'border-style': 'data(MMRef.affiliation)',
            'border-width': '2px',
            'background-color': 'white',
            'width': '70px',
            'height': '45 px',
            'text-valign': 'center',
            'taxi-direction': 'vertical',
            'ghost-offset-x': 3,
            'ghost-offset-y': 3,
            'ghost-opacity': 0.4,
        }
    },
    {
        selector: 'node[type = "object"]',
        style: {
            'shape': 'rectangle',
            'border-color': 'green',
            'padding': '5 px',
        }
    },
    {
        selector: 'node[type = "process"]',
        style: {
            'shape': 'ellipse',
            'border-color': 'DeepSkyBlue',
            'padding': '8 px',
        }
    },
    {
        selector: 'node[type = "state"]',
        style: {
            'shape': 'round-rectangle',
            'border-color': 'orange',
        }
    },
    {
        selector: 'node[labelWidth]',
        style: {
            'width': 'data(labelWidth)',
        }
    },



    {
        selector: '$node > node[type = "state"]',
        style: {
            'text-valign': 'top',
            'padding': 8,
            'min-width': 100,
            'min-height': 100
        }
    },

    {
        selector: '$node > node[type = "object"], $node > node[type = "process"]',
        style: {
            'text-valign': 'top',
            'padding': 8,
            'min-width': 180,
            'min-height': 300
        }
    },

    {
        selector: 'node:parent[type = "process"]',
        style: {
            'text-valign': 'top',
            'padding': 0,
            'min-width': 0,
            'min-height': 0
        }
    },
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'arrow-scale': 1.5,
        }
    },
    {
        selector: 'edge[label]',
        style: {
            'content': 'data(label)',
            'text-background-opacity': 0.8,
            'text-background-color': 'white',
            'text-background-shape': 'round-rectangle',
            'text-background-padding': 5
        }
    },
    {
        selector: 'edge[type = "consumption"]',
        style: {
            'target-arrow-shape': 'triangle'
        }
    },

    {
        selector: 'edge[type = "effect"]',
        style: {
            'source-arrow-shape': 'triangle',
            'target-arrow-shape': 'triangle'
        }
    },

    {
        selector: 'edge[type = "aggregation"]',
        style: {
            "curve-style": "taxi",
            "taxi-direction": "downward",
            "taxi-turn": '100px',
            'source-arrow-shape': 'triangle',
            'arrow-scale': 3,
            'source-distance-from-node': '30px',
            'target-endpoint': 'outside-to-node'
        }
    },
    {
        selector: 'edge[type = "instrument"]',
        style: {
            'target-arrow-shape': 'circle',
            'target-arrow-fill': 'hollow',
        }
    },
    {
        selector: 'edge[type = "agent"]',
        style: {
            'target-arrow-shape': 'circle',
        }
    },
    {
        selector: 'edge[type = "tagged"]',
        style: {
            'target-arrow-shape': 'vee'
        }
    },

    {
        selector: 'node[display], edge[display]',
        style: {
            'display': 'data(display)'
        }
    },

    {
        selector: 'edge[MMRef.originalEdge]',
        style: {
            'line-color': 'LightGrey',
            'target-arrow-color': 'LightGrey'
        }
    },



    // cytoscape-edge-handles extention
    {
        selector: '.eh-source',
        style: {
            'border-width': 2,
        }
    },

    {
        selector: '.eh-hover',
        style: {
            'border-width': 3,
            'background-color': 'lightgrey'
        }
    },

    {
        selector: '.eh-preview, .eh-ghost-edge',
        style: {
            'background-color': 'grey',
            'line-color': 'grey',
            'target-arrow-color': 'grey',
            'source-arrow-color': 'grey'
        }
    },
] as Stylesheet[];

export { cy };
