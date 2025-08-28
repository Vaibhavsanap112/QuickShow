import React, { useState } from "react";
import Navbar from "./components/Navbar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBooking from "./pages/MyBooking";
import Favourite from "./pages/Favourite";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import toast, { Toaster } from "react-hot-toast";
import Layout from "./pages/Admin/Layout";
import DashBoard from "./pages/Admin/DashBoard";
import AddShows from "./pages/Admin/AddShows";
import ListBooking from "./pages/Admin/ListBooking";
import ListShows from "./pages/Admin/LeastShows";
import { useAppContext } from "./context/AppContext";
import { SignIn } from "@clerk/clerk-react";
import Loading from "./components/Loading";
import ProtectedRoute from "./Route/ProetectedRoute";

function App() {
  const IsAdminRoute = useLocation().pathname.startsWith("/admin");
  const { user, isAdmin, loading } = useAppContext();

  if (loading) {
    return <Loading></Loading>;
  }

  console.log(user);

  return (
    <>
      <Toaster />
      {!IsAdminRoute && <Navbar></Navbar>}

      <Routes>
        <Route path="/" element={<Home></Home>}></Route>
        <Route path="/movies" element={<Movies></Movies>}></Route>
        <Route
          path="/movies/:id"
          element={<MovieDetails></MovieDetails>}
        ></Route>
        <Route
          path="/movies/:id/:date"
          element={<SeatLayout></SeatLayout>}
        ></Route>
        <Route path="/my-bookings" element={<MyBooking></MyBooking>}></Route>
            <Route path="/loading/:nextUrl" element={<Loading></Loading>}></Route>
        <Route path="/favourite" element={<Favourite></Favourite>}></Route>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute user={user} isAdmin={isAdmin}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashBoard></DashBoard>}></Route>
          <Route path="add-shows" element={<AddShows></AddShows>}></Route>
          <Route path="list-shows" element={<ListShows></ListShows>}></Route>
          <Route
            path="list-bookings"
            element={<ListBooking></ListBooking>}
          ></Route>
        </Route>
      </Routes>
      {!IsAdminRoute && <Footer />}
    </>
  );
}

export default App;
