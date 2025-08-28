import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/Admina/Title";
import { dummyShowsData } from "../../assets/assets";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";

const LeastShows = () => {
  const {axios , getToken, user} = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {

      const {data} = await axios.get("/api/admin/all-shows",{headers:{
        Authorization : `Bearer ${await getToken()}`
      }})
      setShows(data.shows)
      setLoading(false)
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if(user){
          getAllShows();

    }

  }, [user]);
  return !loading ? (
    <>
      <Title text1="List" text2="Shows"></Title>
      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 font-medium pl-5">Movien Name</th>
              <th className="p-2 font-medium pl-5">Show Time</th>
              <th className="p-2 font-medium pl-5">Total Bookings</th>
              <th className="p-2 font-medium pl-5">Earnings</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light">
            {shows.map((show, index) => (
              <tr
                key={index}
                className="border-b border-primary/10 bg-primary/5 even:bg-primary/10"
              >
                <td className="p-2 min-w-45 pl-5">{show.movie?.title || "Unknown"}</td>
                <td>{dateFormat(show.showDateTime)}</td>
                <td>{Object.keys(show.occupiedSeats).length}</td>
                <td>
                  {currency}{" "}
                  {Object.keys(show.occupiedSeats).length * show.showPrice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading></Loading>
  );
};

export default LeastShows;
