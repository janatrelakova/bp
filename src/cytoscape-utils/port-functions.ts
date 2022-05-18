import { NodeSingular, Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { Dimensions, NodeData, NodeObject, NodeType } from "../interfaces/node";
import * as y from 'yjs';
import { PortData, PortLabelData } from "../interfaces/port";
import { cy, padding } from "../components/DiagramPage/DiagramCanvas";

export const addPort = (initialPosition: Position, targetNode: any, sharedNodes: y.Map<NodeObject>) => {
    const temporaryTarget = sharedNodes.get(targetNode.id());
    if (temporaryTarget === undefined) {
        return;
    };

    const objectType = temporaryTarget.data.type;
    if (objectType === NodeType.portLabel || objectType === NodeType.port) {
        return;
    }

    let target;

    if (objectType === NodeType.nodeLabel) {
        const nodeTarget = temporaryTarget.data.id.slice(0, -6);
        target = sharedNodes.get(nodeTarget);
        if (target === undefined) {
            return;
        }
    }

    if (target == null) {
        target = temporaryTarget;
    }

    const targetCenter = target.position;
    const targetBorders = (target.data as NodeData).dimensions;

    const portLocatedOn = setPortLocation(initialPosition.x, initialPosition.y, target);
    let newX = initialPosition.x, newY = initialPosition.y;
    let arrow;
    switch (portLocatedOn) {
        case dimensionType.left: {
            newX = targetCenter.x - targetBorders.horizontal - padding;
            newY = adjustPortVerticalPosition(targetCenter, targetBorders, newY, 40);
            arrow = '→';
            break;
        }
        case dimensionType.right: {
            newX = targetCenter.x + targetBorders.horizontal + padding;
            newY = adjustPortVerticalPosition(targetCenter, targetBorders, newY, 40);
            arrow = '→';
            break;
        }
        case dimensionType.top: {
            newY = targetCenter.y - targetBorders.vertical - 2 * padding - 5 - 40;
            newX = adjustPortHorizontalPosition(targetCenter, targetBorders, newX, 40);
            arrow = '↓';
            break;
        }
        case dimensionType.bottom: {
            newY = targetCenter.y + targetBorders.vertical + padding;
            newX = adjustPortHorizontalPosition(targetCenter, targetBorders, newX, 40);
            arrow = '↓';
            break;
        }
    };

    const position = {
        x: newX,
        y: newY,
    };

    let percentualDiff;

    if (portLocatedOn === dimensionType.left || portLocatedOn === dimensionType.right) {
        percentualDiff = (newY - targetCenter.y) / targetBorders.vertical;
    } else {
        percentualDiff = (newX - targetCenter.x) / targetBorders.horizontal;
    } 

    const portId = uuidv4();
    const label = addPortLabel(portId, position, portLocatedOn, sharedNodes);
    const addedPort = {
        data: {
            id: portId,
            width: 10,
            height: 10,
            portOf: target.data.id,
            situatedOn: portLocatedOn,
            situatedPercentually: percentualDiff,
            labelId: label.data.id,
            label: arrow,
            type: NodeType.port,
        },
        position: {
            x: position.x,
            y: position.y,
        },                
    };

    const nodeToUpdate = sharedNodes.get(target.data.id);
    if (nodeToUpdate === undefined) {
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
        return dimensionType.bottom;
    }

    const nodeData = targetNode.data as NodeData;
    const dimensions = nodeData.dimensions;
    const center = targetNode.position;
    
    const acceptedTop = center.y - dimensions.horizontal / 2;
    const acceptedBottom = center.y + dimensions.horizontal / 2;

    const nodeTop = center.y - dimensions.vertical - 2 * padding - 5;
    const nodeBottom = center.y + dimensions.vertical;
    const nodeLeft = center.x - dimensions.horizontal;
    const nodeRight = center.x + dimensions.horizontal;

    if (acceptedTop < portY && portY < acceptedBottom) {
        if (portX < center.x) {
            return dimensionType.left;
        } else {
            return dimensionType.right;
        }
    } else if (portY < acceptedTop) {
        const diffTop = Math.abs(nodeTop - portY);
        if (portX < center.x) {
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
        if (portX < center.x) {
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
    if (ports === undefined) {
        return;
    }
    ports.forEach(portId => {
        const portNode = sharedNodes.get(portId);
        if (portNode === undefined) {
            return;
        }
        const targetData = target.data as NodeData;
        const portData = portNode.data as PortData;
        let newx: number;
        let newy: number;
        switch (portData.situatedOn) {
            case 'left': {
                newx = target.position.x - targetData.dimensions.horizontal - padding;
                newy = target.position.y + targetData.dimensions.vertical * portData.situatedPercentually;
                break;
            };
            case 'right': {
                newx = target.position.x + targetData.dimensions.horizontal + padding;
                newy = target.position.y + targetData.dimensions.vertical * portData.situatedPercentually;
                break;
            };
            case 'top': {
                newy = target.position.y - targetData.dimensions.vertical - 2 * padding - 5 - 40;
                newx = target.position.x + targetData.dimensions.horizontal * portData.situatedPercentually;
                break;
            };
            case 'bottom': {
                newy = target.position.y + targetData.dimensions.vertical + padding;
                newx = target.position.x + targetData.dimensions.horizontal * portData.situatedPercentually;
                break;
            };
            default: {
                newy = 0;
                newx = 0;
            };
        };
        portNode.position = {x: newx, y: newy} as Position;

        sharedNodes.set(portId, portNode);
        moveLabel(portData.labelId, portNode.position, sharedNodes);
    });
};

const addPortLabel: ((portId: string, position: Position, location: dimensionType, sharedNodes: y.Map<NodeObject>) => NodeObject) = (
    portId, portPosition, location, sharedNodes
) => {
    const labelId = uuidv4();
    const diff = 60;
    let diffX = 0, diffY = 0;
    const labelText = 'Flow : Data';

    switch (location) {
        case dimensionType.left: {
            diffX = -diff - labelText.length * 3;
            break;
        }
        case dimensionType.right: {
            diffX = diff + labelText.length * 2;
            break;
        }
        case dimensionType.top: {
            diffY = -diff;
            break;
        }
        case dimensionType.bottom: {
            diffY = diff;
            break;
        }
    }

    const addedLabel = {
        data: {
            id: labelId,
            label: labelText,
            width: 1,
            height: 1,
            labelOf: portId,
            type: NodeType.portLabel,
            diffFromNode: {
                x: diffX,
                y: diffY,
            }
        },
        position: {
            x: portPosition.x + diffX,
            y: portPosition.y + diffY,
        },
    };
    return sharedNodes.set(labelId, addedLabel);
};


export const dragPort : ((port: NodeObject, sharedNodes: y.Map<NodeObject>) => void) = (port, sharedNodes) => 
{
    const portData = port.data as PortData;
    const location = portData.situatedOn;

    const node = sharedNodes.get(portData.portOf.toString());

    if (node === undefined) {
        return;
    }

    const nodeData = node?.data as NodeData;
    const nodePosition = node.position;
    const nodeDimensions = nodeData.dimensions;
    let l = 0, r = 0, t = 0, b = 0; 

    if (location === dimensionType.left || location === dimensionType.right) {
        t = nodePosition.y - nodeDimensions.vertical - portData.height -  2 * padding;
        b = nodePosition.y + nodeDimensions.vertical + portData.height;        
    } else {
        l = nodePosition.x - nodeDimensions.horizontal - portData.width;
        r = nodePosition.x + nodeDimensions.horizontal + portData.width;
    }

    const position = port.position;
    const cyPortReturnValue = cy.getElementById(portData.id);

    if (cyPortReturnValue.length === 0) {
        return;
    }
    const cyPort = cyPortReturnValue.first() as NodeSingular;

    if (location === dimensionType.right) {
        cyPort.position('x', nodePosition.x + nodeDimensions.horizontal + padding);
        adjustVerticalCoordinate(position.y, nodePosition.y, cyPort, nodeDimensions.vertical, portData.height, t, b);
    } else if (location === dimensionType.left) {
        cyPort.position('x', nodePosition.x - nodeDimensions.horizontal - padding);
        adjustVerticalCoordinate(position.y, nodePosition.y, cyPort, nodeDimensions.vertical, portData.height, t, b);
    } else if (location === dimensionType.top) {
        cyPort.position('y', nodePosition.y - nodeDimensions.vertical - 2 * padding - 5 - 40);
        adjustHorizontalCoordinate(position.x, nodePosition.x, cyPort, nodeDimensions.horizontal, portData.width, l, r);
    } else {
        cyPort.position('y', nodePosition.y + nodeDimensions.vertical + padding);
        adjustHorizontalCoordinate(position.x, nodePosition.x, cyPort, nodeDimensions.horizontal, portData.width, l, r);
    }

    port.position = cyPort.position();

    if (location === dimensionType.left || location === dimensionType.right) {
        portData.situatedPercentually = (port.position.y - nodePosition.y) / nodeDimensions.vertical;
    } else {
        portData.situatedPercentually = (port.position.x - nodePosition.x) / nodeDimensions.horizontal;
    }

    port.position = cyPort.position();
    port.data = portData;
    const portId = portData.id;
    sharedNodes.set(portId, port);
    moveLabel(portData.labelId, port.position, sharedNodes);
};

const moveLabel = (labelId: string, portPosition: Position, sharedNodes: y.Map<NodeObject>) => {
    const labelNode = sharedNodes.get(labelId);
    if (labelNode === undefined) {
        return;
    }

    const labelData = labelNode.data as PortLabelData;
    const diffs = labelData.diffFromNode;
    labelNode.position = {
        x: diffs.x + portPosition.x,
        y: diffs.y + portPosition.y,
    };

    sharedNodes.set(labelId, labelNode);
};

export const dragLabel = (label: NodeObject, sharedNodes: y.Map<NodeObject>) => {
    const labelData = label.data as PortLabelData;
    const portId = labelData.labelOf;
    const port = sharedNodes.get(portId);
    if (port === undefined) {
        return;
    }

    const cyLabelReturnValue = cy.getElementById(labelData.id);
    if (cyLabelReturnValue.length === 0) {
        return;
    }
    const cyLabel = cyLabelReturnValue.first() as NodeSingular;
    const cyLabelPosition = cyLabel.position();

    const portData = port.data as PortData;
    const portCenter = port.position;
    const portWidth = portData.width;

    const acceptedXDiff = portWidth * 7;
    const acceptedYDiff = portWidth * 7;

    if (cyLabelPosition.x < portCenter.x - acceptedXDiff) {
        cyLabel.position('x', portCenter.x - acceptedXDiff);
    } else if (cyLabelPosition.x > portCenter.x + acceptedXDiff) {
        cyLabel.position('x', portCenter.x + acceptedXDiff);
    }
    
    if (cyLabelPosition.y < portCenter.y - acceptedYDiff) {
        cyLabel.position('y', portCenter.y - acceptedYDiff);
    } else if (cyLabelPosition.y > portCenter.y + acceptedYDiff) {
        cyLabel.position('y', portCenter.y + acceptedYDiff);
    }

    labelData.diffFromNode = {
        x: cyLabel.position().x - portCenter.x,
        y: cyLabel.position().y - portCenter.y,
    }
    

    label.position = cyLabel.position();
    sharedNodes.set(labelData.id, label);
};

const adjustHorizontalCoordinate = (portX: number, nodeX: number, cyPort: NodeSingular, horizontal: number, portWidth: number, l: number, r: number) => {
    if (portX < l) {
        cyPort.position('x', nodeX - horizontal + portWidth);
    } else if (portX > r) {
        cyPort.position('x', nodeX + horizontal - portWidth);
    } 
};

const adjustVerticalCoordinate = (portY: number, nodeY: number, cyPort: NodeSingular, vertical: number, portHeight: number, t: number, b: number) => {
    if (portY < t) {
        cyPort.position('y', nodeY - vertical + portHeight);
    } else if (portY > b) {
        cyPort.position('y', nodeY + vertical - portHeight);
    }
};

const adjustPortVerticalPosition = (center: Position, dimensions: Dimensions, portY: number, portHeight: number) => {
    if (portY < center.y - dimensions.vertical + portHeight) {
        return center.y - dimensions.vertical + portHeight;
    }
    if (portY > center.y + dimensions.vertical - portHeight) {
        return center.y + dimensions.vertical - portHeight;
    }

    return portY;
};

const adjustPortHorizontalPosition = (center: Position, dimensions: Dimensions, portX: number, portWidth: number) => {
    if (portX < center.x - dimensions.horizontal) {
        return center.x - dimensions.horizontal + portWidth;
    }
    if (portX > center.x + dimensions.horizontal - portWidth) {
        return center.x + dimensions.horizontal - portWidth;
    }

    return portX;
};