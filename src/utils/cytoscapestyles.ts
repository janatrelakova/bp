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
            'border-color': 'black',
            'width': 'data(width)',
            'height': 'data(height)',
            'padding': '10',
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
