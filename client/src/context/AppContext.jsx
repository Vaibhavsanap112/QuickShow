import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

// 1. Create Context
const AppContext = createContext();

// 2. Create Provider
const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("Yout are not authorized to access admin dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };
  const fetchShows = async () => {
    try {
      const { data } = await axios.get('/api/show/all');
      if(data.success){
        setShows(data.shows)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavoriteMovies = async ()=>{
    try{
      const {data} = await axios.get('/api/user/favorites',{headers: {Authorization:`Bearer ${await getToken()}`}})

      if(data.success){
        setFavoriteMovies(data.movies)
      }
      else{
        toast.error(data.message)
      }

    }catch(error){
      console.log(error)

    }
  }
  useEffect(()=>{
    fetchShows()
  },[])
  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    }
  }, [user]);
  const value = { axios,
    fetchIsAdmin,
    user,
    getToken,
    navigate,
    isAdmin,
    shows,
    favoriteMovies,
    fetchFavoriteMovies,
     };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
// 3. Custom hook
const useAppContext = () => useContext(AppContext);
export { useAppContext, AppProvider, AppContext };
