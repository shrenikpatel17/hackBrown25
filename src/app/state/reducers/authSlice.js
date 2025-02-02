"use client";

import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  mode: "light",
  user: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    courses: [],
  },
  token: "",
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        stories: [],
        points: 0,
      };
      state.token = "";
    },
    addStoryToUser: (state, action) => {
      state.user.stories.push(action.payload);
    },
    incrementPoints: (state) => {
      state.user.points += 10;
    },
    decrementPoints: (state) => {
      state.user.points -= 5; 
    }
  },
});

export const authActions = authSlice.actions;

export default authSlice.reducer;
