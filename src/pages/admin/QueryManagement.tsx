import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, MessageSquare, Reply, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { getDataHandlerWithToken, patchTokenDataHandler, deleteDataHandler } from "@/config/services";
import ApiConfig from '@/config/apiConfig';
interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  thumbnail: string;
  _id: string;
}

interface Order {
  items: OrderItem[];
  totalAmount: number;
  itemCount: number;
}

interface Query {
  _id: string;
  customer: Customer;
  order: Order;
  additionalMessage: string;
  status: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const QueryManagement = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQueries, setSelectedQueries] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch queries on component mount
  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setIsLoading(true);
      const response = await getDataHandlerWithToken("query");
      if (response) {
        setQueries(response);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch queries.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while fetching queries.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (queryId: string, newStatus: string) => {
    try {
      const endpoint = ApiConfig.updateQuery(queryId)
      const response = await patchTokenDataHandler(endpoint, { status: newStatus },true);
      
      if (response) {
        setQueries(queries.map(query => 
          query._id === queryId 
            ? { ...query, status: newStatus, updatedAt: new Date().toISOString() }
            : query
        ));
        
        if (selectedQuery && selectedQuery._id === queryId) {
          setSelectedQuery({ ...selectedQuery, status: newStatus });
        }
        
        toast({
          title: "Status Updated",
          description: `Query status changed to ${newStatus}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update query status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating query status.",
        variant: "destructive",
      });
    }
  };

  // const handleSendReply = () => {
  //   if (!replyMessage.trim()) {
  //     toast({
  //       title: "Empty Reply",
  //       description: "Please enter a reply message.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Update query status to "in-progress" if it was "pending"
  //   if (selectedQuery?.status === "pending") {
  //     handleStatusChange(selectedQuery._id, "in-progress");
  //   }

  //   toast({
  //     title: "Reply Sent",
  //     description: "Your reply has been sent to the customer.",
  //   });
  //   setReplyMessage("");
  //   setIsReplyDialogOpen(false);
  //   setSelectedQuery(null);
  // };

  const handleDeleteQuery = async (queryId: string) => {
    try {
      const endpoint = ApiConfig.queryById(queryId)
      const response = await deleteDataHandler(endpoint,true);
      
      if (response) {
        setQueries(queries.filter(query => query._id !== queryId));
        toast({
          title: "Query Deleted",
          description: "Query has been successfully deleted.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete query.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the query.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedQueries.length === 0) {
      toast({
        title: "No Queries Selected",
        description: "Please select at least one query to delete.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete all selected queries
      const deletePromises = selectedQueries.map(id =>{
        const endpoint = ApiConfig.queryById(id)
        deleteDataHandler(endpoint, true)
      }
    );
      await Promise.all(deletePromises);
      
      setQueries(queries.filter(query => !selectedQueries.includes(query._id)));
      setSelectedQueries([]);
      
      toast({
        title: "Queries Deleted",
        description: `${selectedQueries.length} queries have been successfully deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting queries.",
        variant: "destructive",
      });
    }
  };

  const toggleQuerySelection = (queryId: string) => {
    if (selectedQueries.includes(queryId)) {
      setSelectedQueries(selectedQueries.filter(id => id !== queryId));
    } else {
      setSelectedQueries([...selectedQueries, queryId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedQueries.length === filteredQueries.length) {
      setSelectedQueries([]);
    } else {
      setSelectedQueries(filteredQueries.map(query => query._id));
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = 
      query.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (query.additionalMessage && query.additionalMessage.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "All" || query.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string, color: string }> = {
      "pending": { text: "Pending", color: "bg-red-100 text-red-800" },
      "in-progress": { text: "In Progress", color: "bg-yellow-100 text-yellow-800" },
      "resolved": { text: "Resolved", color: "bg-green-100 text-green-800" },
      "confirmed": { text: "Confirmed", color: "bg-blue-100 text-blue-800" }
    };
    
    const statusInfo = statusMap[status] || { text: status, color: "bg-gray-100 text-gray-800" };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-red-500" />;
      case "in-progress":
        return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading queries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Query Management</h1>
            <p className="text-gray-600">
              Manage customer support queries and responses
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Queries</label>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by customer name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="min-w-[120px]">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                id="status-filter"
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            {selectedQueries.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md inline-flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedQueries.length})
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5" />
              Customer Queries
            </h2>
            <p className="text-gray-600 mb-6">
              All customer support requests and their current status
            </p>
            
            {filteredQueries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No queries found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedQueries.length === filteredQueries.length && filteredQueries.length > 0}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Items</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredQueries.map((query) => (
                      <tr key={query._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedQueries.includes(query._id)}
                            onChange={() => toggleQuerySelection(query._id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{query.customer.name}</div>
                            <div className="text-sm text-gray-500">{query.customer.email}</div>
                            <div className="text-sm text-gray-500">{query.customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {query.order.items.length} items - ₹{query.order.totalAmount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {query.order.items.slice(0, 2).map(item => (
                              <div key={item._id}>
                                {item.productName} ({item.quantity} × {item.size}/{item.color})
                              </div>
                            ))}
                            {query.order.items.length > 2 && (
                              <div>+{query.order.items.length - 2} more items</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm text-gray-900 truncate">
                              {query.additionalMessage || "No additional message"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(query.status)}
                            {getStatusBadge(query.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(query.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedQuery(query);
                                setIsViewDialogOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {/* <button
                              onClick={() => {
                                setSelectedQuery(query);
                                setIsReplyDialogOpen(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Reply className="h-4 w-4" />
                            </button> */}
                            <button
                              onClick={() => handleDeleteQuery(query._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Query Modal */}
      {isViewDialogOpen && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Query Details</h2>
              <p className="text-gray-600">Full query information and history</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                  <p className="text-sm font-medium text-gray-900">{selectedQuery.customer.name}</p>
                  <p className="text-sm text-gray-500">{selectedQuery.customer.email}</p>
                  <p className="text-sm text-gray-500">{selectedQuery.customer.phone}</p>
                  <p className="text-sm text-gray-500">{selectedQuery.customer.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status & Actions</label>
                  <div className="flex gap-2 mb-3">
                    {getStatusBadge(selectedQuery.status)}
                  </div>
                  <select 
                    value={selectedQuery.status} 
                    onChange={(e) => handleStatusChange(selectedQuery._id, e.target.value)}
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Details</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedQuery.order.items.length} items • Total: ₹{selectedQuery.order.totalAmount}
                  </p>
                  <div className="mt-2 space-y-2">
                    {selectedQuery.order.items.map(item => (
                      <div key={item._id} className="flex items-center gap-3 text-sm">
                        <img src={item.thumbnail} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-gray-500">Size: {item.size}, Color: {item.color}, Qty: {item.quantity}</p>
                          <p className="text-gray-500">Price: ₹{item.price} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{selectedQuery.additionalMessage || "No additional message provided"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>Created: {formatDate(selectedQuery.createdAt)}</div>
                <div>Last Updated: {formatDate(selectedQuery.updatedAt)}</div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {/* {isReplyDialogOpen && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Reply to Customer</h2>
              <p className="text-gray-600">Send a response to {selectedQuery.customer.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="reply" className="block text-sm font-medium text-gray-700">Your Reply</label>
                <textarea
                  id="reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Enter your reply message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={handleSendReply} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
              >
                Send Reply
              </button>
              <button
                onClick={() => setIsReplyDialogOpen(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default QueryManagement;