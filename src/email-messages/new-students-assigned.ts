import { User } from "../entity/User.entity";

export const newStudentsAssigned = (user: User, students: User[]) => {
    return {
        to: user.email,
        subject: 'New Students assigned to you',
        text: `New Students assigned to you: ${students.map(student => `'${student.firstName} ${student.lastName}'`).join(', ')}`,
        html: `New Students assigned to you: ${students.map(student => `<b>${student.firstName} ${student.lastName}</b>`).join(', ')}`
    }
}