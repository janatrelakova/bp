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
            'padding': 30,
        }
    },
    {
        selector: 'node[type = "portLabel"]',
        style: {
            'shape': 'rectangle',
            'border-color': 'white',
            'width': 'data(width)',
            'height': 'data(height)',
            'padding': 30,
        }
    },
    {
        selector: 'node[type = "port"]',
        style: {
            'shape': 'rectangle',
            'font-size': '30px',
            'width': 'data(width)',
            'height': 'data(height)',
            'padding': 30,
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
            'curve-style': 'taxi',
            'taxi-direction': 'horizontal',
        }
    },

] as Stylesheet[];
