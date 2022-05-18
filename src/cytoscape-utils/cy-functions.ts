import { Core } from "cytoscape";
import * as y from 'yjs';

export const registerContextMenu = (
    cy: Core,
    doc: React.MutableRefObject<y.Doc>,
    resizeNode: (event: any) => void,
    renameNode: (event: any) => void,
    removeNode: (event: any, doc: React.MutableRefObject<y.Doc>) => void,
    changeFlow: (event: any, doc: React.MutableRefObject<y.Doc>) => void,
    removeEdge: (event: any) => void,
    ) => {
    (cy as any).contextMenus({
        menuItems: [
            {
                id: 'resize',
                content: 'Resize',
                tooltip: 'Resize',
                selector: 'node',
                onClickFunction: (e: any) => resizeNode(e),
            },
            {
                id: 'rename',
                content: 'Rename',
                tooltip: 'Rename',
                selector: 'node',
                onClickFunction: (e: any) => renameNode(e),
            },
            {
                id: 'remove',
                content: 'Remove',
                tooltip: 'Remove',
                selector: 'node',
                onClickFunction: (e: any) => removeNode(e, doc),
            },
            {
                id: 'reflow',
                content: 'Change flow',
                tooltip: 'Change flow',
                selector: 'node[type = "port"]',
                onClickFunction: (e: any) => changeFlow(e, doc),
            },
            {
                id: 'remove-edge',
                content: 'Remove',
                tooltip: 'Remove Edge',
                selector: 'edge',
                onClickFunction: (e: any) => removeEdge(e),
            }
        ],
        submenuIndicator: { src: '../arrow.svg', width: 12, height: 12 }
    });
};
