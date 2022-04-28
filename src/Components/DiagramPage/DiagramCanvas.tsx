import * as React from 'react';
import cytoscape, { Core, EdgeDefinition, NodeDefinition, NodeSingular, Position } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

import * as y from 'yjs';
import { useEffect, useRef, MutableRefObject, useState, Dispatch } from 'react';
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
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MouseIcon from '@mui/icons-material/Mouse';

import { Link } from 'react-router-dom';
import { EdgeObject } from '../../interfaces/edge';
import { NodeObject, NodeData } from '../../interfaces/node';
import { layoutOptions } from '../../cytoscape-utils/layoutOptions';
import { edgeOptions } from '../../cytoscape-utils/edgeOptions';
import { handleRenameNodeApply, handleResizeNodeApply } from '../../utils/ui-functions';
import { PortData } from '../../interfaces/port';
import { addNode, addNodeToParent, getNodePorts } from '../../cytoscape-utils/node-functions';
import { registerContextMenu } from '../../cytoscape-utils/cy-functions';
import { addPort, movePorts } from '../../cytoscape-utils/port-functions';
import { addEdgeClick } from '../../cytoscape-utils/edge-functions';

var $ = require('jquery');
const contextMenus = require('cytoscape-context-menus');
let automove = require('cytoscape-automove');

(window as any).$ = $;

cytoscape.use(contextMenus);
cytoscape.use(edgehandles);
cytoscape.use(automove);

contextMenus(cytoscape, $);

let cy: Core;

type DiagramCanvasProps = {
    doc: React.MutableRefObject<y.Doc>
}

const DiagramCanvas = ({
    doc
} : DiagramCanvasProps) => {

    
    const sharedNodes = doc.current.getMap('shared-nodes') as y.Map<NodeObject>;
    const sharedEdges = doc.current.getMap('shared-edges') as y.Map<EdgeObject>;

    const addingNode = useRef<boolean>(false);
    const addingPort = useRef<boolean>(false);
    const [ dialogOpen, setDialogOpen ] = useState<boolean>(false);
    const [ renameDialogOpen, setRenameDialogOpen ] = useState<boolean>(false);
    const [ nodeWidth, setNodeWidth ] = useState<number>(100);
    const [ nodeHeight, setNodeHeight ] = useState<number>(200);
    const [ nodeName1, setNodeName1 ] = useState<string>('');
    const [ nodeName2, setNodeName2 ] = useState<string>('');
    const [ resizingNode, setResizingNode ] = useState<null | string>(null);
    const [ renamingNode, setRenamingNode ] = useState<null | string>(null);

    let sourceNode: NodeSingular | null = null;
    let targetNode: NodeSingular | null = null;


    const resizeNode = (
            event: any,
        ) => {
        setResizingNode(event.target.id());
        setDialogOpen(true);
    };

    const renameNode = (event: any) => {
        setRenamingNode(event.target.id());
        setRenameDialogOpen(true);
    }

    const registerEventHandlers = (cy: Core, addNodeStatus: MutableRefObject<boolean>, addPortStatus: MutableRefObject<boolean>) => {

        cy.on('tap', function(event) {
            if (addNodeStatus.current) {
                if (event.target === cy) {
                    addNode(event.position, sharedNodes, nodeWidth, nodeHeight);
                } else {
                    console.log('tap on element');
                    addNodeToParent(event.position, event.target, sharedNodes);        
                }
                addNodeStatus.current = false;                    

            } else if (addPortStatus.current) {
                if (event.target.isNode) {
                    console.log(event.target);

                    addPort(event.position, event.target, sharedNodes);
                    console.log(event.target.data().ports);
                    const z = sharedNodes.get(event.target.id())?.data as NodeData;
                    console.log(z.ports);
                }
                addPortStatus.current = false;
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


        cy.layout(layoutOptions);
        cy.edgehandles(edgeOptions);
        (cy as any).automove();

        registerEventHandlers(cy, addingNode, addingPort);
        registerContextMenu(cy, resizeNode, renameNode);
    }, []);

    useEffect(() => {
        cy.addListener('drag', 'node', function(e) {
            const node = e.target;
            const nodeId = node.id();

            const movedNode = sharedNodes.get(nodeId);

            if (movedNode === undefined) {
                alert("Dragged node is undefined...");
                return;
            }
            
            if (movedNode.type !== 'node') {
                console.log('would move port');
                return;
            }

            const nodeData = movedNode.data as NodeData;

            movePorts(movedNode.position, nodeData.ports, sharedNodes);

            console.log('moving ports');
        });

        cy.addListener('dragfree', 'node', (e) => {
            const node = e.target;
            const nodeId = node.id();

            const movedNode = sharedNodes.get(nodeId);

            if (movedNode === undefined) {
                alert("Dragged node is undefined...");
                return;
            }

            if (movedNode.type !== 'node') {
                console.log('would move port');
                return;
            }

            const nodeData = movedNode.data as NodeData;

            console.log('before moving ports')

            movedNode.position = node.position();
            movePorts(movedNode.position, nodeData.ports, sharedNodes)
            sharedNodes.set(nodeId, movedNode);
         });
        
    }, []);

    const clearData = () => {
        sharedEdges.clear();
        sharedNodes.clear();
        console.log('cleared.');
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    const handleRenameClose = () => {
        setRenameDialogOpen(false);
    };

    return (
        <>
            <div>
                <Dialog open={dialogOpen} onClose={handleClose}>
                    <DialogTitle>Enter dimensions</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="width"
                            label="Width"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            margin="normal"
                            value={nodeWidth}
                            onChange={(e) => setNodeWidth(e.target.value as unknown as number)}
                        />
                        <TextField
                            id="height"
                            label="Height"
                            type="number"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            margin="normal"
                            value={nodeHeight}
                            onChange={(e) => setNodeHeight(e.target.value as unknown as number)}
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => handleResizeNodeApply(
                        setDialogOpen,
                        resizingNode,
                        sharedNodes,
                        nodeWidth,
                        nodeHeight,
                    )}>Apply</Button>
                    </DialogActions>
                </Dialog>
            </div>
            <div>
                <Dialog open={renameDialogOpen} onClose={handleRenameClose}>
                <DialogTitle>Enter name</DialogTitle>
                <DialogContent>
                    <TextField
                        id="name1"
                        label="Name"
                        type="string"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        margin="dense"
                        value={nodeName1}
                        onChange={(e) => setNodeName1(e.target.value)}
                        />
                        <span>:</span>
                        <TextField
                        id="name2"
                        label="Name"
                        type="string"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        margin="dense"
                        value={nodeName2}
                        onChange={(e) => setNodeName2(e.target.value)}
                />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleRenameNodeApply(
                        setRenameDialogOpen, 
                        renamingNode, 
                        sharedNodes,
                        nodeName1,
                        nodeName2,
                        )}>Apply</Button>
                </DialogActions>
                </Dialog>
            </div>
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

                        
                        <Tooltip title='Actions off' placement='right'>
                            <IconButton onClick={() => {
                                    addingNode.current = false;
                                    addingPort.current = false;
                                }}>
                                <MouseIcon fontSize='large' color='primary'/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Add node' placement='right'>
                            <IconButton onClick={() => {
                                    addingNode.current = true;
                                }}>
                                <Crop32TwoToneIcon fontSize='large' color='primary'/>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Add edge' placement='right'>
                            <IconButton onClick={() => addEdgeClick(sharedNodes, sharedEdges)}>
                                <ArrowForwardTwoToneIcon fontSize='large' color='primary'  />
                            </IconButton>
                        </Tooltip>

                        
                        <Tooltip title='Add port' placement='right'>
                            <IconButton onClick={() => {addingPort.current = true;}}>
                                <CropSquareSharpIcon fontSize='large' color='primary' />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Clear data' placement='right'>
                            <IconButton onClick={clearData}>
                                <DeleteForeverTwoToneIcon fontSize='large' color='primary' />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <div className="canvas__cy" id="cy"></div>
                </div>
            </div>        
        </>
    );
};

export default DiagramCanvas;
export {cy};
