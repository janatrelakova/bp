import { Core } from "cytoscape";
import { MutableRefObject } from "react";
import { NodeData, NodeObject } from "../interfaces/node";
import { addNode, addNodeToParent } from "./node-functions";
import * as y from 'yjs';


export const registerContextMenu = (
    cy: Core,
    resizeNode: (event: any) => void,
    renameNode: (event: any) => void,
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
        ],
        submenuIndicator: { src: '../arrow.svg', width: 12, height: 12 }
    });
};
