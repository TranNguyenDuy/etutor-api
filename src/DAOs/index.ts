import { DbContext } from "../database";
import { Comment } from "../entity/Comment.entity";
import { Conversation } from "../entity/Conversation.entity";
import { File } from "../entity/File.entity";
import { Meeting } from "../entity/Meeting.entity";
import { MeetingParticipant } from "../entity/MeetingParticipant.entity";
import { Message } from "../entity/Message.entity";
import { Post } from "../entity/Post.entity";
import { User } from "../entity/User.entity";

export class DAO {
  static get users() {
    return DbContext.getConnection().getRepository(User);
  }

  static get conversations() {
    return DbContext.getConnection().getRepository(Conversation);
  }

  static get messages() {
    return DbContext.getConnection().getRepository(Message);
  }

  static get files() {
    return DbContext.getConnection().getRepository(File);
  }

  static get meetings() {
    return DbContext.getConnection().getRepository(Meeting);
  }

  static get meetingParticipants() {
    return DbContext.getConnection().getRepository(MeetingParticipant);
  }

  static get posts() {
    return DbContext.getConnection().getRepository(Post);
  }

  static get comments() {
    return DbContext.getConnection().getRepository(Comment);
  }
}
