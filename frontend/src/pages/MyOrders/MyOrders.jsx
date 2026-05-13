// import React from 'react'
// import './MyOrders.css'
// import { useContext } from 'react';
// import { StoreContext } from '../../context/StoreContext';
// import axios from 'axios';
// import { useEffect,useState } from 'react';
// const MyOrders = () => {

//     const {url,token} = useContext(StoreContext);
//     const [data,setData] = useState([]);

//      const fetchOrders = async () =>{
//         const response = await axios.post(url+"/api/order/userorders",{},{headers:{token}});
//         setData(response.data.data);
//         console.log(response.data.data);
//      }

//      useEffect(()=>{
//         if(token){
//             fetchOrders();
//         }
//      },[token])


//   return (
//     <div>
      
      
//     </div>
//   )
// }

// export default MyOrders


import React, { useEffect, useState, useContext } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/assets";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token } }
      );

      console.log("FULL RESPONSE:", response.data);

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.log("ERROR:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
    <div className="container">
        {data.map((orders,index)=>{
            return (
                <div key={index}className='my-orders-order'>
                    <img src={assets.parcel_icon} alt="" />
                    <p>{orders.items.map((item,index)=>{
                        if(index===orders.items.length-1){
                            return item.name+" x "+item.quantity
                        }
                        else{
                            return item.name+" x "+item.quantity+", ";
                        }
                    })}</p>
                    <p>${orders.amount}.00</p>
                    <p>Items: {orders.items.length}</p>
                    <p><span>&#x25cf;</span><b>{orders.status}</b></p>
                    <button onClick={fetchOrders}>Track Order</button>
                </div>
            )
        })}
    </div>
      
    </div>
  );
};

export default MyOrders;
