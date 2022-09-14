export const saveNote = (text: string) => {
  return localStorage.setItem("__mnote", text);
}

export const loadNote = () => {
  return localStorage.getItem("__mnote") ?? "";
}
