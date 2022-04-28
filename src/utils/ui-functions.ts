import { NodeObject } from "../interfaces/node";
import * as y from 'yjs';


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

    resized.data.width = nodeWidth;
    resized.data.height = nodeHeight;
    sharedNodes.set(resized.data.id, resized);

    const trigger = new CustomEvent('resize', {
        detail: affectedNodeId,
    })
    document.dispatchEvent(trigger);
};
