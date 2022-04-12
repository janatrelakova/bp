import * as React from 'react';
import cytoscape, { Core, ElementDefinition, NodeDefinition, Position } from 'cytoscape';
import * as y from 'yjs';
import { useRef, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';


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
    position: Position,
}

type NodeObject = {
    data: NodeData,
}



var defaultOptions = {
    name: "cose",
    // other options
    fit: false,
    padding: 250,
    nodeDimensionsIncludeLabels: true,
    idealEdgeLength: 150,
    edgeElasticity: 0.1,
    nodeRepulsion: 8500,
    infinite: true,
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

    
    const sharedNodes = useRef(doc.current.getArray('shared-nodes'));
    const sharedElements = doc.current.getMap('shared-elements') as y.Map<NodeObject>;

    useEffect(() => {
        /*
        sharedNodes.current.observeDeep(() => {
            cy.elements().remove();
            cy.add(sharedNodes.current.toArray() as ElementDefinition[]);
        });
        */

        sharedElements.observeDeep(() => {
            cy.elements().remove();
            cy.add(Array.from(sharedElements.values()) as ElementDefinition[]);
            console.log("reregistered");
        });

        cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
                nodes: Array.from(sharedElements.values()) as NodeDefinition[],
                edges: [],
            },
            minZoom: 1.05,
            maxZoom: 5,
        });

        cy.addListener('dragfree', 'node', (e) => {
            /*
            const node = e.target;
            const index = node.id();
            
            sharedNodes.current.forEach(console.log);
            const moved = sharedNodes.current.get(index) as NodeDefinition;
            if (moved == null) {
                console.log("moved was null");
            }
            sharedNodes.current.delete(index as number);
            moved.position = {x: node.position().x, y: node.position().y} as Position;

            sharedNodes.current.insert(index, [moved]);
            */

            console.log('dragfree');
            const node = e.target;
            const nodeId = node.id();
            console.log(nodeId);
            console.log(node.position());
            sharedElements.set(nodeId, {
                data: {
                    id: nodeId,
                    label: node.label,
                    position: {
                        x: 500,
                        y: 500,
                    },
                }
            })
        })

        cy.layout(defaultOptions)
    }, []);


    const addButtonClick = () => {
        const addedNodeId = uuidv4();
        const addedNode = {
            data: {
                id: addedNodeId,
                label: null,
                position: {
                    x: 150,
                    y: 450,
                }
            }
        };
        sharedElements.set(addedNodeId, addedNode)
    }        

    const clearData = () => {
        sharedElements.clear();
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
