import { NodeData, NodeObject, NodeType } from "../interfaces/node";
import * as y from 'yjs';
import { changeDimensions } from "../cytoscape-utils/node-functions";
import { PortData } from "../interfaces/port";


export const handleRenameNodeApply = (
    setter: ((value: React.SetStateAction<boolean>) => void),
    affectedNodeId: null | string,
    sharedNodes: y.Map<NodeObject>,
    namePart1: string,
    namePart2: string,
    ) => {
    setter(false);
    if (affectedNodeId === null) {
        return;
    }
    let renamed = sharedNodes.get(affectedNodeId);
    if (renamed === undefined) {
        return;
    }

    if (renamed.data.type === NodeType.port) {
        const portData = renamed.data as PortData;
        renamed = sharedNodes.get(portData.labelId);
        if (renamed === undefined) {
            return;
        }
    } else if (renamed.data.type === NodeType.node) {
        const id = affectedNodeId + '-label';
        renamed = sharedNodes.get(id);
        if (renamed === undefined) {
            return;
        }
    }

    renamed.data.label = namePart1 + ' : ' + namePart2;
    sharedNodes.set(renamed.data.id, renamed);
};

export const handleResizeNodeApply = (
    setter: ((value: React.SetStateAction<boolean>) => void),
    affectedNodeId: null | string,
    sharedNodes: y.Map<NodeObject>,
    nodeWidth: number,
    nodeHeight: number,
) => {
    setter(false);
    if (affectedNodeId === null) {
        return;
    }
    const resized = sharedNodes.get(affectedNodeId);
    if (resized === undefined) {
        return;
    }

    if (resized.data.type !== NodeType.node) {
        return;
    }
    
    const resizedData = resized.data as NodeData;
    resizedData.width = nodeWidth;
    resizedData.height = nodeHeight;

    resized.data = resizedData;
    (resized.data as any).dimensions = {
        horizontal: nodeWidth / 2,
        vertical: nodeHeight / 2,
    };
    
    sharedNodes.set(resized.data.id, resized);
    changeDimensions(affectedNodeId, sharedNodes);
};

export const handlePortFlowChange = (
    setter: ((value: React.SetStateAction<boolean>) => void),
    portId: null | string,
    sharedNodes: y.Map<NodeObject>,
    arrow: string | null,
) => {
    setter(false);
    if (portId === null) {
        return;
    }
    const port = sharedNodes.get(portId);
    if (port === undefined) {
        return;
    }
    if (arrow === null) {
        arrow =  '→';
    }

    port.data.label = arrow;
    sharedNodes.set(portId, port);
}
