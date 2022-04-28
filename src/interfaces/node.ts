import { Position } from "cytoscape"
import { PortData } from "./port"

export type Dimensions = {
    left: number,
    top: number,
    right: number,
    bottom: number,
}

export type NodeData = {
    id: string,
    label: string,
    width: number,
    height: number,
    ports: string[],
    dimensions: Dimensions,
    parent: string | null,
}

export type NodeObject = {
    data: NodeData | PortData,
    position: Position,
    type: string,
}
