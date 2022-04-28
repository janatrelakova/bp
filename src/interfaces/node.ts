import { Position } from "cytoscape"
import { PortData } from "./port"

export type NodeData = {
    id: string,
    label: string,
    width: number,
    height: number,
    ports: string[],
}

export type NodeObject = {
    data: NodeData | PortData,
    position: Position,
    type: string,
}
