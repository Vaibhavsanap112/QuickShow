import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const c = getToken();
  console.log(c);
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    console.log("fetchAdmin called...");
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      setIsAdmin(data.isAdmin);

      // If user is not admin but tries to access admin routes
      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("Not Authorized fsdfhjksfjs");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false); // ✅ always stop loading
    }
  };
  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows); // populate shows state
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error fetching shows:", error);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favorites", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setFavoriteMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    } else {
      setLoading(false); // no user, no need to check admin
    }
  }, [isLoaded, isSignedIn, user]);

  const value = {
    axios,
    isAdmin,
    shows,
    favoriteMovies,
    user,
    loading,
    getToken,
    image_base_url,
    fetchFavoriteMovies,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

const useAppContext = () => useContext(AppContext);

export { AppContext, AppProvider, useAppContext };
