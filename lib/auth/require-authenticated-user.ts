import {redirect} from "next/navigation";
import { getCurrentAppUser } from "./get-current-app-user";

export async function requireAuthenticatedUser() {
    const user = await getCurrentAppUser();

    

    if(!user){
        redirect("/auth/sign-in");
    }

    return user;
}