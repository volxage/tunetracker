import { ReactNode, createContext } from "react";
export type header_focus_t = [component: ReactNode | null, focusFunc: Function, focusDescription: string, setFocusDescription: Function]
export default createContext([null, () => {}, "", () => {}] as header_focus_t);
