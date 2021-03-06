import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import './AddDiagram.css';

const AddDiagramComponent = () => {
    const [ openDialog, setOpenDialog ] = useState<boolean>(false);
    const [ roomName, setRoomName ] = useState<string>("");
    const { id } = useParams();

    const createDiagram = useCallback(() => {
        fetch("/DiagramsPage/new", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                userId: id,
                room: roomName,
            })
        }).then(() => {
            alert("Created!");
            window.location.href = `/DiagramsPage/diagrams/${id}`;
        }).catch((err) => console.error(err))
    }, [roomName]);


    const handleDiagramCreating = () => {
        setOpenDialog(false);
        createDiagram();
    }

    return (
        <>
            <div>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Enter diagram name</DialogTitle>
            <DialogContent>
                    <TextField
                    id="roomName"
                    label="Name"
                    type="string"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
            />
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleDiagramCreating}>
                    Apply</Button>
            </DialogActions>
            </Dialog>
            </div>
            <div className="holder">
                <Button 
                    variant="contained" 
                    color="primary"
                    size="small"
                    onClick={() => setOpenDialog(true)}>
                        Internal Block Diagram
                </Button>                   
            </div>

        </>
    );
}

export default AddDiagramComponent;