import React, { useState } from 'react';
import TextField, { StandardTextFieldProps } from '@mui/material/TextField';
import { InputProps as StandardInputProps } from '@mui/material/Input';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

/**
 * Extend properties
 */
export interface PasswordProps extends StandardTextFieldProps {
    InputProps?: Partial<StandardInputProps>;
}

/**
 * Password input
 * @param props Properties
 */
const PasswordField: React.FunctionComponent<PasswordProps> = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    function handleClickShowPassword() {
        setShowPassword(!showPassword);
    }

    return (
        <TextField
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            {...props}
            InputProps={{
                spellCheck: false,
                endAdornment: (
                    <InputAdornment position="start">
                        <IconButton
                            id={`password-show`}
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        >
            {props.children}
        </TextField>
    );
};

export default PasswordField;
