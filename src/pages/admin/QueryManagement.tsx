import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Eye, MessageSquare, Reply, Clock, CheckCircle, XCircle } from "lucide-react";

// Static query data
const initialQueries = [
  {
    id: 1,
    subject: "Product Return Request",
    message: "I would like to return my iPhone 15 Pro due to battery issues. Can you please help me with the return process?",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    status: "Pending",
    priority: "High",
    category: "Returns",
    createdDate: "2024-01-15",
    lastUpdated: "2024-01-15",
  },
  {
    id: 2,
    subject: "Shipping Inquiry",
    message: "My order #12345 was supposed to arrive yesterday but I haven't received it yet. Can you check the status?",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    status: "In Progress",
    priority: "Medium",
    category: "Shipping",
    createdDate: "2024-02-20",
    lastUpdated: "2024-02-21",
  },
  {
    id: 3,
    subject: "Account Access Issue",
    message: "I'm unable to log into my account. I've tried resetting my password but haven't received the email.",
    customerName: "Bob Johnson",
    customerEmail: "bob@example.com",
    status: "Resolved",
    priority: "Low",
    category: "Account",
    createdDate: "2024-03-10",
    lastUpdated: "2024-03-12",
  },
];

const QueryManagement = () => {
  const [queries, setQueries] = useState(initialQueries);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const { toast } = useToast();

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || query.status === filterStatus;
    const matchesPriority = filterPriority === "All" || query.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleStatusChange = (queryId: number, newStatus: string) => {
    setQueries(queries.map(query => 
      query.id === queryId 
        ? { ...query, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] }
        : query
    ));
    toast({
      title: "Status Updated",
      description: `Query status changed to ${newStatus}`,
    });
  };

  const handleSendReply = () => {
    if (!replyMessage.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply message.",
        variant: "destructive",
      });
      return;
    }

    // Update query status to "In Progress" if it was "Pending"
    if (selectedQuery?.status === "Pending") {
      handleStatusChange(selectedQuery.id, "In Progress");
    }

    toast({
      title: "Reply Sent",
      description: "Your reply has been sent to the customer.",
    });
    setReplyMessage("");
    setIsReplyDialogOpen(false);
    setSelectedQuery(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "Pending": "destructive",
      "In Progress": "secondary",
      "Resolved": "default",
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      "High": "destructive",
      "Medium": "secondary",
      "Low": "outline",
    };
    return (
      <Badge variant={variants[priority as keyof typeof variants] as any}>
        {priority}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 text-destructive" />;
      case "In Progress":
        return <MessageSquare className="h-4 w-4 text-warning" />;
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Query Management</h1>
          <p className="text-muted-foreground">
            Manage customer support queries and responses
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search Queries</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by subject, customer, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="min-w-[120px]">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[120px]">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Priority</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Queries
          </CardTitle>
          <CardDescription>
            All customer support requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQueries.map((query) => (
                <TableRow key={query.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{query.subject}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {query.message.substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{query.customerName}</div>
                      <div className="text-sm text-muted-foreground">{query.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{query.category}</Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(query.priority)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(query.status)}
                      {getStatusBadge(query.status)}
                    </div>
                  </TableCell>
                  <TableCell>{query.createdDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedQuery(query)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Query Details</DialogTitle>
                            <DialogDescription>
                              Full query information and history
                            </DialogDescription>
                          </DialogHeader>
                          {selectedQuery && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Customer</Label>
                                  <p className="text-sm font-medium">{selectedQuery.customerName}</p>
                                  <p className="text-sm text-muted-foreground">{selectedQuery.customerEmail}</p>
                                </div>
                                <div>
                                  <Label>Status & Priority</Label>
                                  <div className="flex gap-2 mt-1">
                                    {getStatusBadge(selectedQuery.status)}
                                    {getPriorityBadge(selectedQuery.priority)}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Subject</Label>
                                <p className="text-sm font-medium mt-1">{selectedQuery.subject}</p>
                              </div>
                              <div>
                                <Label>Message</Label>
                                <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{selectedQuery.message}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div>Created: {selectedQuery.createdDate}</div>
                                <div>Last Updated: {selectedQuery.lastUpdated}</div>
                              </div>
                              <div className="flex gap-2">
                                <Select 
                                  value={selectedQuery.status} 
                                  onValueChange={(value) => {
                                    handleStatusChange(selectedQuery.id, value);
                                    setSelectedQuery({...selectedQuery, status: value});
                                  }}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Resolved">Resolved</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button className="flex items-center gap-2">
                                      <Reply className="h-4 w-4" />
                                      Reply
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reply to Customer</DialogTitle>
                                      <DialogDescription>
                                        Send a response to {selectedQuery.customerName}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="reply">Your Reply</Label>
                                        <Textarea
                                          id="reply"
                                          value={replyMessage}
                                          onChange={(e) => setReplyMessage(e.target.value)}
                                          placeholder="Enter your reply message..."
                                          rows={6}
                                        />
                                      </div>
                                      <Button onClick={handleSendReply} className="w-full">
                                        Send Reply
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedQuery(query)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueryManagement;