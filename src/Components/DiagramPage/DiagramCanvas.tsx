import * as React from 'react';
import cytoscape, { CollectionReturnValue, Core, EdgeDefinition, NodeDefinition, NodeSingular, Position } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

import * as y from 'yjs';
import { useEffect, useRef, MutableRefObject, useState } from 'react';
import { cytoscapestyles } from '../../utils/cytoscapestyles';
import './DiagramCanvas.css';

import Crop32TwoToneIcon from '@mui/icons-material/Crop32TwoTone';
import DeleteForeverTwoToneIcon from '@mui/icons-material/DeleteForeverTwoTone';
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

import { Link } from 'react-router-dom';
import { EdgeObject } from '../../interfaces/edge';
import { NodeObject, NodeType } from '../../interfaces/node';
import { layoutOptions } from '../../cytoscape-utils/layoutOptions';
import { edgeOptions, ehDefaults } from '../../cytoscape-utils/edgeOptions';
import { handlePortFlowChange, handleRenameNodeApply, handleResizeNodeApply } from '../../utils/ui-functions';
import { addNode, addNodeToParent, dragNode, selectProperNodes } from '../../cytoscape-utils/node-functions';
import { registerContextMenu } from '../../cytoscape-utils/cy-functions';
import { addPort, dragLabel, dragPort } from '../../cytoscape-utils/port-functions';
import { edgeCreateDragOutOfElement, edgeCreateDragOverElement, edgeCreateStart, edgeCreateStop, edgeCreateValidate } from '../../cytoscape-utils/edge-functions';
import { dispatch } from 'd3';
import { removeNode } from '../../cytoscape-utils/removeEntity';

var $ = require('jquery');
const contextMenus = require('cytoscape-context-menus');
var edgeEditing = require('cytoscape-edge-editing');

(window as any).$ = $;

var konva = require('konva');
contextMenus(cytoscape, $);
//edgeEditing(cytoscape, $, konva);

cytoscape.use(contextMenus);
cytoscape.use(edgehandles);


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
    const [ changePortFlowDialog, setChangePortFlowDialog ] = useState<boolean>(false);
    const [ nodeWidth, setNodeWidth ] = useState<number>(100);
    const [ nodeHeight, setNodeHeight ] = useState<number>(200);
    const [ nodeName1, setNodeName1 ] = useState<string>('');
    const [ nodeName2, setNodeName2 ] = useState<string>('');
    const [ resizingNode, setResizingNode ] = useState<null | string>(null);
    const [ renamingNode, setRenamingNode ] = useState<null | string>(null);
    const [ changePortFlowNode, setPortChangeFlowNode ] = useState<null | string>(null);
    const [ changePortFlowValue, setPortChangeFlowValue ] = useState<null | string>(null);
    const [ additionalStyleNode, setAdditionalStyleNode ] = useState<undefined | CollectionReturnValue | null>(undefined);

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

    const changeFlow = (event: any) => {
        setPortChangeFlowNode(event.target.id());
        setChangePortFlowDialog(true);
    }

    const registerEventHandlers = (cy: Core, addNodeStatus: MutableRefObject<boolean>, addPortStatus: MutableRefObject<boolean>) => {

        cy.on('tap', function(event) {
            console.log('tap');
            if (additionalStyleNode) {
                console.log('in setting');
                additionalStyleNode.style('border-color', 'black');
                setAdditionalStyleNode(null);
            }
            if (addNodeStatus.current) {
                if (event.target === cy) {
                    addNode(event.position, sharedNodes, nodeWidth, nodeHeight);
                } else {
                    addNodeToParent(event.position, event.target, sharedNodes);        
                }
                addNodeStatus.current = false;                    

            } else if (addPortStatus.current) {
                if (event.target.isNode) {
                    addPort(event.position, event.target, sharedNodes);
                }
                addPortStatus.current = false;
            } else {
                if (event.target.isNode) {
                    setAdditionalStyleNode(selectProperNodes(event.target, sharedNodes));
                }
            }
        });
    };

    const registerEdgeEventHandlers = (cy: Core) => {
        let eh = cy.edgehandles(ehDefaults);

    //edge creation events
        cy.on('cxttapstart', 'node[type = "port"]', (evt: any) => {
            edgeCreateStart(eh, evt);
        });

        cy.on('cxttapend', 'node[type = "node"], node[type = "portLabel"], node[type = "nodeLabel"]', (evt: any) => {
            eh.stop();
        });

        cy.on('cxttapend', 'node[type = "port"]', (evt: any) => {
            edgeCreateStop(eh, sharedEdges);
        });
      
        cy.on('cxtdragover', 'node', (evt: any) => {
            edgeCreateDragOverElement(evt);
        });
        
        cy.on('cxtdragout', 'node', (evt: any) => {
            edgeCreateDragOutOfElement(evt);
        });
    };

    useEffect(() => {

        sharedNodes.observeDeep(() => {
            cy.elements().remove();
            console.log('som tu');
            cy.add(Array.from<NodeDefinition>(sharedNodes.values()));
            // maybe remove
            //console.log(Array.from<EdgeDefinition>(sharedEdges.values()));
            cy.add(Array.from<EdgeDefinition>(sharedEdges.values()));
        });

        sharedEdges.observeDeep(() => {
            cy.elements().remove();
            cy.add(Array.from<NodeDefinition>(sharedNodes.values()));
            const x = cy.add(Array.from<EdgeDefinition>(sharedEdges.values()));
            console.log(x);
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

        cy.elements().remove();


        cy.layout(layoutOptions);
        cy.edgehandles(edgeOptions);

        registerEventHandlers(cy, addingNode, addingPort);
        registerEdgeEventHandlers(cy);
        registerContextMenu(cy, doc, resizeNode, renameNode, removeNode, changeFlow);
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
            
            if (movedNode.data.type === NodeType.port) {
                dragPort(movedNode, sharedNodes);
                return;
            }

            if (movedNode.data.type === NodeType.portLabel) {
                dragLabel(movedNode, sharedNodes);
                return;
            }

            dragNode(movedNode, sharedNodes);
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

    const handleChangeFlowPortClose = () => {
        setChangePortFlowDialog(false);
    }
        

    return (
        <>
            <div>
                
                <Dialog open={changePortFlowDialog} onClose={handleChangeFlowPortClose}>
                    <DialogTitle>Choose port flow</DialogTitle>
                    <DialogContent>
                    <Button variant="outlined" onClick={()=>{setPortChangeFlowValue('🡨')}}>🡨</Button>
                    <Button variant="outlined" onClick={()=>{setPortChangeFlowValue('🡪')}}>🡪</Button>
                    <Button variant="outlined" onClick={()=>{setPortChangeFlowValue('🡩')}}>🡩</Button>
                    <Button variant="outlined" onClick={()=>{setPortChangeFlowValue('🡫')}}>🡫</Button>
                    <Button variant="outlined" onClick={()=>{setPortChangeFlowValue('⮂')}}>⮂</Button>
                    <Button variant="outlined" onClick={()=>{setPortChangeFlowValue('⇵')}}>⇵</Button>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => handlePortFlowChange(
                        setChangePortFlowDialog,
                        changePortFlowNode,
                        sharedNodes,
                        changePortFlowValue
                    )}>Apply</Button>
                    </DialogActions>
                </Dialog>
            </div>
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
                        <Tooltip title='Import diagram' placement='right'>
                            <IconButton onClick={clearData}>
                                <FileDownloadIcon fontSize='large' color='primary' />
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
export const padding = 30;
