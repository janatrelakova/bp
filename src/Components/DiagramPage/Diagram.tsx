import * as React from 'react';
import './DiagramPage.css';
import { useEffect, useRef, useState } from 'react';
import * as y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebrtcProvider } from 'y-webrtc';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import './Diagram.css';
import DiagramCanvas from './DiagramCanvas';

type DiagramContainerProps = {
    room: string;
}

const DiagramContainer = ({
    room,
}: DiagramContainerProps) => {

    const doc = useRef(new y.Doc());
    const [ webRtcProvider, setWebRtcProvider ] = useState<WebrtcProvider>();
    const [ indexedDbPersistence, setIndexedDbPersistence ] = useState<IndexeddbPersistence>();


    useEffect(() => {
        // establish webrtc connection
        setWebRtcProvider(new WebrtcProvider(room, doc.current, {
            signaling: ['ws://localhost:4444'],
            password: null,
            awareness: new awarenessProtocol.Awareness(doc.current),
            maxConns: 10,
            filterBcConns: false,
            peerOpts: {}
        }));

        // open indexedDb storage
        setIndexedDbPersistence(new IndexeddbPersistence(room, doc.current));


    }, [room]);

    if (webRtcProvider == null) {
        return <span>Signaling server connection has not been established.</span>
    }

    if (indexedDbPersistence == null) {
        return <span>Connectioin to indexedDb perseistence is not established.</span>
    }

    return <DiagramCanvas doc={doc} />
};

export const Diagram = DiagramContainer;
