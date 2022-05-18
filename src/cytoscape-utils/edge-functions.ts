import { v4 as uuidv4 } from 'uuid';
import * as y from 'yjs';
import { EdgeObject } from "../interfaces/edge";
import { cy } from '../components/DiagramPage/DiagramCanvas';
import { NodeSingular } from "cytoscape";
import { NodeObject, NodeType } from '../interfaces/node';
import { PortData } from '../interfaces/port';


//global endpoints, set or unset by following functions
let sourceNode: NodeSingular | null = null;
let targetNode: NodeSingular | null = null;

export const edgeCreateStart = (eh: any, evt: Event) => {
    /*
    const sourceNodeObject = evt.target as unknown as NodeObject;
    if (sourceNodeObject.data.type !== NodeType.port) {
        eh.stop();
        return;
    };
*/
    sourceNode = evt.target as unknown as NodeSingular;
    sourceNode?.addClass('eh-source');
    eh.start(sourceNode);
  };

export const edgeCreateStop = (eh: any, sharedEdges: y.Map<EdgeObject>) => {
    const id = uuidv4();
    eh.stop();
    if (sourceNode === null || targetNode === null || sourceNode === targetNode) {
        sourceNode = null;
        targetNode = null;
        return;
    }

    const t = targetNode as unknown as NodeSingular;
    const targetData = t.data();
    if (targetData.type != NodeType.port) {
        sourceNode = null;
        targetNode = null;
        return;
    }


    if (sourceNode.edges().length > 0) {
        return;
    }   
    
    
    const portData = targetData as PortData;
    let direction;
    if (portData.situatedOn === 'left' || portData.situatedOn === 'right') {
        direction = 'horizontal';
    } else {
        direction = 'vertical';
    }

    const addedEdge = {
        data: {
            source: sourceNode.id(),
            target: targetNode.id(),
            id: id,
            direction: direction,
        },
    };

    sourceNode = null;
    targetNode = null;
    sharedEdges.set(id, addedEdge);
};

  /**
   * Color element that is dragged over with mouse on while creating an edge.
   * @param evt - Event object
   */
  export const edgeCreateDragOverElement = (evt: any) => {
    targetNode = evt.target;
    const t = targetNode as unknown as NodeSingular;
    if (t.data().type != NodeType.port) {
        return;
    }    
    if (targetNode !== sourceNode) {
      targetNode?.addClass('eh-hover');
    }

  };
  
  /**
   * Reset element fill while the element is not dragged over while creating an edge.
   * @param evt - Event object
   */
  export const edgeCreateDragOutOfElement = (evt: any) => {
    evt.target.removeClass('eh-hover');
    targetNode = null;
  };
  
  /**
   * Validate before creating an edge, if ok display edge type selection modal. 
   * @param callback - Dispatch reducer function
   */
  export const edgeCreateValidate = (callback: Function) => {
    sourceNode?.removeClass('eh-hover');
    targetNode?.removeClass('eh-hover');
    if (sourceNode != null && targetNode != null && sourceNode !== targetNode) {
      callback();
    }
  };
  
  /**
   * Reset after user cancel (closing of edge type selection modal).
   */
  export const edgeCreateCancel = () => {
    targetNode?.removeClass('eh-hover');
    sourceNode = null;
    targetNode = null;
  };
  