import * as React from 'react';
import cytoscape, { Core, EdgeDefinition, NodeDefinition, Position } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

import * as y from 'yjs';
import { useEffect, useRef, MutableRefObject } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { cytoscapestyles } from '../../utils/cytoscapestyles';
import './DiagramCanvas.css';

import Crop32TwoToneIcon from '@mui/icons-material/Crop32TwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
import ArrowForwardTwoToneIcon from '@mui/icons-material/ArrowForwardTwoTone';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CropSquareSharpIcon from '@mui/icons-material/CropSquareSharp';


import { Link } from 'react-router-dom';


var $ = require('jquery');
const contextMenus = require('cytoscape-context-menus');
const nodeEditing = require('cytoscape-node-editing');

(window as any).$ = $;
var konva = require('konva');

cytoscape.use(contextMenus);

contextMenus(cytoscape, $);
nodeEditing(cytoscape, $, konva);

cytoscape.use(edgehandles);

let cy: Core;

type NodeData = {
    id: string,
    label: string | null,
}

type NodeObject = {
    data: NodeData,
    position: Position,
}

type EdgeData = {
    source: string,
    target: string,
}

type EdgeObject = {
    id: string,
    data: EdgeData,
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

const DiagramCanvas = ({
    doc
} : DiagramCanvasProps) => {

    
    const sharedNodes = doc.current.getMap('shared-nodes') as y.Map<NodeObject>;
    const sharedEdges = doc.current.getMap('shared-edges') as y.Map<EdgeObject>;

    const addingNode = useRef<boolean>(false);

    const registerEventHandlers = (cy: Core, addNodeStatus: MutableRefObject<boolean>) => {

        cy.on('tap', function(event) {
            if (addNodeStatus.current) {
                if (event.target === cy) {
                    addNode(event.position);
                    addNodeStatus.current = false;                    
                } else {
                    console.log('tap on element');
                    addNodeToParent(event.position, event.target.id());        
                }
            }

        });
        
    };

    useEffect(() => {

        sharedNodes.observeDeep(() => {
            cy.elements().remove();
            cy.add(Array.from<NodeDefinition>(sharedNodes.values()));
            cy.add(Array.from<EdgeDefinition>(sharedEdges.values()));
        });

        sharedEdges.observeDeep(() => {
            cy.elements('edge').remove();
            cy.add(Array.from<EdgeDefinition>(sharedEdges.values()));
        });
        
        cy = cytoscape({
            container: document.getElementById('cy'),
            elements: {
                nodes: Array.from<NodeDefinition>(sharedNodes.values()),
                edges: Array.from<EdgeDefinition>(sharedEdges.values()),
            },
            minZoom: 1.05,
            maxZoom: 5,
            style: cytoscapestyles,
        });

        cy.layout(defaultOptions);

        registerEventHandlers(cy, addingNode);

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
        
    }, []);


    const addNodeToParent = (position: Position, parent: string) => {
        const addedNodeId = uuidv4();
        const addedNode = {
            data: {
                id: addedNodeId,
                label: addedNodeId,
                parent: parent,
                width: 50,
            },
            position: {
                x: position.x,
                y: position.y,
            },
        };
        sharedNodes.set(addedNodeId, addedNode);
    }


    const addNode = (position: Position) => {

        const addedNodeId = uuidv4();
        const addedNode = {
            data: {
                id: addedNodeId,
                label: addedNodeId,
                width: 200,

            },
            position: {
                x: position.x,
                y: position.y,
            },
        };
        sharedNodes.set(addedNodeId, addedNode);
    };

    const addEdgeClick = () => {
        const length = cy.elements('node').length;

        if (length < 2) {
            console.log('There is nothing to connect');
        }

        const index1 = Math.floor(Math.random() * length);
        let index2 =  Math.floor(Math.random() * length);
        while (index1 === index2) {
            index2 = Math.floor(Math.random() * length);
        }

        const keys = Array.from<string>(sharedNodes.keys());
        const newId = uuidv4();
        const newEdge = {
            data: {
                source: keys[index1],
                target: keys[index2],
            },
            id: newId,
        };

        sharedEdges.set(newId, newEdge);
    }

    const clearData = () => {
        sharedEdges.clear();
        sharedNodes.clear();
        console.log('cleared.');
    };

    return (
        <div className='diagram'>

            <div className='diagram__header'>
                <span className='header__title'>IbdDiagram</span>
                <div className='header__icons'>
                    <Link to={`/`}>
                        <HomeOutlinedIcon fontSize='large' color='primary'/>
                    </Link>
                </div>
            </div>

            <div className='diagram__canvas'>

                <div className='canvas__toolbar'>

                    <Tooltip title='Add node' placement='right'>
                        <IconButton>
                            <Crop32TwoToneIcon fontSize='large' color='primary' onClick={() => {
                                addingNode.current = true;
                            }}/>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title='Add edge' placement='right'>
                        <IconButton>
                            <ArrowForwardTwoToneIcon fontSize='large' color='primary' onClick={addEdgeClick} />
                        </IconButton>
                    </Tooltip>

                    
                    <Tooltip title='Add port' placement='right'>
                        <IconButton>
                            <CropSquareSharpIcon fontSize='large' color='primary' />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title='Clear data' placement='right'>
                        <IconButton>
                            <DeleteForeverTwoToneIcon fontSize='large' color='primary' onClick={clearData}/>
                        </IconButton>
                    </Tooltip>


                </div>

                <div className="canvas__cy" id="cy"></div>

            </div>


        </div>
    );
    
};

export default DiagramCanvas;
export {cy};