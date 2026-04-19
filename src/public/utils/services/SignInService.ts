import { fetchApiHelper  } from "@/shared/helpers";
import { ISignInForm, ISignInRespSuccess } from "../interfaces/sign-in.interface";

class SignInService {

    url: string = "/auth/sign-in";

    onSignIn = async(data: ISignInForm) : Promise<{ok: boolean, data?: ISignInRespSuccess, msgErr?: string}> => {
        const { ok, data: dataResp, error, message} = await fetchApiHelper<ISignInRespSuccess, ISignInForm>(this.url, 'POST', { data });

        if( !ok ){
            let msgErr: string = message;

            if( error ){
                msgErr = error.toMessage();
            }

            return {
                ok: false,
                msgErr: msgErr
            }
        }

        return {
            ok,
            data: dataResp,
        }
    }

}

export const signInService = new SignInService();