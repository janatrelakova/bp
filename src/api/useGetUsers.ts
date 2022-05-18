import {useEffect, useState} from 'react';


export interface IUser {
    id: string,
    name: string,
}

export const useGetUsers = () : IUser[] => {
    const [initialState, setInitialState] = useState<IUser[]>();

    useEffect(() => {
        async function getUsers() {
            const request = await fetch(`UsersPage/users`);
            const data = await request.json().catch(() => {});
            setInitialState(data);
        }
        getUsers();
    }, []);

    return initialState ?? [];

}