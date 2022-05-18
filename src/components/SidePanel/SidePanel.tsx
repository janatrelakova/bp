import AddCircleIcon from '@mui/icons-material/AddCircle';

import * as React from 'react';
import AddDiagramComponent from './AddDiagramComponent';
import AddExistingDiagram from './AddExistingDiagram';
import './SidePanel.css';

const AddDiagramPanel = () => {
    return (
        <div className="panel">
            <AddCircleIcon color='disabled' fontSize="large" />
            <AddDiagramComponent />
            <AddExistingDiagram />
        </div>
    )
}

export default AddDiagramPanel;