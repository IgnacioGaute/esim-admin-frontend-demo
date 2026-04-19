import { fetchApiHelper } from "@/shared/helpers/fetchApiHelper";
import { ISignInRespSuccess } from "../interfaces/sign-in.interface";
import { TypeSignUpData } from "../interfaces/sign-up.interface";

class SignUpService {

    url: string = "/auth/sign-up";

    onSignUp = async(data: TypeSignUpData) : Promise<{ok: boolean, data?: ISignInRespSuccess, msgErr?: string}> => {
        const { ok, data: dataResp, error, message } = await fetchApiHelper<ISignInRespSuccess, TypeSignUpData>(this.url, 'POST', { data });

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

export const signUpService = new SignUpService();