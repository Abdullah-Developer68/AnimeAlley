import assets from "../assets/asset";
import Navbar from "../components/Global/Navbar";
import Footer from "../components/Global/Footer";

const UserHistory = () => {
  // Sample history data for UI demonstration
  const purchaseHistory = [
    {
      orderId: "ORD001",
      date: "2024-02-22",
      items: [
        {
          name: "Naruto Manga Vol. 1",
          image: assets.sao,
          price: 599,
          quantity: 2,
        },
      ],
      total: 1198,
      status: "Delivered",
    },
  ];

  return (
    <>
      <div className="flex flex-col">
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0b0133] to-[#1a0266]">
          <div className="container mx-auto px-4 py-20">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-white/90 mb-2">
                Purchase History
              </h1>
              <p className="text-white/60 text-sm">
                View all your previous orders and their details
              </p>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
              {purchaseHistory.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-pink-500/30 transition-colors"
                >
                  {/* Order Header */}
                  <div className="p-4 md:p-6 border-b border-white/10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-white/60 text-sm mb-1">Order ID</p>
                        <p className="text-white font-medium">
                          {order.orderId}
                        </p>
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Date</p>
                        <p className="text-white font-medium">{order.date}</p>
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-green-500/20 to-green-500/10 text-green-400">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 md:p-6">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4 border-b border-white/10 last:border-0"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-grow">
                          <h3 className="text-white/90 font-medium mb-1">
                            {item.name}
                          </h3>
                          <p className="text-white/60 text-sm">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/90 font-medium">
                            ₹{item.price * item.quantity}
                          </p>
                          <p className="text-white/60 text-sm">
                            ₹{item.price} per item
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Order Total */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                      <span className="text-white/90 font-medium">
                        Total Amount
                      </span>
                      <span className="text-lg font-bold text-pink-500">
                        ₹{order.total}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserHistory;
