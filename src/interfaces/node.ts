import { Position } from "cytoscape"
import { PortData, PortLabelData } from "./port"

export enum NodeType {
    node = 'node',
    port = 'port',
    portLabel = 'portLabel',
}

export type Dimensions = {
    horizontal: number,
    vertical: number,
}

export type NodeData = {
    id: string,
    label: string,
    width: number,
    height: number,
    ports: string[],
    dimensions: Dimensions,
    parent: string | null,
    type: NodeType,
}

export type NodeObject = {
    data: NodeData | PortData | PortLabelData,
    position: Position,
}
