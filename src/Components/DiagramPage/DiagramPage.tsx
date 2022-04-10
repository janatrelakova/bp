import * as React from 'react';
import './DiagramPage.css';
import { useParams } from 'react-router-dom';
import NotFound from '../NotFound';
import DiagramComponent from './DiagramComponent';

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
            <DiagramComponent room={id} />
        </div>
    );
}

export default DiagramPage;