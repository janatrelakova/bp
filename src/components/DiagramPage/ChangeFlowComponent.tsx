import { DialogTitle, DialogContent, Button, DialogActions } from '@mui/material';
import * as React from 'react';
import { handlePortFlowChange } from '../../utils/ui-functions';
import * as y from 'yjs';
import { NodeObject } from '../../interfaces/node';
import { PortData } from '../../interfaces/port';
import { useState } from 'react';

type ChangeFlowComponentProps = {
    setDialog: (value: React.SetStateAction<boolean>) => void,
    portId: string,
    sharedNodes: y.Map<NodeObject>,

}

const ChangeFlowComponent = ({
        setDialog,
        portId, 
        sharedNodes
}: ChangeFlowComponentProps) => {
    const port = sharedNodes.get(portId);
    const [ portFlow, setPortFlow ] = useState<string>('🡨');


    if (port === undefined) {
        return <></>;
    }

    const portData = port.data as PortData;
    return (
        <>
            <DialogTitle>Choose port flow</DialogTitle>
                <DialogContent>
                    {portData.situatedOn === 'left' || portData.situatedOn === 'right'
                        ? <>
                            <Button variant="outlined" onClick={()=>{setPortFlow('🡨')}}>🡨</Button>
                            <Button variant="outlined" onClick={()=>{setPortFlow('🡪')}}>🡪</Button>
                            <Button variant="outlined" onClick={()=>{setPortFlow('⮂')}}>⮂</Button>
                            </>
                        : <>
                            <Button variant="outlined" onClick={()=>{setPortFlow('🡩')}}>🡩</Button>
                            <Button variant="outlined" onClick={()=>{setPortFlow('🡫')}}>🡫</Button>
                            <Button variant="outlined" onClick={()=>{setPortFlow('⇵')}}>⇵</Button>
                        </>
                    }

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handlePortFlowChange(
                        setDialog,
                        portId,
                        sharedNodes,
                        portFlow
                    )}>Apply</Button>
                
                </DialogActions>
        </>
    );
}

export default ChangeFlowComponent;