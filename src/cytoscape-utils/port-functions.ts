import { NodeSingular, Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { NodeData, NodeObject, NodeType } from "../interfaces/node";
import * as y from 'yjs';
import { PortData, PortLabelData } from "../interfaces/port";
import { cy, padding } from "../components/DiagramPage/DiagramCanvas";

export const addPort = (initialPosition: Position, targetNode: any, sharedNodes: y.Map<NodeObject>) => {
    const portId = uuidv4();
    const target = sharedNodes.get(targetNode.id());
    if (target === undefined) {
        console.log('Target node not found.')
        return;
    };

    const targetCenter = target.position;
    const targetBorders = (target.data as NodeData).dimensions;

    const portLocatedOn = setPortLocation(initialPosition.x, initialPosition.y, target);
    let newX = initialPosition.x, newY = initialPosition.y;
    switch (portLocatedOn) {
        case dimensionType.left: {
            newX = targetCenter.x - targetBorders.horizontal - padding;
            break;
        }
        case dimensionType.right: {
            newX = targetCenter.x + targetBorders.horizontal + padding;
            break;
        }
        case dimensionType.top: {
            newY = targetCenter.y - targetBorders.vertical - padding;
            break;
        }
        case dimensionType.bottom: {
            newY = targetCenter.y + targetBorders.vertical + padding;
            break;
        }
    };

    const position = {
        x: newX,
        y: newY,
    }
    const label = addPortLabel(portId, sharedNodes, position);
    
    const addedPort = {
        data: {
            id: portId,
            width: 20,
            height: 20,
            portOf: targetNode.id(),
            situatedOn: portLocatedOn,
            labelId: label.data.id,
            label: null,
            type: NodeType.port,
        },
        position: {
            x: position.x,
            y: position.y,
        },                
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

const setPortLocation : ((portX: number, portY: number, targetNode: any) => dimensionType) = (
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
    const center = targetNode.position;
    
    const acceptedTop = center.y - dimensions.horizontal / 2;
    const acceptedBottom = center.y + dimensions.horizontal / 2;

    const nodeTop = center.y - dimensions.vertical;
    const nodeBottom = center.y + dimensions.vertical;
    const nodeLeft = center.x - dimensions.horizontal;
    const nodeRight = center.x + dimensions.horizontal;

    if (acceptedTop <= portY && portY <= acceptedBottom) {
        if (portX <= center.x) {
            return dimensionType.left;
        } else {
            return dimensionType.right;
        }
    } else if (portY < acceptedTop) {
        const diffTop = Math.abs(nodeTop - portY);
        if (portX <= center.x) {
            const diffLeft = Math.abs(nodeLeft - portX);
            if (diffLeft < diffTop) {
                return dimensionType.left;
            }
        } else {
            const diffRight = Math.abs(nodeRight - portX);
            if (diffRight < diffTop) {
                return dimensionType.right;
            }
        }
        return dimensionType.top;
    } else {
        const diffBottom = Math.abs(nodeBottom - portY);
        if (portX <= center.x) {
            const diffLeft = Math.abs(nodeLeft - portX);
            if (diffLeft < diffBottom) {
                return dimensionType.left;
            }
        } else {
            const diffRight = Math.abs(nodeRight - portX);
            if (diffRight < diffBottom) {
                return dimensionType.right;
            }
        }
        return dimensionType.bottom;
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
                newx = target.position.x - targetData.dimensions.horizontal;
                newy = target.position.y;
                break;
            };
            case 'right': {
                console.log(portData.situatedOn, targetData.dimensions.horizontal, target.position.x)
                newx = target.position.x + targetData.dimensions.horizontal;
                newy = target.position.y;
                break;
            };
            case 'top': {
                newy = target.position.y - targetData.dimensions.vertical;
                newx = target.position.x;
                break;
            };
            case 'bottom': {
                newy = target.position.y + targetData.dimensions.vertical;
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
        movePortLabel(portData.labelId, portNode.position, sharedNodes);
    });
};

const addPortLabel: ((portId: string, sharedNodes: y.Map<NodeObject>, portPosition: Position) => NodeObject) = (
    portId, sharedNodes, portPosition
) => {
    const labelId = uuidv4();
    const diffCoordinate = 40;
    const addedLabel = {
        data: {
            id: labelId,
            label: 'portLabel',
            width: 60,
            height: 30,
            labelOf: portId,
            type: NodeType.portLabel,
            diffFromNode: {
                x: diffCoordinate,
                y: diffCoordinate,
            }
        },
        position: {
            x: portPosition.x + diffCoordinate,
            y: portPosition.y + diffCoordinate,
        },
    };
    return sharedNodes.set(labelId, addedLabel);
};

const movePortLabel: ((
    portLabelId: string,
    portPosition: Position,
    sharedNodes: y.Map<NodeObject>,
) => void) = (
    portLabelId, portPosition, sharedNodes
) => {
    const labelNode = sharedNodes.get(portLabelId);
    if (labelNode === undefined) {
        console.log(`No label with id ${portLabelId}`);
        return;
    }

    if (labelNode.data.type !== NodeType.portLabel) {
        console.log('Label had wrong type');
        return;
    }

    const labelData = labelNode.data as PortLabelData;

    labelNode.position.x = portPosition.x + labelData.diffFromNode.x;
    labelNode.position.y = portPosition.y + labelData.diffFromNode.y;

    sharedNodes.set(portLabelId, labelNode);
};

export const dragPort : ((port: NodeObject, sharedNodes: y.Map<NodeObject>) => void) = (port, sharedNodes) => 
{
    const portData = port.data as PortData;
    console.log(portData);
    const location = portData.situatedOn;

    const node = sharedNodes.get(portData.portOf.toString());

    if (node === undefined) {
        console.log('Node was not found.');
        return;
    }

    const nodeData = node?.data as NodeData;
    const nodePosition = node.position;
    console.log(nodeData);
    const nodeDimensions = nodeData.dimensions;
    let l = 0, r = 0, t = 0, b = 0; 

    if (location === dimensionType.left || location === dimensionType.right) {
        t = nodePosition.y - nodeDimensions.vertical - portData.height;
        b = nodePosition.y + nodeDimensions.vertical + portData.height;        
    } else {
        l = nodePosition.x - nodeDimensions.horizontal - portData.width;
        r = nodePosition.x + nodeDimensions.horizontal + portData.width;
    }

    const position = port.position;
    const cyPortReturnValue = cy.getElementById(portData.id);

    if (cyPortReturnValue.length === 0) {
        console.log('No port found on cy.');
        return;
    }

    const cyPort = cyPortReturnValue.first() as NodeSingular;
    console.log(location);

    if (location === dimensionType.right) {
        cyPort.position('x', nodePosition.x + nodeDimensions.horizontal + padding)
        if (position.y < t) {
            cyPort.position('y', nodePosition.y - nodeDimensions.vertical + portData.height);
        } else if (position.y > b) {
            cyPort.position('y', nodePosition.y + nodeDimensions.vertical - portData.height);
        }
    } else if (location === dimensionType.left) {
        cyPort.position('x', nodePosition.x - nodeDimensions.horizontal - padding)
        if (position.y < t) {
            cyPort.position('y', nodePosition.y - nodeDimensions.vertical + portData.height);
        } else if (position.y > b) {
            cyPort.position('y', nodePosition.y + nodeDimensions.vertical - portData.height);
        }
    } else if (location === dimensionType.top) {
        console.log('som hore');
        cyPort.position('y', nodePosition.y - nodeDimensions.vertical - padding);
        if (position.x < l) {
            cyPort.position('x', nodePosition.x - nodeDimensions.vertical + portData.width);
        } else if (position.x > r) {
            cyPort.position('x', nodePosition.x + nodeDimensions.vertical - portData.width);
        }
    } else {
        console.log('som dole');
        cyPort.position('y', nodePosition.y + nodeDimensions.vertical + padding);
        if (position.x < l) {
            cyPort.position('x', nodePosition.x - nodeDimensions.vertical + portData.width);
        } else if (position.y > r) {
            cyPort.position('x', nodePosition.x + nodeDimensions.vertical - portData.width);
        } 
    }

   port.position = cyPort.position();
   const portId = portData.id;
   sharedNodes.set(portId, port);
};
