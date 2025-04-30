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
  MapPin, Package, Clock, CalendarIcon, Star, Users, 
  DollarSign, Briefcase, ChevronRight, Loader2, CheckCircle, XCircle, 
  Navigation 
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Order Card component
function OrderCard({ order, isMoverAssigned = false }: { order: Order, isMoverAssigned?: boolean }) {
  const { toast } = useToast();
  
  // Function to update order status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully."
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Function to send mock tracking update
  const sendTrackingUpdateMutation = useMutation({
    mutationFn: async (orderId: number) => {
      // Simulate getting current location from browser
      const mockLocation = {
        latitude: 40.7128 + (Math.random() * 0.1), // Random variation around NYC
        longitude: -74.0060 + (Math.random() * 0.1)
      };
      
      const res = await apiRequest("POST", "/api/tracking", {
        orderId,
        locationData: mockLocation
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Location updated",
        description: "Your current location has been shared with the customer."
      });
    }
  });
  
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
  
  // Get furniture type display text
  const getFurnitureTypeText = (type: string) => {
    switch (type) {
      case "small": return "Small Item (Chair, Desk)";
      case "medium": return "Medium Item (Dining Table)";
      case "large": return "Large Item (Sofa, Bed)";
      case "specialty": return "Specialty Item (Antique, Piano)";
      case "multiple": return "Multiple Items";
      default: return "Furniture";
    }
  };
  
  // Handle accepting a job
  const handleAccept = () => {
    updateOrderMutation.mutate({ id: order.id, status: "accepted" });
  };
  
  // Handle starting a job
  const handleStartJob = () => {
    updateOrderMutation.mutate({ id: order.id, status: "in_progress" });
    // Also send initial location update when starting the job
    sendTrackingUpdateMutation.mutate(order.id);
  };
  
  // Handle completing a job
  const handleCompleteJob = () => {
    updateOrderMutation.mutate({ id: order.id, status: "completed" });
  };
  
  // Get action button based on order status
  const getActionButton = () => {
    if (!isMoverAssigned && order.status === "pending") {
      return (
        <Button
          onClick={handleAccept}
          disabled={updateOrderMutation.isPending}
        >
          {updateOrderMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Accept Job"
          )}
        </Button>
      );
    } else if (order.status === "accepted") {
      return (
        <Button
          onClick={handleStartJob}
          disabled={updateOrderMutation.isPending}
        >
          {updateOrderMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Start Job"
          )}
        </Button>
      );
    } else if (order.status === "in_progress") {
      return (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => sendTrackingUpdateMutation.mutate(order.id)}
            disabled={sendTrackingUpdateMutation.isPending}
          >
            {sendTrackingUpdateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="mr-2 h-4 w-4" />
            )}
            Update Location
          </Button>
          <Button
            onClick={handleCompleteJob}
            disabled={updateOrderMutation.isPending}
          >
            {updateOrderMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Complete Job"
            )}
          </Button>
        </div>
      );
    } else if (order.status === "completed") {
      return (
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span className="text-green-600 font-medium">Job Completed</span>
        </div>
      );
    } else if (order.status === "cancelled") {
      return (
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-600 font-medium">Job Cancelled</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              Move #{order.id} - {getFurnitureTypeText(order.furnitureType)}
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
              <DollarSign className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-500">Earnings</div>
                <div className="text-sm font-semibold text-green-600">${(order.price ? order.price * 0.8 : 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          {order.furnitureDetails && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700">Furniture Details:</p>
              <p className="text-sm text-gray-600">{order.furnitureDetails}</p>
            </div>
          )}
          
          {order.specialInstructions && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm font-medium text-gray-700">Special Instructions:</p>
              <p className="text-sm text-gray-600">{order.specialInstructions}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        {getActionButton()}
        <Button variant="outline" size="sm">
          View Details <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function MoverDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("available");

  const {
    data: moversOrders,
    isLoading: isLoadingMoverOrders,
  } = useQuery<Order[]>({
    queryKey: ["/api/user/orders"],
  });
  
  const {
    data: availableOrders,
    isLoading: isLoadingAvailableOrders,
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  if (!user) {
    return null; // Protected route should handle this
  }

  // Filter orders assigned to this mover
  const myActiveOrders = moversOrders?.filter(
    (order) => order.moverId === user.id && ["accepted", "in_progress"].includes(order.status)
  ) || [];
  
  const myCompletedOrders = moversOrders?.filter(
    (order) => order.moverId === user.id && order.status === "completed"
  ) || [];
  
  // Filter available orders (no mover assigned yet)
  const pendingOrders = availableOrders?.filter(
    (order) => order.status === "pending" && !order.moverId
  ) || [];

  // Calculate earnings
  const totalEarnings = myCompletedOrders.reduce((total, order) => {
    return total + (order.price ? order.price * 0.8 : 0);
  }, 0);
  
  const isLoading = isLoadingMoverOrders || isLoadingAvailableOrders;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mover Dashboard</h1>
            <p className="mt-2 text-gray-600">Find and complete furniture moving jobs</p>
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
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="font-medium">{user.rating?.toFixed(1) || "New"}</span>
                      {user.ratingCount > 0 && (
                        <span className="text-sm text-gray-500 ml-1">
                          ({user.ratingCount} {user.ratingCount === 1 ? "review" : "reviews"})
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Email: {user.email}
                    </p>
                    {user.phone && (
                      <p className="text-sm text-gray-500">
                        Phone: {user.phone}
                      </p>
                    )}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="py-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-gray-600">
                        <Briefcase className="h-5 w-5 mr-2" />
                        <span>Active Jobs</span>
                      </div>
                      <span className="text-lg font-semibold text-primary">{myActiveOrders.length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-gray-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <span>Completed Jobs</span>
                      </div>
                      <span className="text-lg font-semibold text-primary">{myCompletedOrders.length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-5 w-5 mr-2" />
                        <span>Total Earnings</span>
                      </div>
                      <span className="text-lg font-semibold text-green-600">${totalEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="col-span-1 md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Jobs</CardTitle>
                  <CardDescription>Find available jobs and manage your current assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="available">
                        Available Jobs ({pendingOrders.length})
                      </TabsTrigger>
                      <TabsTrigger value="active">
                        My Active Jobs ({myActiveOrders.length})
                      </TabsTrigger>
                      <TabsTrigger value="completed">
                        Completed Jobs ({myCompletedOrders.length})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="available">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : pendingOrders.length > 0 ? (
                        <div className="space-y-4">
                          {pendingOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Package className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No available jobs</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            There are no new jobs available at the moment. Check back later!
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="active">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : myActiveOrders.length > 0 ? (
                        <div className="space-y-4">
                          {myActiveOrders.map((order) => (
                            <OrderCard key={order.id} order={order} isMoverAssigned={true} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Briefcase className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No active jobs</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            You don't have any active jobs. Check the Available Jobs tab to find work.
                          </p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="completed">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : myCompletedOrders.length > 0 ? (
                        <div className="space-y-4">
                          {myCompletedOrders.map((order) => (
                            <OrderCard key={order.id} order={order} isMoverAssigned={true} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No completed jobs</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            You haven't completed any jobs yet. Start by accepting available jobs.
                          </p>
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
