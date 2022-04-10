import * as React from 'react';
import './DiagramPage.css';
import { useEffect, useRef, useState } from 'react';
import * as y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import * as awarenessProtocol from 'y-protocols/awareness.js';

import cytoscape, { Core } from 'cytoscape';
import { cytoscapestyles } from '../../utils/cytoscapestyles';



var $ = require('jquery');
const contextMenus = require('cytoscape-context-menus');
const nodeEditing = require('cytoscape-node-editing');

(window as any).$ = $;
var konva = require('konva');


cytoscape.use(contextMenus);

contextMenus(cytoscape, $);
nodeEditing(cytoscape, $, konva);


let cy: Core;

type DiagramContainerProps = {
    room: string;
}

const DiagramContainer = ({
    room,
}: DiagramContainerProps) => {
    const doc = useRef(new y.Doc());
    const sharedData = useRef(doc.current.getArray('shared-diagram'));
    const [data, setData] = useState(sharedData.current.toArray() ?? []);

    const webRtcProvider = useRef<WebrtcProvider>();
    const indexedDbPersistence = useRef<IndexeddbPersistence>();

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
        // establish webrtc connection
        webRtcProvider.current = new WebrtcProvider(room, doc.current, {
            signaling: ['ws://localhost:4444'],
            password: null,
            awareness: new awarenessProtocol.Awareness(doc.current),
            maxConns: 10,
            filterBcConns: false,
            peerOpts: {}
        });

        // open indexedDb storage
        indexedDbPersistence.current = new IndexeddbPersistence(room, doc.current);

        // add observer to shared diagram data
        sharedData.current.observeDeep(() => {
            setData(sharedData.current.toArray());
        });

        cy = cytoscape({
            container: document.getElementById("cy"),
            // container to render in
            elements: [
              // list of graph elements to start with
              {
                // node a
                data: { id: "node7" }
              },

            ],
          
            style: cytoscapestyles,
          });
          


    }, [room]);

    if (data == null) {
        return <span>Something went wrong.</span>
    }

    if (webRtcProvider.current == null) {
        return <span>Signaling server connection has not been established.</span>
    }

    if (indexedDbPersistence.current == null) {
        return <span>Could not establish connection with IndexedDb.</span>
    }

    return (
        <DiagramComponent />
    );
};

const DiagramComponent = () => {
    return (
       <div id="cy"></div>
    )
};

export const Diagram = DiagramContainer;