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
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MouseIcon from '@mui/icons-material/Mouse';


import { Link } from 'react-router-dom';


var $ = require('jquery');
const contextMenus = require('cytoscape-context-menus');
let automove = require('cytoscape-automove');


(window as any).$ = $;
var konva = require('konva');

cytoscape.use(contextMenus);
cytoscape.use(edgehandles);
cytoscape.use(automove);


contextMenus(cytoscape, $);





let cy: Core;

  
  // the default values of each option are outlined below:
  const defaultEdgeOptions = {
    canConnect: function( sourceNode: any, targetNode: any ){
      // whether an edge can be created between source and target
      return !sourceNode.same(targetNode); // e.g. disallow loops
    },
    hoverDelay: 150, // time spent hovering over a target node before it is considered selected
    snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
    snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
    snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
    noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
    disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
  };
  

type PortData = {
    id: string,
    label: string | null,
    width: number,
    height: number,
    portOf: NodeObject,
    positionOnNode: Position,
}

type NodeData = {
    id: string,
    label: string,
    width: number,
    height: number,
    ports: string[],
}

type NodeObject = {
    data: NodeData | PortData,
    position: Position,
    type: string,
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



    let automoveOptions = {

        nodesMatching: (node: NodeSingular) => getNodePorts(node.id()),
      
        reposition: 'drag',

        when: undefined,

        meanIgnores: function( node: NodeSingular ){ return false; },
      
        meanOnSelfPosition: function( node: NodeSingular ){ return true; },
      
        dragWith: function( node: NodeSingular ){ return true; }
      };
      
    const getNodePorts = (node: string) => {
        const movedNode = sharedNodes.get(node);
        if (movedNode === undefined) {
            console.log('Moved node has not been found in shared nodes.');
            return;
        }
        console.log(movedNode);
        const nodeData = movedNode.data as NodeData;
        console.log(nodeData);

        const portIds: string[] = nodeData.ports.map(p => '#' + p);
        console.log(portIds);

        const portsString = portIds.toString();
        const result = cy.$(portsString);
        console.log(result);
        return result;
    }

    const edgeStartDrawing = (eh: any, evt: Event) => {
        sourceNode = evt.target as unknown as NodeSingular;
        sourceNode?.addClass('eh-source');
        eh.start(sourceNode);
      };
      
      const edgeStopDrawing = (eh: any) => {
        eh.stop();
      };
      
      const edgeDragOver = (evt: any) => {
        if (sourceNode != null) {
          targetNode = evt.target;
          targetNode?.addClass('eh-hover');
        }
      };
      
      const edgeDragOut = (evt: any) => {
        evt.target.removeClass('eh-hover');
        targetNode = null;
      };

      const edgeCheckValidTargets = (callback: Function) => {
        if (sourceNode != null && targetNode != null) {
          callback();
        }
      };
      
          
  const registerEdgeEventHandlers = (cy: Core) => {

    let eh = cy.edgehandles(defaultEdgeOptions);

    cy.on('cxttapstart', 'node', (evt: any) => {
      edgeStartDrawing(eh, evt);
    });

    cy.on('cxttapend', 'node', (evt: any) => {
      edgeStopDrawing(eh);
    });

    cy.on('cxtdragover', 'node', (evt: any) => {
      edgeDragOver(evt);

    });
    cy.on('cxtdragout', 'node', (evt: any) => {
      edgeDragOut(evt);
    });

  };


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
                    addNode(event.position);
                } else {
                    console.log('tap on element');
                    addNodeToParent(event.position, event.target);        
                }
                addNodeStatus.current = false;                    

            } else if (addPortStatus.current) {
                if (event.target.isNode) {
                    console.log(event.target);

                    addPort(event.position, event.target);
                    console.log(event.target.data().ports);
                    const z = sharedNodes.get(event.target.id())?.data as NodeData;
                    console.log(z.ports);
                }
                addPortStatus.current = false;
            }

        });
        
    };

    const registerContextMenu = (
        cy: Core,
        ) => {
        (cy as any).contextMenus({
            menuItems: [
                {
                    id: 'resize',
                    content: 'Resize',
                    tooltip: 'Resize',
                    selector: 'node',
                    onClickFunction: (e: any) => resizeNode(e),
                },
                {
                    id: 'rename',
                    content: 'Rename',
                    tooltip: 'Rename',
                    selector: 'node',
                    onClickFunction: (e: any) => renameNode(e),
                },
            ],
            submenuIndicator: { src: '../arrow.svg', width: 12, height: 12 }
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
        cy.edgehandles(defaultEdgeOptions);
        (cy as any).automove();

        registerEventHandlers(cy, addingNode, addingPort);
        registerContextMenu(cy);
        registerEdgeEventHandlers(cy);

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

            movePorts(movedNode.position, nodeData.ports);

            console.log('moving ports');
        });

        cy.addListener('position', 'node', (e) => {
            console.log('listener for position');
            const node = e.target;
            console.log(node.id());
            if (node.type !== 'node') {
                return;
            }
            const nodeData = node.data as NodeData;
            console.log(nodeData.ports);
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
            movePorts(movedNode.position, nodeData.ports)
            sharedNodes.set(nodeId, movedNode);
         });
        
    }, []);

    const movePorts = (nodePosition: Position, ports: string[]) => {
        ports.map((port) => {
            const portNode = sharedNodes.get(port);
            if (portNode === undefined) {
                return;
            }
            const portData = portNode.data as PortData;
            
            portNode.position.x = nodePosition.x + portData.positionOnNode.x;
            portNode.position.y = nodePosition.y + portData.positionOnNode.y;

            sharedNodes.set(portNode.data.id, portNode);
        });
    };


    const addNodeToParent = (position: Position, parent: any) => {
        const addedNodeId = uuidv4();
        const addedNode = {
            data: {
                id: addedNodeId,
                label: addedNodeId,
                parent: parent.id(),
                width: parent.data().width,
                height: parent.data().height,
                ports: [],
            },
            position: {
                x: position.x,
                y: position.y,
            },                
            type: 'node',
        };
        sharedNodes.set(addedNodeId, addedNode);
    };


    const addNode = (position: Position) => {

        const addedNodeId = uuidv4();
        const min = 50;
        const max = 300;
        const rand = min + Math.random() * (max - min);
        const addedNode = {
            data: {
                id: addedNodeId,
                label: addedNodeId,
                width: nodeWidth,
                height: nodeHeight,
                ports: [],
            },
            position: {
                x: position.x,
                y: position.y,
            },
            type: 'node',
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

    const addPort = (position: Position, targetNode: any) => {
        const portId = uuidv4();
        const addedPort = {
            data: {
                id: portId,
                label: portId,
                width: 20,
                height: 20,
                portOf: targetNode.id(),
                positionOnNode: {
                    x: position.x - targetNode.position().x,
                    y: position.y - targetNode.position().y,
                },
            },
            position: {
                x: position.x,
                y: position.y,
            },                
            type: 'port',
        };

        const nodeToUpdate = sharedNodes.get(targetNode.id());
        if (nodeToUpdate === undefined) {
            console.log("BIG ERROR");
            return;
        };

        const nodeData = nodeToUpdate.data as NodeData;
        nodeData.ports.push(portId);
        sharedNodes.set(nodeData.id, nodeToUpdate);


        sharedNodes.set(portId, addedPort);
    };

    const handleApply = () => {
        setDialogOpen(false);
        if (resizingNode === null) {
            console.log('Something went really wrong.');
            return;
        }
        const resized = sharedNodes.get(resizingNode);
        if (resized === undefined) {
            console.log('Something went really wrong. --- undefined');
            return;
        }

        resized.data.width = nodeWidth;
        resized.data.height = nodeHeight;
        sharedNodes.set(resized.data.id, resized);
    };

    const handleRenameApply = () => {
        setRenameDialogOpen(false);
        if (renamingNode === null) {
            console.log('Something went really wrong.');
            return;
        }
        const renamed = sharedNodes.get(renamingNode);
        if (renamed === undefined) {
            console.log('Something went really wrong. --- undefined');
            return;
        }

        renamed.data.label = nodeName1 + ' : ' + nodeName2;
        sharedNodes.set(renamed.data.id, renamed);
    }

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
          <Button onClick={handleApply}>Apply</Button>
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
    <Button onClick={handleRenameApply}>Apply</Button>
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
                        <IconButton onClick={addEdgeClick}>
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