import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { insertOrderSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

// Extend the schema with additional validation
const bookingFormSchema = insertOrderSchema.extend({
  pickupDate: z.date({
    required_error: "Please select a date",
  }).refine(date => date > new Date(), {
    message: "Move date must be in the future",
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSuccess?: () => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  
  // Initialize form with default values
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupAddress: "",
      dropoffAddress: "",
      pickupDate: undefined,
      preferredTime: "",
      furnitureType: "",
      furnitureDetails: "",
      specialInstructions: "",
    },
  });
  
  // Mutation for creating an order
  const createOrderMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking successful!",
        description: "Your furniture move has been booked.",
      });
      
      // Invalidate orders cache
      queryClient.invalidateQueries({ queryKey: ["/api/user/orders"] });
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to dashboard
        navigate("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  function onSubmit(values: BookingFormValues) {
    if (step < 3) {
      // Move to next step
      setStep(step + 1);
    } else {
      // Submit the form
      createOrderMutation.mutate(values);
    }
  }
  
  // Go to previous step
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Determine step status
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber === step) return "active";
    if (stepNumber < step) return "completed";
    return "inactive";
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="relative pb-6">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                ${getStepStatus(1) === "active" ? "step-active" :
                  getStepStatus(1) === "completed" ? "step-completed" : "step-inactive"}`}>
              1
            </div>
            <div className={`text-xs mt-1 ${getStepStatus(1) === "active" || getStepStatus(1) === "completed" ? "text-primary font-medium" : "text-gray-500"}`}>
              Location
            </div>
          </div>
          
          <div className={`flex-1 mx-2 h-0.5 ${step > 1 ? "bg-primary" : "bg-gray-200"}`}></div>
          
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                ${getStepStatus(2) === "active" ? "step-active" :
                  getStepStatus(2) === "completed" ? "step-completed" : "step-inactive"}`}>
              2
            </div>
            <div className={`text-xs mt-1 ${getStepStatus(2) === "active" || getStepStatus(2) === "completed" ? "text-primary font-medium" : "text-gray-500"}`}>
              Details
            </div>
          </div>
          
          <div className={`flex-1 mx-2 h-0.5 ${step > 2 ? "bg-primary" : "bg-gray-200"}`}></div>
          
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                ${getStepStatus(3) === "active" ? "step-active" :
                  getStepStatus(3) === "completed" ? "step-completed" : "step-inactive"}`}>
              3
            </div>
            <div className={`text-xs mt-1 ${getStepStatus(3) === "active" || getStepStatus(3) === "completed" ? "text-primary font-medium" : "text-gray-500"}`}>
              Confirm
            </div>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Location */}
          {step === 1 && (
            <div className="animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="pickupAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pickup address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dropoffAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter dropoff address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
          
          {/* Step 2: Details */}
          {step === 2 && (
            <div className="animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="pickupDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Moving Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="preferredTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Time</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Morning (8am - 12pm)">Morning (8am - 12pm)</SelectItem>
                          <SelectItem value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</SelectItem>
                          <SelectItem value="Evening (4pm - 8pm)">Evening (4pm - 8pm)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="furnitureType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Furniture Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select furniture type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="small">Small Item (Chair, Desk)</SelectItem>
                          <SelectItem value="medium">Medium Item (Dining Table)</SelectItem>
                          <SelectItem value="large">Large Item (Sofa, Bed)</SelectItem>
                          <SelectItem value="specialty">Specialty Item (Antique, Piano)</SelectItem>
                          <SelectItem value="multiple">Multiple Items</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="furnitureDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Furniture Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your furniture (e.g. dimensions, weight, etc.)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special instructions for the movers?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
          
          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="animate-slide-up">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Summary</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Pickup Location</div>
                      <div className="mt-1">{form.getValues("pickupAddress")}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500">Dropoff Location</div>
                      <div className="mt-1">{form.getValues("dropoffAddress")}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Moving Date</div>
                      <div className="mt-1">
                        {form.getValues("pickupDate") 
                          ? format(form.getValues("pickupDate"), "PPP")
                          : "Not selected"}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500">Preferred Time</div>
                      <div className="mt-1">{form.getValues("preferredTime") || "Not selected"}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-500">Furniture Type</div>
                      <div className="mt-1">
                        {(() => {
                          const furnitureType = form.getValues("furnitureType");
                          switch (furnitureType) {
                            case "small": return "Small Item (Chair, Desk)";
                            case "medium": return "Medium Item (Dining Table)";
                            case "large": return "Large Item (Sofa, Bed)";
                            case "specialty": return "Specialty Item (Antique, Piano)";
                            case "multiple": return "Multiple Items";
                            default: return "Not selected";
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500">Furniture Details</div>
                    <div className="mt-1">{form.getValues("furnitureDetails") || "No details provided"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-500">Special Instructions</div>
                    <div className="mt-1">{form.getValues("specialInstructions") || "No special instructions"}</div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Estimated Price</span>
                      <span className="text-base font-medium text-primary">
                        {(() => {
                          const furnitureType = form.getValues("furnitureType");
                          switch (furnitureType) {
                            case "small": return "$29.99";
                            case "medium": return "$49.99";
                            case "large": return "$79.99";
                            case "specialty": return "$99.99";
                            case "multiple": return "$129.99";
                            default: return "$39.99";
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Final price may vary based on actual distance and time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className={`${step === 3 ? "flex justify-between" : "text-right"}`}>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={createOrderMutation.isPending}
              >
                Back
              </Button>
            )}
            
            <Button 
              type="submit"
              disabled={createOrderMutation.isPending}
              className={`${step === 1 ? "w-full md:w-auto" : ""}`}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : step < 3 ? (
                "Continue"
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
