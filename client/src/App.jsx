import React from "react";
import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBooking from "./pages/MyBooking";
import Favourite from "./pages/Favourite";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";

function App() {

  const IsAdminRoute = useLocation().pathname.startsWith("/admin");
  return (
    <>
      <Toaster />
      {!IsAdminRoute && <Navbar></Navbar>}

      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/movies" element={<Movies></Movies>}></Route>
        <Route
          path="/movies:id"
          element={<MovieDetails></MovieDetails>}
        ></Route>
        <Route
          path="/movies:id/:date"
          element={<SeatLayout></SeatLayout>}
        ></Route>
        <Route path="/my-booking" element={<MyBooking></MyBooking>}></Route>
        <Route path="/favourite" element={<Favourite></Favourite>}></Route>
      </Routes>
      {!IsAdminRoute && <Footer />}
    </>
  );
}

export default App;
