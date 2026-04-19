import styled from '@emotion/styled';
import { Stack } from '@mui/material';

export const StyledCard = styled(({ ...otherProps }) => <Stack {...otherProps} />)`
    //flex-direction: row;
    border: 1px solid #d4d4d4;
    width: '100%';
    miHeight: 120px;
    padding: 15px 12px 12px 12px;
    border-radius: 10px;
    justify-content: space-between;
    background-color: ${props => (props.selected ? '#dcebfb;' : '')}
    border-color: ${props => (props.selected ? '#1976d2;' : '')}
    gap: 15px;

    :hover {
    border: 1px solid #000;
    cursor: pointer;
    background-color: #dcebfb;
    border: 1px solid #1976d2;
    }
`;