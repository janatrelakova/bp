import { Avatar, Grid } from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './DiagramIcon.css';

type DiagramIconProps = {
    room: string;
    id: string;
}

const DiagramIcon = ({
    room,
    id,
} : DiagramIconProps) => {
    return (
        <div className="diagram-container">
            <Link to={`/diagram/${id}`}>
                <Grid item>
                    <div className="diagrid__item">
                        <Avatar 
                            sx={{ bgcolor: '#1e88e5', width: 64, height: 64 }}
                            alt="ahoj"
                            >
                            {room.charAt(0).toLocaleUpperCase()}
                        </Avatar>
                        <span>{room}</span>
                    </div>
                </Grid>            
            </Link>
        </div>
    );
};

export default DiagramIcon;