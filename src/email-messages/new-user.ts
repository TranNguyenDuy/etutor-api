import { User } from "../entity/User.entity";
import { AppConfigs } from "../configs";

export const newUserMessage = (user: User) => {
    return {
        to: user.email,
        subject: 'Your account has been created',
        text: `Your account has been created. Please signin at ${AppConfigs.CLIENT_ORIGIN}/#/login with your email address: '${user.email}' and password: '${user.password}'`,
        html: `<p>Your account has been created. Please signin at <b>${AppConfigs.CLIENT_ORIGIN}/#/login</b> with your email address: <b>${user.email}</b> and password: <b>${user.password}</b></p>`
    }
}