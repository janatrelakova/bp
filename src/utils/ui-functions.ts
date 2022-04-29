import { NodeData, NodeObject } from "../interfaces/node";
import * as y from 'yjs';
import { changeDimensions, getChildrenMaxDimensions } from "../cytoscape-utils/node-functions";


export const handleRenameNodeApply = (
    setter: ((value: React.SetStateAction<boolean>) => void),
    affectedNodeId: null | string,
    sharedNodes: y.Map<NodeObject>,
    namePart1: string,
    namePart2: string,
    ) => {
    setter(false);
    if (affectedNodeId === null) {
        console.log('Something went really wrong.');
        return;
    }
    const renamed = sharedNodes.get(affectedNodeId);
    if (renamed === undefined) {
        console.log('Something went really wrong. --- undefined');
        return;
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
        console.log('Something went really wrong.');
        return;
    }
    const resized = sharedNodes.get(affectedNodeId);
    if (resized === undefined) {
        console.log('Something went really wrong. --- undefined');
        return;
    }
    const resizedData = resized.data as NodeData;
    resizedData.width = nodeWidth;
    resizedData.height = nodeHeight;
    resizedData.dimensions = getChildrenMaxDimensions(affectedNodeId, sharedNodes);

    resized.data = resizedData;
    
    sharedNodes.set(resized.data.id, resized);

    changeDimensions(affectedNodeId, sharedNodes);
};
