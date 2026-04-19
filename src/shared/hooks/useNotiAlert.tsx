import { SnackbarMessage, useSnackbar } from 'notistack';
import { ISnackBarAlertOptions } from '../interfaces/noti-alert';


export const useNotiAlert = () => {
    const { enqueueSnackbar } = useSnackbar();

    const snackbar = (msg: SnackbarMessage, options?: ISnackBarAlertOptions) => {
        enqueueSnackbar(msg, options)
    };

    return {
        snackBarAlert: snackbar
    }
}
