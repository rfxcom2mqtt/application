import React, { useState } from 'react';

import { makeStyles } from '@mui/styles';
import { Button, Dialog, TextField, Typography } from '@mui/material';

const useStyles = makeStyles({
    dialog: {
        width: '500px',
        padding: '40px',
    },
    wrapper: {
        display: 'flex',
        justifyContent: 'space-around',
        width: '100%',
        padding: '20px',
    },
    input: {
        width: '300px',
        margin: '10px',
    },
    buttonWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: '20px',
        '& > *': {
            margin: '0 10px',
        },
    },
});

export type DialogTextfieldState = {
    open: boolean;
    action: (value: string) => void;
    message?: React.ReactNode;
};

export const closedDialogTextfieldState: DialogTextfieldState = {
    open: false,
    action: () => null,
};

interface ConfirmationDialogTextfieldProps {
    open?: boolean;
    onContinue: (value: string) => void;
    onCancel: () => void;
    customMessage?: React.ReactNode;
}

function ConfirmationDialogTextfield({
    open = false,
    onContinue,
    onCancel,
    customMessage,
}: ConfirmationDialogTextfieldProps) {
    const classes = useStyles();

    const [attributeKey, setAttributeKey] = useState<string>('');
    const [attributeValue, setAttributeValue] = useState<string>('');

    function onValueChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAttributeValue(event.target.value);
    }

    function handleContinue() {
        onContinue(attributeValue);
    }

    function handleKeyPress({ key }: React.KeyboardEvent<HTMLDivElement>) {
        if (key === 'Enter') {
            handleContinue();
        }
    }

    function onClose(event: any, reason: string) {
        if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            onCancel();
        }
    }

    const paperProps = {
        classes: {
            root: classes.dialog,
        },
    };

    return (
        <Dialog id="dialog-textfield" open={open} onClose={onClose} PaperProps={paperProps} maxWidth={false}>
            <Typography align={'center'}>{customMessage}</Typography>
            <div className={classes.wrapper}>
                <TextField
                    id="dialog-textfield-input"
                    className={classes.input}
                    variant="outlined"
                    value={attributeValue}
                    onChange={onValueChange}
                    onKeyPress={handleKeyPress}
                />
            </div>
            <div className={classes.buttonWrapper}>
                <Button id="dialog-ok" variant="contained" disabled={!attributeValue} onClick={handleContinue}>
                    <b>Confirm</b>
                </Button>
                <Button id="dialog-cancel" variant="outlined" onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Dialog>
    );
}

export default ConfirmationDialogTextfield;
