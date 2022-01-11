import React, { useReducer } from "react";
import axios from "axios";
import { FirebaseContext } from "./firebaseContext";
import { auth } from "../../index";
import firebaseReduser from "./firebaseReduser";
import {
  addAction,
  editAction,
  editCompleteAction,
  fetchAction,
  loaderAction,
  removeAction,
} from "../../utils/actions";

const url = process.env.REACT_APP_DB_URL;

const FirebaseState = ({ children }) => {
  const initialState = {
    tasks: [],
    loading: false,
  };

  const [state, dispatch] = useReducer(firebaseReduser, initialState);

  const showLoader = () => dispatch(loaderAction());

  const fetchTasks = async (date) => {
    showLoader();
    const { uid } = auth.currentUser;
    const res = await axios.get(`${url}/tasks/${uid}.json`);
    try {
      if (res.data) {
        let payload = Object.keys(res.data).map((key) => ({
          ...res.data[key],
          id: key,
        }));
        payload = payload.filter((task) => task.date === date);
        dispatch(fetchAction(payload));
      }
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const fetchForDots = async (date) => {
    const { uid } = auth.currentUser;
    let res = await axios.get(`${url}/tasks/${uid}.json`);
    if (res.data) {
      res = Object.keys(res.data).map((key) => ({
        ...res.data[key],
        id: key,
      }));
      return res
        .filter((task) => task.date === date)
        .map((item) => item.complete);
    }
  };

  const addTasks = async (title, desc, date, complete) => {
    const { uid } = auth.currentUser;
    const task = {
      title,
      desc,
      date,
      complete,
    };
    try {
      const res = await axios.post(`${url}/tasks/${uid}.json`, task);
      const payload = {
        ...task,
        id: res.data.name,
      };
      dispatch(addAction(payload));
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const editTask = async (id, title, desc) => {
    const { uid } = auth.currentUser;
    const task = {
      title,
      desc,
    };
    try {
      const res = await axios.patch(`${url}/tasks/${uid}/${id}.json`, task);
      const payload = {
        ...task,
        id: res.data.name,
      };
      dispatch(editAction(payload));
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const editComletedTask = async (id, complete) => {
    const { uid } = auth.currentUser;
    const task = { complete };
    try {
      await axios.patch(`${url}/tasks/${uid}/${id}.json`, task);
      const payload = { ...task };
      dispatch(editCompleteAction(payload));
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const getCompleted = async (id) => {
    const { uid } = auth.currentUser;
    const res = await axios.get(`${url}/tasks/${uid}/${id}.json`);
    if (res.data) {
      return res.data.complete;
    }
  };

  const removeTasks = async (id) => {
    const { uid } = auth.currentUser;
    await axios.delete(`${url}/tasks/${uid}/${id}.json`);
    dispatch(removeAction(id));
  };

  return (
    <FirebaseContext.Provider
      value={{
        showLoader,
        addTasks,
        fetchTasks,
        removeTasks,
        editTask,
        editComletedTask,
        getCompleted,
        fetchForDots,
        loading: state.loading,
        tasks: state.tasks,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseState;
