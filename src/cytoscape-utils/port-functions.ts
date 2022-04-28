import { Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { NodeData, NodeObject } from "../interfaces/node";
import * as y from 'yjs';
import { PortData } from "../interfaces/port";

export const addPort = (position: Position, targetNode: any, sharedNodes: y.Map<NodeObject>) => {
    const portId = uuidv4();
    const addedPort = {
        data: {
            id: portId,
            label: portId,
            width: 20,
            height: 20,
            portOf: targetNode.id(),
            positionOnNode: {
                x: position.x - targetNode.position().x,
                y: position.y - targetNode.position().y,
            },
        },
        position: {
            x: position.x,
            y: position.y,
        },                
        type: 'port',
    };

    const nodeToUpdate = sharedNodes.get(targetNode.id());
    if (nodeToUpdate === undefined) {
        console.log("BIG ERROR");
        return;
    };

    const nodeData = nodeToUpdate.data as NodeData;
    nodeData.ports.push(portId);
    sharedNodes.set(nodeData.id, nodeToUpdate);


    sharedNodes.set(portId, addedPort);
};

export const movePorts = (nodePosition: Position, ports: string[], sharedNodes: y.Map<NodeObject>) => {
    for (var portId in ports) {
        const portNode = sharedNodes.get(portId);
        if (portNode === undefined) {
            return undefined;
        }
        const portData = portNode.data as PortData;
        
        portNode.position.x = nodePosition.x + portData.positionOnNode.x;
        portNode.position.y = nodePosition.y + portData.positionOnNode.y;

        sharedNodes.set(portNode.data.id, portNode);
    }
};