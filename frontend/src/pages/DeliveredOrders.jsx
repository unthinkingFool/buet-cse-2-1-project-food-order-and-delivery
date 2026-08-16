import React from 'react'
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DeliveredOrders() {
    {/** show all the previously delivered orders of the rider */}
    const navigate=useNavigate()
  return (
    <div>
      <div>
        {/* Back */}
        <div
          onClick={() => {
            navigate("/");
          }}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[#FF5A36] transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </div>
        <h1>Your Delivered Orders</h1>
      </div>
    </div>
  )
}

export default DeliveredOrders
