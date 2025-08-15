import React, { useEffect, useState } from "react";
import { dummyBookingData } from "../../assets/assets";
import Loading from "../../components/Loading";
import Title from "../../components/Admina/Title";
import { dateFormat } from "../../lib/dateFormat";

const ListBooking = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllBooking = async () => {
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  useEffect(() => {
    getAllBooking();
  }, []);

  return !isLoading ? (
    <>
      <Title text1="List" text2="Bookings"></Title>

      <div className="max-w-4xl mt-6 overflow-x-auto"> 
        <thead>
          <tr className="bg-primary/20 text-left text-white">
            <th className="p-2 font-medium pl-5">User Name</th>
            <th className="p-2 font-medium pl-5">Movie Name</th>
            <th className="p-2 font-medium pl-5">Show Time</th>
            <th className="p-2 font-medium pl-5">Seats</th>
            <th className="p-2 font-medium pl-5">Amount</th>
          </tr>
        </thead>
        <tbody className="text-sm font-light">
          {bookings.map((item,index)=>(
            <tr key={index} className="border-b border-primary/20 bg-primary/5 even:bg-primary/10">

              <td className="p-2 min-w-45 pl-5">{item.user.name}</td>
               <td className="p-2">{item.show.movie.title}</td>
               <td className="p-2">{dateFormat(item.show.showDateTime)}</td>
               <td>{Object.keys(item.bookedSeats).map(seat=> item.bookedSeats[seat]).join(", ")}</td>
               <td className="p-2">{currency}{item.amount}</td>
            </tr>
          ))}






        </tbody>
      </div>
    </>
  ) : (
    <Loading></Loading>
  );
};

export default ListBooking;
