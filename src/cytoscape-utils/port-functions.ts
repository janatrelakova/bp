import { NodeSingular, Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { NodeData, NodeObject, NodeType } from "../interfaces/node";
import * as y from 'yjs';
import { PortData, PortLabelData } from "../interfaces/port";
import { KeyboardReturnOutlined } from "@mui/icons-material";
import { cy, padding } from "../components/DiagramPage/DiagramCanvas";

export const addPort = (position: Position, targetNode: any, sharedNodes: y.Map<NodeObject>) => {
    const portId = uuidv4();
    const portLocatedOn = getPortLocation(position.x, position.y, sharedNodes.get(targetNode.id()));
    const label = addPortLabel(portId, sharedNodes, position);
    
    const addedPort = {
        data: {
            id: portId,
            width: 20,
            height: 20,
            portOf: targetNode.id(),
            positionOnNode: 30,
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
    let l, r, t, b; 

    if (location === dimensionType.left) {
        l = nodePosition.x + nodeDimensions.left - 1;
        r = nodePosition.x + nodeDimensions.left + 1;
        t = nodePosition.y + nodeDimensions.top - portData.height;
        b = nodePosition.y + nodeDimensions.bottom + portData.height;
    } else if (location === dimensionType.right) {
        l = nodePosition.x + nodeDimensions.right - 1;
        r = nodePosition.x + nodeDimensions.right + 1;
        t = nodePosition.y + nodeDimensions.top - portData.height;
        b = nodePosition.y + nodeDimensions.bottom + portData.height;
    } else if (location === dimensionType.top) {
        t = nodePosition.y + nodeDimensions.top - 1;
        b = nodePosition.y + nodeDimensions.top + 1;
        l = nodePosition.y + nodeDimensions.left + portData.width;
        r = nodePosition.y + nodeDimensions.right - portData.width;
    } else if (location === dimensionType.bottom) {
        t = nodePosition.y + nodeDimensions.bottom - 1;
        b = nodePosition.y + nodeDimensions.bottom + 1;
        l = nodePosition.y + nodeDimensions.left + portData.width;
        r = nodePosition.y + nodeDimensions.right - portData.width;
    } else {
        console.log('Could not map location.')
        return;
    }

    const position = port.position;
    const cyPortReturnValue = cy.getElementById(portData.id);

    if (cyPortReturnValue.length === 0) {
        console.log('No port found on cy.');
        return;
    }

    const cyPort = cyPortReturnValue.first() as NodeSingular;

    let x, y;

    if (location === dimensionType.right) {
        cyPort.position('x', nodePosition.x + nodeDimensions.right + padding)
        if (position.y > t) {
            cyPort.position('y', nodePosition.y + nodeDimensions.top - portData.height);
        } else if (position.y < b) {
            cyPort.position('y', nodePosition.y + nodeDimensions.bottom + portData.height);
        }
    } else if (location === dimensionType.left) {
        cyPort.position('x', nodePosition.x + nodeDimensions.left - padding)
        if (position.y > t) {
            cyPort.position('y', nodePosition.y + nodeDimensions.top - portData.height);
        } else if (position.y < b) {
            cyPort.position('y', nodePosition.y + nodeDimensions.bottom + portData.height);
        }
    }

/*
   // if position is out of boundaries
    if (position.x < l || position.x > r) {
        if (location === dimensionType.left) {
            cyPort.position('x', nodePosition.x + nodeDimensions.left);
        } else if (location === dimensionType.right) {
            cyPort.position('x', nodePosition.x + nodeDimensions.right);
        }

   }

   if (position.y < b || position.y > t) {
       if (location === dimensionType.top) {
           cyPort.position('y', nodePosition.y + nodeDimensions.top - portData.height);
       } else if (location === dimensionType.bottom) {
           cyPort.position('y', nodePosition.y + nodeDimensions.bottom + portData.height);
       }
   }
*/
   port.position = cyPort.position();
   const portId = portData.id;
   sharedNodes.set(portId, port);

}