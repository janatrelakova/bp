import { Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { NodeData, NodeObject } from "../interfaces/node";
import * as y from 'yjs';
import { cy } from "../components/DiagramPage/DiagramCanvas";


export const addNode = (
    position: Position, 
    sharedNodes: y.Map<NodeObject>,
    nodeWidth: number,
    nodeHeight: number,
    ) => {

    const addedNodeId = uuidv4();
    const addedNode = {
        data: {
            id: addedNodeId,
            label: addedNodeId,
            width: nodeWidth,
            height: nodeHeight,
            ports: [],
        },
        position: {
            x: position.x,
            y: position.y,
        },
        type: 'node',
    };
    sharedNodes.set(addedNodeId, addedNode);
};


export const addNodeToParent = (position: Position, parent: any, sharedNodes: y.Map<NodeObject>) => {
    const addedNodeId = uuidv4();
    const addedNode = {
        data: {
            id: addedNodeId,
            label: addedNodeId,
            parent: parent.id(),
            width: parent.data().width,
            height: parent.data().height,
            ports: [],
        },
        position: {
            x: position.x,
            y: position.y,
        },                
        type: 'node',
    };
    sharedNodes.set(addedNodeId, addedNode);
};

export const getNodePorts = (node: string, sharedNodes: y.Map<NodeObject>) => {
    const movedNode = sharedNodes.get(node);
    if (movedNode === undefined) {
        console.log('Moved node has not been found in shared nodes.');
        return;
    }
    console.log(movedNode);
    const nodeData = movedNode.data as NodeData;
    console.log(nodeData);

    const portIds: string[] = nodeData.ports.map(p => '#' + p);
    console.log(portIds);

    const portsString = portIds.toString();
    const result = cy.$(portsString);
    console.log(result);
    return result;
}