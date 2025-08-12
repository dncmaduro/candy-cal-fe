import { createContext, useContext } from "react"
import { GetMeResponse } from "../hooks/models"

export const MeContext = createContext<GetMeResponse | undefined>(undefined)
export const useMe = () => useContext(MeContext)
