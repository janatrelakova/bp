import { Core } from "cytoscape";
import { NodeObject } from "../interfaces/node";
import * as y from 'yjs';
import { EdgeObject } from "../interfaces/edge";

export const registerContextMenu = (
    cy: Core,
    doc: React.MutableRefObject<y.Doc>,
    resizeNode: (event: any) => void,
    renameNode: (event: any) => void,
    removeNode: (event: any, doc: React.MutableRefObject<y.Doc>) => void,
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
        ],
        submenuIndicator: { src: '../arrow.svg', width: 12, height: 12 }
    });
};
