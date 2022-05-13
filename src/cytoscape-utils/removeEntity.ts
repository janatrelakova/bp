import React from 'react';
import { reduceEachTrailingCommentRange } from 'typescript';
import * as y from 'yjs';
import { cy } from '../components/DiagramPage/DiagramCanvas';
import { EdgeObject } from '../interfaces/edge';
import { NodeData, NodeObject, NodeType } from '../interfaces/node';
import { PortData, PortLabelData } from '../interfaces/port';


const getNodes = (doc: React.MutableRefObject<y.Doc>) => {
    return doc.current.getMap('shared-nodes') as y.Map<NodeObject>;
}

const getEdges = (doc: React.MutableRefObject<y.Doc>) => {
    return doc.current.getMap('shared-edges') as y.Map<EdgeObject>;
}

export const removeNode = (
    event: any,
    doc: React.MutableRefObject<y.Doc>,
    ) => {
    const target = event.target.id();
    const sharedNodes = getNodes(doc);
    const removed = sharedNodes.get(target);

    if (removed === undefined) {
        console.log('was null');
        return;
    }

    const removedData = removed as NodeObject;
    console.log(removedData);

    switch (removedData.data.type) {
        case NodeType.node: {
            removeAll(removedData, doc);
            break;   
        }
        case NodeType.nodeLabel: {
            removeNodeLabel(removedData, doc);
            break;
        }
        case NodeType.port: {
            removePort(removedData, doc);
            break;
        }
        case NodeType.portLabel: {
            removePortLabel(removedData, doc);
            break;
        }
    }
}

const removePort = (object: NodeObject, doc: React.MutableRefObject<y.Doc>, labelId: null | string = null) => {
    const portId = object.data.id;
    const edges = getEdges(doc);
    const nodes = getNodes(doc);

    const cyPort = cy.getElementById(portId);
    // edges
    const outcomingEdges = cyPort.connectedEdges();
    cy.remove(outcomingEdges);
    outcomingEdges.forEach(e => {
        const id = e.id();
        edges.delete(id);
    });

    const portData = object.data as PortData;

    //label
    if (labelId === null) {
        labelId = portData.labelId;
    }
    nodes.delete(labelId);

    // itself
    nodes.delete(portId);
}

const removeAll = (object: NodeObject, doc: React.MutableRefObject<y.Doc>) => {
    const objectId = object.data.id;
    const cyNode = cy.getElementById(objectId);
    if (cyNode === undefined) {
        return;
    }
    // children removal
    const children = cyNode.children();
    const nodes = getNodes(doc);
    const edges = getEdges(doc);
    children.forEach(c => removeAll(c as unknown as NodeObject, doc));

    // label removal
    nodes.delete(objectId + '-label');

    // ports removal
    const nodeData = object.data as NodeData;
    const ports = nodeData.ports;

    ports.forEach(portId => {
        const port = nodes.get(portId);
        if (port === undefined) {
            return;
        }
        removePort(port, doc);
    });

    // itself
    nodes.delete(objectId);
}

const removePortLabel = (object: NodeObject, doc: React.MutableRefObject<y.Doc>) => {
    const labelData = object.data as PortLabelData;
    const portId = labelData.labelOf;
    const nodes = getNodes(doc);
    const port = nodes.get(portId);
    if (port === undefined) {
        return;
    }

    removePort(port, doc, object.data.id);
}

const removeNodeLabel = (object: NodeObject, doc: React.MutableRefObject<y.Doc>) => {
    const nodes = getNodes(doc);
    const node = nodes.get(object.data.id.slice(0, -6));
    if (node === undefined) {
        return;
    }
    removeAll(node, doc);
}

export {removeAll, removePort, removeNodeLabel, removePortLabel}
