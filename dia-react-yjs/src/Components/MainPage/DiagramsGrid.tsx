import { Avatar, Grid } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import * as React from 'react';
import { IDiagram, useGetDiagrams } from '../../api/useGetDiagrams';
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

    
    console.log(i);
    return (
        <div className="diagrid">
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {diagrams.map((item, index) => (
                    <Grid item xs={1} sm={2} md={3} key={index}>
                        <div className="diagrid__item">
                            <Avatar 
                                sx={{ bgcolor: '#1e88e5', width: 64, height: 64 }}
                                alt="ahoj"
                                >
                                {item.room.charAt(0).toLocaleUpperCase()}
                            </Avatar>
                            <span>{item.room}</span>
                            </div>
                    </Grid>
                ))}
            </Grid>
        </div>
    )
}

export default DiagramsGrid;