import { Session } from "next-auth";

const PREFIX = "__mnote_";

export const saveNoteContent = (text: string) => {
  return localStorage.setItem(`${PREFIX}unauth_file_content`, text);
};

export const loadNoteContent = (session: Session | null) => {
  if(session) return ''
  return localStorage.getItem(`${PREFIX}unauth_file_content`) ?? "";
};

export const saveNoteName = (name: string) => {
  return localStorage.setItem(`${PREFIX}unauth_file_name`, name);
};

export const loadNoteName = (session: Session | null) => {
  if(session) return ''
  return localStorage.getItem(`${PREFIX}unauth_file_name`) ?? "";
};
