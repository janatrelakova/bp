import { Position } from "cytoscape";
import { NodeObject, NodeType } from "./node";

export type PortData = {
    id: string,
    width: number,
    height: number,
    portOf: NodeObject,
    label: null,
    labelId: string,
    situatedOn: 'left' | 'top' | 'right' | 'bottom',
    type: NodeType,
}

export type PortLabelData = {
    id: string;
    label: string;
    width: number;
    height: number;
    labelOf: string;
    type: NodeType,
    diffFromNode: {
        x: number;
        y: number;
    },
}
