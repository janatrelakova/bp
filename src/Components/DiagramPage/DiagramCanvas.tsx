import * as React from 'react';
import cytoscape, { Core, ElementDefinition, NodeDefinition, Position } from 'cytoscape';
import * as y from 'yjs';
import { useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cytoscapestyles } from '../../utils/cytoscapestyles';


var $ = require('jquery');
const contextMenus = require('cytoscape-context-menus');
const nodeEditing = require('cytoscape-node-editing');

(window as any).$ = $;
var konva = require('konva');

cytoscape.use(contextMenus);

contextMenus(cytoscape, $);
nodeEditing(cytoscape, $, konva);

let cy: Core;

type NodeData = {
    id: string,
    label: string | null,
}

type NodeObject = {
    data: NodeData,
    position: Position,
}



var defaultOptions = {
    name: "cose",
    // other options
    fit: true,
    padding: 250,
    nodeDimensionsIncludeLabels: true,
    idealEdgeLength: 150,
    edgeElasticity: 0.1,
    nodeRepulsion: 8500,
  };
  

type DiagramCanvasProps = {
    doc: React.MutableRefObject<y.Doc>
}

type MapNodesType = {
    key: string,
    value: NodeObject;
}

const DiagramCanvas = ({
    doc
} : DiagramCanvasProps) => {

    
    const sharedNodes = doc.current.getMap('shared-nodes') as y.Map<NodeObject>;

    useEffect(() => {

        sharedNodes.observeDeep(() => {
            cy.elements().remove();
            cy.add(Array.from<NodeDefinition>(sharedNodes.values()));
        });
            
        
        cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
                nodes: Array.from<NodeDefinition>(sharedNodes.values()),
                edges: [],
            },
            minZoom: 1.05,
            maxZoom: 5,
            style: cytoscapestyles,
        });

        cy.layout(defaultOptions);

    }, []);

    useEffect(() => {
        cy.addListener('dragfree', 'node', (e) => {
            const node = e.target;
            const nodeId = node.id();

            const movedNode = sharedNodes.get(nodeId);

            if (movedNode === undefined) {
                alert("Dragged node is undefined...");
                return;
            }
            movedNode.position = node.position();
            sharedNodes.set(nodeId, movedNode);
         });
        
    }, [])


    const addButtonClick = () => {

        const addedNodeId = uuidv4();
        const addedNode = {
            data: {
                id: addedNodeId,
                label: addedNodeId,
            },
            position: {
                x: 150,
                y: 300,
            },
        };
        sharedNodes.set(addedNodeId, addedNode);
    }        

    const clearData = () => {
        sharedNodes.clear();
    }

    return (
        <>
            <div className='diagram-canvas' id="cy"></div>
            <button onClick={addButtonClick}>Add node</button>
            <button onClick={clearData}>Clear shared data</button>
        </>
    );
    
};

export default DiagramCanvas;
