import { FindConditions, In } from 'typeorm';
import { DAO } from '../DAOs';
import { User } from '../entity/User.entity';
import { ListQuery } from '../interfaces/list-query';
import { Roles } from '../interfaces/roles';
import { hashString } from '../utils/crypto';

export class UserService {
  async countMyStudents(id: string) {
    try {
      const count = await DAO.users.count({
        where: {
          role: Roles.Student,
          tutor: {
            id
          }
        }
      });
      return count;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async countUsers(role?: Roles) {
    try {
      const count = await DAO.users.count({
        where: {
          role
        }
      });
      return count;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async revokeTutor(studentId) {
    try {
      const student = await DAO.users.findOne(studentId, {
        where: {
          role: Roles.Student,
        },
      });
      if (!student) throw new Error('Cannot find this student.');
      student.tutor = null;
      const result = await student.save();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async assignTutor(studentIds: string[] = [], tutorId: string) {
    try {
      const students = await DAO.users.find({
        where: {
          id: studentIds.length ? In(studentIds) : undefined,
          role: Roles.Student,
        },
      });
      const tutor = await DAO.users.findOne(tutorId, {
        where: {
          id: tutorId,
          role: Roles.Tutor,
        },
      });
      if (!tutor) throw new Error('Cannot find this tutor');
      students.forEach(student => {
        student.tutor = tutor;
      });
      const result = await DAO.users.save(students);
      return [result, tutor];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      await DAO.users.delete(id);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      const { email } = data;
      if (email) {
        const existingUserWithEmail = await DAO.users.findOne({
          where: {
            email,
          },
        });
        if (existingUserWithEmail && existingUserWithEmail.id !== id)
          throw new Error(`User with email '${email}' is existing`);
      }
      await DAO.users.save({
        ...data,
        id,
      });
      return id;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserDetails(id, role, relations = []) {
    try {
      const user = await DAO.users.findOne(id, {
        where: { role },
        relations,
      });
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async listUsers(
    where?: FindConditions<User>,
    query: Partial<ListQuery> = new ListQuery(),
    relations: string[] = [],
  ) {
    try {
      let orderBy = {};
      if (query.sortKey && query.sortDirection) {
        orderBy[query.sortKey] = query.sortDirection.toUpperCase();
      } else orderBy = undefined;
      const [users, total] = await DAO.users.findAndCount({
        where,
        relations,
        skip: query.page * query.pageSize,
        take: query.pageSize,
        order: orderBy
      });
      return [users, total];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserByEmailPassword(email: string, password: string, relations: string[] = []) {
    try {
      const hashedPassword = hashString(password);
      const user = await DAO.users.findOne({
        where: {
          email,
          password: hashedPassword,
        },
        relations,
      });
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async createUser(user: Partial<User>) {
    try {
      if (!user.email) throw new Error('User email is required');
      const existingUserWithEmail = await DAO.users.findOne({
        where: {
          email: user.email,
        },
      });
      if (existingUserWithEmail) throw new Error(`User with email '${user.email}' is existing`);
      const defaultPassword = process.env.DEFAULT_PASSWORD;
      const password = user.password || defaultPassword;
      user.password = hashString(password);
      const result = DAO.users.create(user);
      await result.save();
      result.password = password;
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUsersByIds(ids: string[], relations: string[] = []) {
    try {
      const users = await DAO.users.findByIds(ids, {
        relations
      });
      return users;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await DAO.users.findOne(id);
      if (!user) throw new Error('User not found');
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
