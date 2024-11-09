import actorsSlice  from "./utils/redux/actorSlice";
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
    reducer: {
        actors: actorsSlice,
    },
});

export default store;