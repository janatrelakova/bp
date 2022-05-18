import * as React from 'react';
import './DiagramPage.css';
import { useParams } from 'react-router-dom';
import NotFound from '../NotFound';
import { Diagram } from './Diagram';

type diagramParams = {
    id: string;
}

const DiagramPage = () => {
    const { id } = useParams<diagramParams>();

    if (id == null) {
        return <NotFound />
    }    

    return (
        <div className="diagram-page">
            <Diagram room={id} />
        </div>
    );
}

export default DiagramPage;