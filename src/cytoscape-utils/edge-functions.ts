import { v4 as uuidv4 } from 'uuid';
import { NodeObject } from "../interfaces/node";
import * as y from 'yjs';
import { EdgeObject } from "../interfaces/edge";
import { cy } from '../components/DiagramPage/DiagramCanvas';

export const addEdgeClick = (sharedNodes: y.Map<NodeObject>, sharedEdges: y.Map<EdgeObject>) => {
    const length = cy.elements('node').length;

    if (length < 2) {
        console.log('There is nothing to connect');
    }

    const index1 = Math.floor(Math.random() * length);
    let index2 =  Math.floor(Math.random() * length);
    while (index1 === index2) {
        index2 = Math.floor(Math.random() * length);
    }

    const keys = Array.from<string>(sharedNodes.keys());
    const newId = uuidv4();
    const newEdge = {
        data: {
            source: keys[index1],
            target: keys[index2],
        },
        id: newId,
    };

    sharedEdges.set(newId, newEdge);
}
