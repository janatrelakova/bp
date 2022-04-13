import { Grid } from '@mui/material';
import * as React from 'react';
import { IDiagram, useGetDiagrams } from '../../api/useGetDiagrams';
import DiagramIcon from './Diagram/DiagramIcon';
import './DiagramsGrid.css';

const DiagramsGrid = () => {
    //const diagrams = ['aadsfa', 'adfab', 'cafadf', 'dafadf', 'e', 'adfafa', 'b', 'cadfa', 'd', 'e', 'a', 'b', 'c', 'd', 'e'];
    const i = useGetDiagrams('5461aa1b-7238-4cc7-bc20-eb5314f490b6');
    const diagrams: IDiagram[] = [];

    if (i == null) {
        return (<span>LOADING</span>);
    } else {
        i.map((d: IDiagram) => diagrams.push(d));

    }

    return (
        <div className="diagrid">
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {diagrams.map((item, index) => (
                    <div key={index}>
                        <DiagramIcon room={item.room} id={item.room} />
                    </div>
                ))}
            </Grid>
        </div>
    )
}

export default DiagramsGrid;