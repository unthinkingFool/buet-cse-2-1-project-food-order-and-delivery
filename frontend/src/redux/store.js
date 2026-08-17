import {configureStore} from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import ownerSlice from "./ownerSlice"
import mapSlice from "./mapSlice"
import riderSlice from "./riderSlice"
export const store= configureStore({
    reducer:{
        user:userSlice,
        owner:ownerSlice,
        map:mapSlice,
        rider: riderSlice,
    }
})