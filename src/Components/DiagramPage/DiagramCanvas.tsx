import * as React from 'react';
import cytoscape, { Core, ElementDefinition, ElementsDefinition, NodeDefinition, Position } from 'cytoscape';
import { cyAddNode } from '../../utils/functions';
import { v4 as uuidv4 } from 'uuid';
import * as y from 'yjs';
import { useRef, useState, useEffect } from 'react';
import { event } from 'jquery';


var $ = require('jquery');
const contextMenus = require('cytoscape-context-menus');
const nodeEditing = require('cytoscape-node-editing');

(window as any).$ = $;
var konva = require('konva');

cytoscape.use(contextMenus);

contextMenus(cytoscape, $);
nodeEditing(cytoscape, $, konva);

let cy: Core;



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

const DiagramCanvas = ({
    doc
} : DiagramCanvasProps) => {

    
    const sharedNodes = useRef(doc.current.getArray('shared-nodes'));
    const [ nodes, setNodes ] = useState(sharedNodes.current);

    useEffect(() => {
        sharedNodes.current.observeDeep(() => {
            setNodes(sharedNodes.current);
            cy.elements().remove();
            cy.add(sharedNodes.current.toArray() as ElementDefinition[]);

        });

        cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
                nodes: sharedNodes.current.toArray() as NodeDefinition[],
                edges: [],
            },
            minZoom: 1.05,
            maxZoom: 5,
        });

        cy.addListener('dragfree', 'node', (e) => {
            const node = e.target;
            const index = node.id() as number;
            const moved = sharedNodes.current.get(index) as NodeDefinition;
            if (moved == null) {
                return;
            }
            sharedNodes.current.delete(index);
            moved.position = {x: node.position.x, y: node.position.y};
            sharedNodes.current.insert(index, [moved]);
            cy.elements().remove();
            cy.add(sharedNodes.current.toArray() as ElementDefinition[]);
        })

        cy.layout(defaultOptions)
    }, []);


    const addButtonClick = () => {
        const addedNode = cyAddNode({
            cy: cy,
            id: sharedNodes.current.length.toString(),
            label: 'ahoj',

        });
        sharedNodes.current.push([addedNode]);
        cy.elements().remove();
        cy.add(sharedNodes.current.toArray() as ElementDefinition[]);
    }        

    const clearData = () => {
        sharedNodes.current.forEach(console.log);

        sharedNodes.current.delete(0, sharedNodes.current.length);
        cy.elements().remove();
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