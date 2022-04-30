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
                left: - nodeWidth / 2,
                top: nodeHeight / 2,
                right: nodeWidth / 2,
                bottom: - nodeHeight / 2,
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
                left: - nodeWidth / 2,
                top: nodeHeight / 2,
                right: nodeWidth / 2,
                bottom: - nodeHeight / 2,
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
    console.log(affectedNodeData.ports);
    moveNodePorts(affectedNodeData.ports, affectedNode, sharedNodes);

    changeDimensions(affectedNodeData.parent, sharedNodes);
};

type DimensionsType = {
    left: number,
    right: number,
    top: number,
    bottom: number,
}


export const getChildrenMaxDimensions: ((
    nodeId: string,
    sharedNodes: y.Map<NodeObject>,
) => DimensionsType) = (nodeId, sharedNodes) => {
    const nodeData = sharedNodes.get(nodeId)?.data as NodeData;
    const previousDimensions = nodeData.dimensions;
    const cyNode = cy.getElementById(nodeId);
    const directChildren: string[] = cy.getElementById(nodeId).children().map(c => c.id());
    const sharedChildren: (NodeObject | undefined)[] = directChildren.map(cid => sharedNodes.get(cid));
    const children = sharedChildren.filter(c => c !== undefined);
    const left = Math.min(...children.map(n => {
        if (n === undefined) {
            return Infinity;
        }
        const nodeData = n.data as NodeData;
        return nodeData.dimensions.left + n.position.x - padding;
    }));

    const right = Math.max(...children.map(n => {
        if (n === undefined) {
            return -Infinity;
        }
        const nodeData = n.data as NodeData;
        return nodeData.dimensions.right + n.position.x + padding;
    }));

    const bottom = Math.min(...children.map(n => {
        if (n === undefined) {
            return Infinity;
        }
        const nodeData = n.data as NodeData;
        return nodeData.dimensions.bottom + n.position.y - padding;
    }));

    const top = Math.max(...children.map(n => {
        if (n === undefined) {
            return -Infinity;
        }
        const nodeData = n.data as NodeData;
        return nodeData.dimensions.top + n.position.y + padding;
    }));

    console.log(left, right, top, bottom);

    if (children.length > 0) {
        return {
            left: left - cyNode.position().x ,
            right: right - cyNode.position().x,
            top: - cyNode.position().y + top,
            bottom:  -cyNode.position().y + bottom,
        };        
    }

    return previousDimensions;
};
