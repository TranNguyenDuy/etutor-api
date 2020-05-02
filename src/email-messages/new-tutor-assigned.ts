import { User } from "../entity/User.entity";

export const newTutorAssigned = (user: User, tutor: User) => {
    return {
        to: user.email,
        subject: 'New Tutor assigned to you',
        text: `Tutor: '${tutor.firstName} ${tutor.lastName}' assigned to you`,
        html: `Tutor: <b>${tutor.firstName} ${tutor.lastName}</b> assigned to you`
    };
};