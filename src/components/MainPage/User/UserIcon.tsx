import { Avatar, Grid } from '@mui/material';
import * as React from 'react';
import { Link } from 'react-router-dom';
import './UserIcon.css';

type UserIconProps = {
    name: string;
    id: string;
}

const UserIcon = ({
    name,
    id,
} : UserIconProps) => {
    return (
        <div className="user-container">
            <Link to={`/DiagramsPage/diagrams/${id}`}>
                <Grid item>
                    <div className="diagrid__item">
                        <Avatar 
                            sx={{ bgcolor: '#1e88e5', width: 64, height: 64 }}
                            alt="avatar"
                            >
                            {name.charAt(0).toLocaleUpperCase()}
                        </Avatar>
                        <span>{name}</span>
                    </div>
                </Grid>            
            </Link>
        </div>
    );
};

export default UserIcon;