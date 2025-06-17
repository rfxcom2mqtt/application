import React, { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { WsMessage } from '../../models/shared';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { DataGrid, GridColDef, GridToolbar, DataGridProps, GridRenderCellParams } from '@mui/x-data-grid';
import Stack from '@mui/material/Stack';
import GridCellExpand from './GridCellExpand';
import CustomNoRowsOverlay from './CustomNoRowsOverlay';

interface MessagesProps {
    socket: Socket;
}

function Messages(props: MessagesProps) {
    const socket = props.socket;
    const [messages, setMessages] = useState<{ [s: string]: WsMessage }>({});

    useEffect(() => {
        const messageListener = (message: WsMessage) => {
            setMessages((prevMessages: { [s: string]: WsMessage }) => {
                const newMessages: { [s: string]: WsMessage } = { ...prevMessages };
                newMessages[message.id] = message;
                return newMessages;
            });
        };

        socket.on('log', messageListener);
        return () => {
            socket.off('log', messageListener);
        };
    }, [socket]);

    const clearLogs = () => {
        setMessages({});
    };

    const getLogs = () => {
        socket.emit('getAllLogs');
    };

    function renderCellExpand(params: GridRenderCellParams<any, string>) {
        return <GridCellExpand value={params.value || ''} width={params.colDef.computedWidth} />;
    }

    const pageSize = 10;
    const columns: GridColDef[] = [
        {
            field: 'level',
            headerName: 'Level',
            width: 100,
            editable: false,
            renderCell: (params: GridRenderCellParams<any, string>) => (
                <Chip label={params.value} color={levelColor(params.value!!)} size="small" />
            ),
        },
        {
            field: 'time',
            headerName: 'Time',
            width: 200,
            editable: false,
        },
        {
            field: 'label',
            headerName: 'Label',
            width: 150,
            editable: false,
        },
        {
            field: 'value',
            headerName: 'Log',
            width: 1000,
            editable: false,
            renderCell: renderCellExpand,
        },
    ];

    const levelColor = (
        level: string,
    ): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        if (level === 'DEBUG') return 'primary';
        if (level === 'INFO') return 'info';
        if (level === 'WARN') return 'warning';
        if (level === 'ERROR') return 'error';
        return 'primary';
    };

    return (
        <>
            <Box component="span">
                <DataGrid
                    autoHeight
                    rows={Object.values(messages)}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: pageSize,
                            },
                        },
                        sorting: {
                            sortModel: [{ field: 'time', sort: 'desc' }],
                        },
                    }}
                    pageSizeOptions={[pageSize]}
                    disableColumnSelector
                    disableDensitySelector
                    disableRowSelectionOnClick
                    slots={{ toolbar: GridToolbar, noRowsOverlay: CustomNoRowsOverlay }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }}
                    sx={{ '--DataGrid-overlayHeight': '300px' }}
                />
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button onClick={clearLogs}>Clear</Button>
                    <Button onClick={getLogs}>Get All</Button>
                </Stack>
            </Box>
        </>
    );
}

export default Messages;
