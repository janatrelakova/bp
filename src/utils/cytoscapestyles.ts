import { Stylesheet } from "cytoscape";

export const cytoscapestyles = [
    // cytoscape elements
    {
        selector: 'node[label]',
        style: {
            'content': 'data(label)',
            'border-width': '2px',
            'background-color': 'white',
            'width': '70px',
            'height': '45 px',
            'text-valign': 'center',
            'taxi-direction': 'vertical',
        }
    },
    {
        selector: 'node',
        style: {
            'shape': 'rectangle',
            'border-color': 'black',
            'width': 'data(width)',
            'height': 'data(height)',
            'padding': 0,
        }
    },
    {
        selector: 'node:selected',
        style: {
            'border-color': '#1E90FF',
            'border-width': '3 px',
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
