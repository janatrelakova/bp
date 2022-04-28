import { Position } from "cytoscape";
import { NodeObject } from "./node";

export type PortData = {
    id: string,
    label: string | null,
    width: number,
    height: number,
    portOf: NodeObject,
    situatedOn: 'left' | 'top' | 'right' | 'bottom',
    positionOnNode: Position,
}
