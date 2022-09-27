import create from "zustand";

interface NoteWindowState {
  name: string;
  content: string;
  previewWidth: number;
  dirtyName: boolean;
  dirtyContent: boolean;
  saveNameHandler: (name: string) => void;
  saveContentHandler: (content: string) => void;
}

export const useNoteWindowStore = create<NoteWindowState>(() => ({
  id: "",
  name: "",
  content: "",
  previewWidth: 0,
  dirtyName: false,
  dirtyContent: false,
  saveNameHandler() {},
  saveContentHandler() {},
}));
