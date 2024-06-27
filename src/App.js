import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Login from "./components/auth/login/index";
import Register from "./components/auth/register/index";
import Header from "./components/header/index";
import Home from "./components/home/index";
import Board from "./components/Board";
import TaskList from "./components/TaskList";
import { AuthProvider } from "./contexts/authContext";

function App() {
  return (
    <AuthProvider>
        <Header />
        <div className="w-full h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/board/:id" element={<Board />} />
            <Route path="/tasks/:id" element={<TaskList />} />
          </Routes>
        </div>
    </AuthProvider>
  );
}

export default App;
