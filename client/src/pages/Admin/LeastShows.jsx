import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/Admina/Title";
import { dummyShowsData } from "../../assets/assets";
import { dateFormat } from "../../lib/dateFormat";

const LeastShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      setShows([
        {
          movie: dummyShowsData[0],
          showDateTime: "2025-06-30T02:30:00.000Z",
          showPrice: 59,
          occupiedSeats: {
            A1: "user_1",
            B1: "user_2",
            C1: "user_3",
          },
        },
      ]);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllShows();
  }, []);
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
                <td className="p-2 min-w-45 pl-5">{show.showDateTime}</td>
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
