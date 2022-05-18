import {useEffect, useState} from 'react';


export interface IDiagram {
    id: number,
    room: string,
}

export const useGetDiagrams = (id: string) : IDiagram[] => {
    const [initialState, setInitialState] = useState<IDiagram[]>();

    useEffect(() => {
        async function getDiagramsByUser(id: string) {
            const request = await fetch(`/DiagramsPage/diagrams?userId=${id}`);
            const data = await request.json().catch(() => {});
            setInitialState(data);
        }
        getDiagramsByUser(id);
    }, [id]);

    return initialState ?? [];

}