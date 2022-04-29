import { Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { Dimensions, NodeData, NodeObject } from "../interfaces/node";
import * as y from 'yjs';
import { PortData } from "../interfaces/port";

export const addPort = (position: Position, targetNode: any, sharedNodes: y.Map<NodeObject>) => {
    const portId = uuidv4();
    const portLocatedOn = getPortLocation(position.x, position.y, sharedNodes.get(targetNode.id()));
    let otherCoordinate: number;
    
    const addedPort = {
        data: {
            id: portId,
            label: portId,
            width: 20,
            height: 20,
            portOf: targetNode.id(),
            positionOnNode: 30,
            situatedOn: portLocatedOn,
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

enum dimensionType {
    left = 'left',
    right = 'right',
    top = 'top',
    bottom = 'bottom',
}

const getPortLocation : ((portX: number, portY: number, targetNode: any) => dimensionType) = (
    portX: number,
    portY: number,
    targetNode: NodeObject | undefined,
) => {
    if (targetNode === undefined) {
        console.log('Target was undefined.');
        return dimensionType.bottom;
    }
    const nodeData = targetNode.data as NodeData;
    const dimensions = nodeData.dimensions;
    const left = Math.abs(dimensions.left - portX + targetNode.position.x);
    const top = Math.abs(dimensions.top - portY +  + targetNode.position.y);
    const right = Math.abs(dimensions.right - portX + targetNode.position.x);
    const bottom = Math.abs(dimensions.bottom - portY + targetNode.position.y);
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
                newx = targetData.dimensions.left  + target.position.x;
                newy = target.position.y;
                break;
            };
            case 'right': {
                console.log(portData.situatedOn, targetData.dimensions.right, target.position.x)
                newx = targetData.dimensions.right  + target.position.x;
                newy = target.position.y;
                break;
            };
            case 'top': {
                newy = targetData.dimensions.top + target.position.y;
                newx = target.position.x;
                break;
            };
            case 'bottom': {
                newy = targetData.dimensions.bottom + target.position.y;
                newx = target.position.x;
                break;
            };
            default: {
                newy = 0;
                newx = 0;
            };
        };
        portNode.position = {x: newx, y: newy} as Position;
        sharedNodes.set(portId, portNode);
    });
}