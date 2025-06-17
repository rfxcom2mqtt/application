import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { WsMessage } from '../../models/shared';

interface MessagesInputProps {
    socket: Socket;
}

const NewMessage = (props: MessagesInputProps) => {
    const socket = props.socket;
    const [value, setValue] = useState('');
    const submitForm = (e: any) => {
        e.preventDefault();
        socket.emit('message', value);
        setValue('');
    };

    return (
        <form onSubmit={submitForm}>
            <input
                autoFocus
                value={value}
                placeholder="Type your message"
                onChange={(e) => {
                    setValue(e.currentTarget.value);
                }}
            />
        </form>
    );
};

export default NewMessage;
