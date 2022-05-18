import { Grid } from '@mui/material';
import * as React from 'react';
import { IUser, useGetUsers } from '../../api/useGetUsers';
import UserIcon from './User/UserIcon';
import './DiagramsGrid.css';

const UsersGrid = () => {
    const i = useGetUsers();
    const Users: IUser[] = [];

    if (i == null) {
        return (<span>LOADING</span>);
    } else {
        i.map((u: IUser) => Users.push(u));

    }

    return (
        <div className="diagrid">
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                {Users.map((item, index) => (
                    <div key={index}>
                        <UserIcon name={item.name} id={item.id} />
                    </div>
                ))}
            </Grid>
        </div>
    )
}

export default UsersGrid;