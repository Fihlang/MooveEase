import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order, User, UserRole } from "@shared/schema";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, Package, Clock, CalendarIcon, Star, Users, 
  DollarSign, CheckCircle, Loader2, User as UserIcon, 
  Truck, BarChart3, Activity, CreditCard, Search, UserCheck, UserX 
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function UserRow({ user }: { user: User }) {
  const { toast } = useToast();
  
  // Update user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}`, {
        isActive: !user.isActive
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: `User ${user.isActive ? "deactivated" : "activated"}`,
        description: `${user.fullName} has been ${user.isActive ? "deactivated" : "activated"} successfully.`
      });
    }
  });

  return (
    <TableRow key={user.id}>
      <TableCell className="font-medium">{user.id}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
            <span className="text-primary-700 font-medium text-sm">
              {user.fullName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-medium">{user.fullName}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={user.role === UserRole.CUSTOMER ? "default" : user.role === UserRole.MOVER ? "info" : "warning"}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          {user.rating > 0 ? (
            <>
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span>{user.rating.toFixed(1)}</span>
              <span className="text-xs text-gray-500 ml-1">({user.ratingCount})</span>
            </>
          ) : (
            <span className="text-gray-500">No ratings</span>
          )}
        </div>
      </TableCell>
      <TableCell>{format(new Date(user.createdAt), 'MM/dd/yyyy')}</TableCell>
      <TableCell>
        <Badge variant={user.isActive ? "success" : "cancelled"}>
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <Button 
          variant={user.isActive ? "destructive" : "default"} 
          size="sm"
          onClick={() => toggleUserStatusMutation.mutate(user.id)}
          disabled={toggleUserStatusMutation.isPending}
        >
          {toggleUserStatusMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : user.isActive ? (
            <UserX className="h-4 w-4 mr-1" />
          ) : (
            <UserCheck className="h-4 w-4 mr-1" />
          )}
          {user.isActive ? "Deactivate" : "Activate"}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function OrderRow({ order }: { order: Order }) {
  // Define badge variant based on order status
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

  return (
    <TableRow key={order.id}>
      <TableCell className="font-medium">{order.id}</TableCell>
      <TableCell>
        <div className="max-w-xs truncate" title={order.pickupAddress}>
          {order.pickupAddress}
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs truncate" title={order.dropoffAddress}>
          {order.dropoffAddress}
        </div>
      </TableCell>
      <TableCell>{format(new Date(order.pickupDate), 'MM/dd/yyyy')}</TableCell>
      <TableCell>${order.price?.toFixed(2) || "0.00"}</TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(order.status)}>
          {formatStatus(order.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={order.paymentStatus === "completed" ? "success" : "pending"}>
          {order.paymentStatus === "completed" ? "Paid" : "Pending"}
        </Badge>
      </TableCell>
      <TableCell>
        <Button variant="outline" size="sm">View</Button>
      </TableCell>
    </TableRow>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all orders
  const {
    data: orders,
    isLoading: isLoadingOrders,
  } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch users (customers and movers)
  const {
    data: customers,
    isLoading: isLoadingCustomers,
  } = useQuery<User[]>({
    queryKey: ["/api/users/customers"],
    queryFn: async () => {
      const res = await fetch("/api/movers", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      return await res.json();
    },
  });

  const {
    data: movers,
    isLoading: isLoadingMovers,
  } = useQuery<User[]>({
    queryKey: ["/api/users/movers"],
    queryFn: async () => {
      const res = await fetch("/api/movers", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch movers");
      return await res.json();
    },
  });

  if (!user || user.role !== UserRole.ADMIN) {
    return null; // Protected route should handle this, but extra safety
  }

  const isLoading = isLoadingOrders || isLoadingCustomers || isLoadingMovers;

  // Calculate statistics
  const totalOrders = orders?.length || 0;
  const completedOrders = orders?.filter(order => order.status === "completed").length || 0;
  const inProgressOrders = orders?.filter(order => order.status === "in_progress").length || 0;
  const pendingOrders = orders?.filter(order => order.status === "pending").length || 0;
  
  const totalRevenue = orders
    ?.filter(order => order.paymentStatus === "completed")
    .reduce((total, order) => total + (order.price || 0), 0) || 0;
  
  const totalCustomers = customers?.length || 0;
  const totalMovers = movers?.length || 0;
  
  // Filter users based on search term
  const filteredCustomers = customers?.filter(customer => 
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const filteredMovers = movers?.filter(mover => 
    mover.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mover.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Filter orders based on search term
  const filteredOrders = orders?.filter(order => 
    order.pickupAddress.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.dropoffAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm)
  ) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage users, orders, and system settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-primary mr-3" />
                      <div className="text-3xl font-bold">{totalOrders}</div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{completedOrders} completed</span>
                      <span>{pendingOrders} pending</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-primary mr-3" />
                      <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      From {completedOrders} completed orders
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-primary mr-3" />
                      <div className="text-3xl font-bold">{totalCustomers + totalMovers}</div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>{totalCustomers} customers</span>
                      <span>{totalMovers} movers</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Active Moves</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Truck className="h-8 w-8 text-primary mr-3" />
                      <div className="text-3xl font-bold">{inProgressOrders}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {pendingOrders} orders waiting for movers
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest 5 orders in the system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : orders && orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 5).map((order) => (
                          <div key={order.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                            <div>
                              <div className="font-medium">Order #{order.id}</div>
                              <div className="text-xs text-gray-500">
                                {format(new Date(order.pickupDate), 'MMM d, yyyy')} - ${order.price?.toFixed(2)}
                              </div>
                            </div>
                            <Badge variant={getBadgeVariant(order.status)}>
                              {formatStatus(order.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No orders found
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Users</CardTitle>
                    <CardDescription>Latest users who joined the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCustomers || isLoadingMovers ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (customers && movers) ? (
                      <div className="space-y-3">
                        {[...customers, ...movers]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 5)
                          .map((user) => (
                            <div key={user.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                                  <span className="text-primary-700 font-medium text-sm">
                                    {user.fullName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{user.fullName}</div>
                                  <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                              </div>
                              <Badge variant={user.role === UserRole.CUSTOMER ? "default" : "info"}>
                                {user.role}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No users found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>View and manage all users on the platform</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="customers">
                    <TabsList className="mb-4 w-full">
                      <TabsTrigger value="customers" className="flex-1">
                        Customers ({filteredCustomers.length})
                      </TabsTrigger>
                      <TabsTrigger value="movers" className="flex-1">
                        Movers ({filteredMovers.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="customers">
                      {isLoadingCustomers ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : filteredCustomers.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredCustomers.map((customer) => (
                                <UserRow key={customer.id} user={customer} />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <UserIcon className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? "Try a different search term" : "There are no customers registered yet."}
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="movers">
                      {isLoadingMovers ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : filteredMovers.length > 0 ? (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredMovers.map((mover) => (
                                <UserRow key={mover.id} user={mover} />
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Truck className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No movers found</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? "Try a different search term" : "There are no movers registered yet."}
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Order Management</CardTitle>
                      <CardDescription>View and manage all orders on the platform</CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingOrders ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredOrders.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Pickup</TableHead>
                            <TableHead>Dropoff</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order) => (
                            <OrderRow key={order.id} order={order} />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-10 w-10 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? "Try a different search term" : "There are no orders in the system yet."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
