import type { JSX } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/header";
import NavBar from "./components/Navbar/navbar";
import Footer from "./components/Footer/footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPag from "./pages/LoginPag";
import Register from "./pages/Register";
import TasksPage from "./pages/TasksPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App(): JSX.Element {

  return (
    <>
      <Header />
      <Routes>
        <Route element={<NavBar />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPag />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
