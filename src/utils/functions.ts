import { Core, EdgeCollection, EdgeSingular, NodeSingular } from "cytoscape";

type positionType = {
    x: number,
    y: number,
}

type addNodeProps = {
    cy: Core,
    id: string,
    label: string,
    position?: positionType
}

export const cyAddNode = ({
    cy,
    id,
    label,
}: addNodeProps) => {
    console.log("adding node")
    const data = {
        id: id,
        label: label,
        active: true,
        position: {
            x: 200,
            y: 200,
        },
    }
    return data;
  };
  
