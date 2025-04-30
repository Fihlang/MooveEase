import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order } from "@shared/schema";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Package, Clock, CalendarIcon, Truck, ChevronRight, 
  CreditCard, CheckCircle, XCircle, Loader2, Star 
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

// Define rating component
function RatingStars({ orderId, moverId }: { orderId: number, moverId: number }) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [isRatingOpen, setIsRatingOpen] = useState<boolean>(false);
  
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { orderId: number; moverId: number; rating: number; comment: string }) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      setIsRatingOpen(false);
    }
  });

  return (
    <div>
      {!isRatingOpen ? (
        <Button 
          variant="outline" 
          onClick={() => setIsRatingOpen(true)}
          className="mt-2"
        >
          <Star className="mr-2 h-4 w-4" /> Rate your mover
        </Button>
      ) : (
        <div className="mt-4 p-4 border rounded-md">
          <div className="text-sm font-medium mb-2">Rate your mover:</div>
          <div className="flex mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer ${
                  star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            className="w-full p-2 border rounded-md text-sm mb-3"
            rows={2}
            placeholder="Leave a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsRatingOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={rating === 0 || submitReviewMutation.isPending}
              onClick={() => {
                if (rating > 0) {
                  submitReviewMutation.mutate({
                    orderId,
                    moverId,
                    rating,
                    comment
                  });
                }
              }}
            >
              {submitReviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Order Card component
function OrderCard({ order }: { order: Order }) {
  // Define badge variant and text based on order status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "pending";
      case "accepted": return "info";
      case "in_progress": return "warning";
      case "completed": return "completed";
      case "cancelled": return "cancelled";
      default: return "default";
    }
  };
  
  // Format status text for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Mock payment process mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", "/api/payments", {
        orderId,
        amount: order.price,
        paymentMethod: "credit_card"
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
    }
  });

  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Move #{order.id} - {order.furnitureType === "small" ? "Small Item" : 
                                 order.furnitureType === "medium" ? "Medium Item" : 
                                 order.furnitureType === "large" ? "Large Item" : 
                                 order.furnitureType === "specialty" ? "Specialty Item" : 
                                 order.furnitureType === "multiple" ? "Multiple Items" : "Furniture"} Move
            </CardTitle>
            <CardDescription>
              {order.createdAt ? format(new Date(order.createdAt), 'MMMM d, yyyy') : 'Date unavailable'}
            </CardDescription>
          </div>
          <Badge variant={getBadgeVariant(order.status)}>
            {formatStatus(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Pickup</div>
                <div className="text-sm">{order.pickupAddress}</div>
              </div>
            </div>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Dropoff</div>
                <div className="text-sm">{order.dropoffAddress}</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Moving Date</div>
                <div className="text-sm">
                  {order.pickupDate ? format(new Date(order.pickupDate), 'MMMM d, yyyy') : 'Not scheduled'}
                </div>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Preferred Time</div>
                <div className="text-sm">{order.preferredTime || "Not specified"}</div>
              </div>
            </div>
            <div className="flex items-start">
              <Package className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Price</div>
                <div className="text-sm">${order.price?.toFixed(2) || "TBD"}</div>
              </div>
            </div>
          </div>
          
          {order.status === "completed" && order.moverId && (
            <RatingStars orderId={order.id} moverId={order.moverId} />
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        {(order.status === "completed" && order.paymentStatus !== "completed") ? (
          <Button 
            onClick={() => processPaymentMutation.mutate(order.id)}
            disabled={processPaymentMutation.isPending}
          >
            {processPaymentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Pay Now
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center text-sm">
            {order.paymentStatus === "completed" ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-green-600 font-medium">Payment Complete</span>
              </>
            ) : order.status === "cancelled" ? (
              <>
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-red-600 font-medium">Order Cancelled</span>
              </>
            ) : (
              <>
                <Truck className="h-4 w-4 text-gray-400 mr-2" />
                <span>Status: {formatStatus(order.status)}</span>
              </>
            )}
          </div>
        )}
        
        {/* View details button could link to a detailed order page in a real app */}
        <Button variant="outline" size="sm">
          View Details <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active");

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery<Order[]>({
    queryKey: ["/api/user/orders"],
  });

  if (!user) {
    return null; // Protected route should handle this
  }

  // Filter orders based on active tab
  const activeOrders = orders?.filter(
    (order) => ["pending", "accepted", "in_progress"].includes(order.status)
  ) || [];
  
  const completedOrders = orders?.filter(
    (order) => order.status === "completed"
  ) || [];
  
  const cancelledOrders = orders?.filter(
    (order) => order.status === "cancelled"
  ) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage and track your furniture moves</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="col-span-1">
              <Card>
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl">
                    Welcome, {user.fullName.split(' ')[0]}!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-2">
                    <p className="text-sm text-gray-500">
                      Email: {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-sm text-gray-500">
                        Phone: {user.phone}
                      </p>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="py-2 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-900">Active Orders</div>
                      <div className="text-2xl font-bold text-primary">{activeOrders.length}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Completed Moves</div>
                      <div className="text-2xl font-bold text-primary">{completedOrders.length}</div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href="/booking">
                      <Button className="w-full">Book a New Move</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="col-span-1 md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                  <CardDescription>View and manage your furniture move orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="active">
                        Active ({activeOrders.length})
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        Completed ({completedOrders.length})
                      </TabsTrigger>
                      <TabsTrigger value="cancelled">
                        Cancelled ({cancelledOrders.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : activeOrders.length > 0 ? (
                        <div className="space-y-4">
                          {activeOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No active orders</h3>
                          <p className="mt-1 text-sm text-gray-500">Get started by booking a furniture move.</p>
                          <div className="mt-6">
                            <Link href="/booking">
                              <Button>Book a Move</Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : completedOrders.length > 0 ? (
                        <div className="space-y-4">
                          {completedOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No completed orders</h3>
                          <p className="mt-1 text-sm text-gray-500">Your completed orders will appear here.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="cancelled">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : cancelledOrders.length > 0 ? (
                        <div className="space-y-4">
                          {cancelledOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <XCircle className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No cancelled orders</h3>
                          <p className="mt-1 text-sm text-gray-500">You don't have any cancelled orders.</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
