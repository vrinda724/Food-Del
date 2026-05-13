



import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order from frontend
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    // ✅ Safety check (cart empty)
    if (!req.body.items || req.body.items.length === 0) {
      return res.json({ success: false, message: "Cart is empty" });
    }

    // ✅ userId fix (token middleware se aana chahiye)
    const userId = req.body.userId || req.userId;

    if (!userId) {
      return res.json({ success: false, message: "User not authenticated" });
    }

    // ✅ Create new order
    const newOrder = new orderModel({
      userId: userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    await newOrder.save();

    // ✅ Clear cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // ✅ Stripe line items (FIXED)
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // ❌ removed *80
      },
      quantity: item.quantity,
    }));

    // ✅ Delivery charges
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    // ✅ Create Stripe session
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    // ✅ Send response
    res.json({
      success: true,
      session_url: session.url,
    });

  } catch (error) {
    console.log("STRIPE ERROR:", error);
    res.json({ success: false, message: "Error creating order" });
  }
};

const verifyOrder = async (req,res) => {
  const {orderId,success} = req.body;
  try{
    if(success=="true") {
      await orderModel.findByIdAndUpdate(orderId,{payment:true});
      res.json({success:true,message:"Paid"})
    }
    else{
      await orderModel.findByIdAndDelete(orderId);
      res.json({success:false,message:"Not Paid"})
    }
  }
  catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

// user orders for frontend
const userOrders= async (req,res) =>{
  try{
    const orders = await orderModel.find({userId:req.userId})
    res.json({success:true,data:orders})
  }
  catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

// Listing orders for admin panel
const listOrders = async(req,res) => {
  try{
    const orders = await orderModel.find({});
    res.json({success:true,data:orders})
  }
  catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

// api for updating order status
const updateStatus = async (req,res) =>{
  try{
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
    res.json({success:true,message:"Status updated"})
  }
  catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}


export { placeOrder,verifyOrder,userOrders,listOrders,updateStatus };