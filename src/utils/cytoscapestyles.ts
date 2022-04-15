import { Stylesheet } from "cytoscape";

export const cytoscapestyles = [
    // cytoscape elements
    {
        selector: 'node[label]',
        style: {
            'content': 'data(MMRef.label)',
            'ghost': 'data(MMRef.essence)',
            'border-style': 'data(MMRef.affiliation)',
            'border-width': '2px',
            'background-color': 'white',
            'width': '70px',
            'height': '45 px',
            'text-valign': 'center',
            'taxi-direction': 'vertical',
            'ghost-offset-x': 3,
            'ghost-offset-y': 3,
            'ghost-opacity': 0.4,
        }
    },
    {
        selector: 'node',
        style: {
            'shape': 'rectangle',
            'border-color': 'green',
            'padding': '100 px',
            'width': 'data(width) px',

        }
    },
 
    {
        selector: 'edge',
        style: {
            'curve-style': 'bezier',
            'arrow-scale': 1.5,
        }
    },

] as Stylesheet[];
