import { Position } from "cytoscape";
import { v4 as uuidv4 } from 'uuid';
import { NodeData, NodeObject, NodeType } from "../interfaces/node";
import * as y from 'yjs';
import { cy, padding } from "../components/DiagramPage/DiagramCanvas";
import { moveNodePorts } from "./port-functions";


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
            label: 'parent',
            width: nodeWidth,
            height: nodeHeight,
            ports: [],
            dimensions: {
                horizontal: nodeWidth / 2,
                vertical: nodeHeight / 2,
            },
            parent: null,
            type: NodeType.node,
        },
        position: {
            x: position.x,
            y: position.y,
        },
    };
    sharedNodes.set(addedNodeId, addedNode);
};


export const addNodeToParent = (position: Position, parent: any, sharedNodes: y.Map<NodeObject>) => {
    const addedNodeId = uuidv4();
    const nodeWidth = parent.data().width;
    const nodeHeight = parent.data().height;
    const addedNode = {
        data: {
            id: addedNodeId,
            label: 'child',
            parent: parent.id(),
            width: nodeWidth,
            height: nodeHeight,
            ports: [],
            dimensions: {
                horizontal: nodeWidth / 2,
                vertical: nodeHeight / 2,
            },
            type: NodeType.node,
        },
        position: {
            x: position.x,
            y: position.y,
        },                
    };

    sharedNodes.set(addedNodeId, addedNode);
    changeDimensions(parent.id(), sharedNodes);
};

export const changeDimensions = (
    nodeId: string | null,
    sharedNodes: y.Map<NodeObject>) =>
{
    if (nodeId == null) {
        return;
    }

    const affectedNode = sharedNodes.get(nodeId);
    if (affectedNode === undefined) {
        console.log('Affected node is null, when changing dimensions');
        return;
    }
    const affectedNodeData = affectedNode.data as NodeData;
    const newDimensions = getChildrenMaxDimensions(nodeId, sharedNodes);
    affectedNodeData.dimensions = newDimensions;
    affectedNode.data = affectedNodeData;

    sharedNodes.set(nodeId, affectedNode);
    moveNodePorts(affectedNodeData.ports, affectedNode, sharedNodes);

    changeDimensions(affectedNodeData.parent, sharedNodes);
};

type DimensionsType = {
    horizontal: number,
    vertical: number,
}


export const getChildrenMaxDimensions: ((
    nodeId: string,
    sharedNodes: y.Map<NodeObject>,
) => DimensionsType) = (nodeId, sharedNodes) => {
    const node = sharedNodes.get(nodeId);
    if (node === undefined) {
        console.log('Node not found.');
        return {
            horizontal: Infinity,
            vertical: Infinity,
        };
    }

    const nodeData = node.data as NodeData;
    const cyNode =  cy.getElementById(nodeId);
    const directChildren: string[] = cyNode.children().map(c => c.id());
    const children: (NodeObject | undefined)[] = directChildren.map(cid => sharedNodes.get(cid));

    if (children.length === 0) { 
        return nodeData.dimensions;
    }

    const center = cyNode.position();

    let horizontalMax = -Infinity;
    let verticalMax = -Infinity;

    children.map(c => {
        if (c === undefined) return;
        const childData = c.data as NodeData;

        const childLeft = c.position.x - childData.dimensions.horizontal - padding;
        const childRight = c.position.x + childData.dimensions.horizontal + padding;
        const childTop = c.position.y - childData.dimensions.vertical - padding;
        const childBottom = c.position.y + childData.dimensions.vertical + padding;
        
        const leftDiff = center.x - childLeft;
        const rightDiff = childRight - center.x;
        const topDiff = center.y - childTop;
        const bottomDiff = childBottom - center.y;

        horizontalMax = Math.max(leftDiff, rightDiff, horizontalMax);
        verticalMax = Math.max(topDiff, bottomDiff, verticalMax);
    });

    return {
        horizontal: horizontalMax,
        vertical: verticalMax,
    };
};

export const dragNode = (node: NodeObject, sharedNodes: y.Map<NodeObject>) => {
    changeDimensions(node.data.id, sharedNodes);
};
