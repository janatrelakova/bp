import { Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { Dimensions, NodeData, NodeObject } from "../interfaces/node";
import * as y from 'yjs';
import { PortData } from "../interfaces/port";

export const addPort = (position: Position, targetNode: any, sharedNodes: y.Map<NodeObject>) => {
    const portId = uuidv4();
    const targetNodeData = targetNode.data() as NodeData;
    const addedPort = {
        data: {
            id: portId,
            label: portId,
            width: 20,
            height: 20,
            portOf: targetNode.id(),
            positionOnNode: 30,
            situatedOn: getPortLocation(position.x, position.y, targetNodeData.dimensions),
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
        //const portData = portNode.data as PortData;
        
        // portNode.position.x = nodePosition.x + portData.positionOnNode.x;
        //portNode.position.y = nodePosition.y + portData.positionOnNode.y;

        //sharedNodes.set(portNode.data.id, portNode);
    }
};

enum dimensionType {
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom',
}

const getPortLocation : ((portX: number, portY: number, dimensions: Dimensions) => dimensionType) = (
    portX: number,
    portY: number,
    dimensions: Dimensions,
) => {
    const left = Math.abs(dimensions.left - portX);
    const top = Math.abs(dimensions.top - portY);
    const right = Math.abs(dimensions.right - portX);
    const bottom = Math.abs(dimensions.bottom - portY);
    const minimum = Math.min(left, right, top, bottom);
    switch (minimum) {
        case left: {
            return dimensionType.left;
        };
        case right: {
            return dimensionType.right;
        };
        case top: {
            return dimensionType.top;
        };
        case bottom: {
            return dimensionType.bottom;
        };
        default: return dimensionType.right;
    }

};

export const moveNodePorts: ((
    ports: string[],
    target: NodeObject,
    sharedNodes: y.Map<NodeObject>,
) => void) = (
    ports, target, sharedNodes
) => {
    ports.forEach(portId => {
        const portNode = sharedNodes.get(portId);
        if (portNode === undefined) {
            console.log(`Could not find port with ${portId} id`);
            return;
        }
        const targetData = target.data as NodeData;
        const portData = portNode.data as PortData;
        let newx: number;
        let newy: number;
        switch (portData.situatedOn) {
            case 'left': {
                newx = targetData.dimensions.left;
                newy = target.position.y + portData.positionOnNode;
                break;
            };
            case 'right': {
                newx = targetData.dimensions.right;
                newy = target.position.y + portData.positionOnNode;
                break;
            };
            case 'top': {
                newy = targetData.dimensions.top;
                newx = target.position.x + portData.positionOnNode;
                break;
            };
            case 'bottom': {
                newy = targetData.dimensions.bottom;
                newx = target.position.x + portData.positionOnNode;
                break;
            };
            default: {
                newy = 0;
                newx = 0;
            };
        };
        portNode.position = {x: newx, y: newy} as Position;
        sharedNodes.set(portId, portNode);
        console.log(portId, portNode);
        console.log(portNode.position.x, target.position.x);
    });
}