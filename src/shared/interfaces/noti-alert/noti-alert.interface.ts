import { AlertProps } from "@mui/material";
import { CustomContentProps, OptionsWithExtraProps, VariantType } from "notistack";

interface IAlertGlobal {
    showClose?: boolean;
    propsAlert?: AlertProps;
}

export interface IAlertStackProps extends CustomContentProps, IAlertGlobal {
    
}

export interface ISnackBarAlertOptions extends OptionsWithExtraProps<VariantType>, IAlertGlobal{
    
}