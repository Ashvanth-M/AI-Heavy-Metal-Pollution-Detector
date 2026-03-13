import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Users, Plus, Hash, Lock, UserPlus, Settings, AlertTriangle, Bell, X, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper function to format message content with clickable data references
const formatMessageWithReferences = (content: string) => {
  if (!content) return null;
  
  // Regular expression to match patterns like "PH Report #23", "Sample #45", "HPI Analysis #12"
  const referencePattern = /(PH Report #\d+|Sample #\d+|HPI Analysis #\d+|Report #\d+)/g;
  
  // Split the content by reference patterns
  const parts = content.split(referencePattern);
  const matches = content.match(referencePattern) || [];
  
  // If no references found, return the original content
  if (matches.length === 0) return content;
  
  // Combine parts and matches
  const result: React.ReactNode[] = [];
  parts.forEach((part, index) => {
    if (part) result.push(<span key={`part-${index}`}>{part}</span>);
    if (index < matches.length) {
      result.push(
        <Button
          key={`ref-${index}`}
          variant="link"
          size="sm"
          className="px-1 py-0 h-auto text-blue-600 font-medium"
          onClick={() => alert(`Opening ${matches[index]}...`)}
        >
          {matches[index]}
        </Button>
      );
    }
  });
  
  return result;
};

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: Date;
}

interface ChatRoom {
  id: string;
  name: string;
  participants: number;
  unread: number;
  lastActivity: Date;
  status?: "active" | "inactive";
  hasAlert?: boolean;
}

export function AdminChat() {
  const [activeRoom, setActiveRoom] = useState("general");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showRoomSettingsModal, setShowRoomSettingsModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  
  // Mock chat rooms
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([
    {
      id: "general",
      name: "General",
      participants: 8,
      unread: 0,
      lastActivity: new Date(),
      status: "active"
    },
    {
      id: "field-team",
      name: "Field Team",
      participants: 4,
      unread: 2,
      lastActivity: new Date(Date.now() - 1000 * 60 * 15),
      status: "active",
      hasAlert: true
    },
    {
      id: "lab-analysis",
      name: "Lab Analysis",
      participants: 3,
      unread: 0,
      lastActivity: new Date(Date.now() - 1000 * 60 * 60),
      status: "inactive"
    }
  ]);
  
  // Mock messages for each room
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    "general": [
      {
        id: "msg1",
        content: "Welcome to the general discussion room!",
        sender: {
          id: "system",
          name: "System",
          role: "system"
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        id: "msg2",
        content: "Has anyone reviewed the latest water quality reports from the eastern district?",
        sender: {
          id: "user1",
          name: "Sarah Johnson",
          role: "admin"
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        id: "msg3",
        content: "Yes, I've analyzed them. The HPI values are concerning in sectors E3 and E5. Check PH Report #23 for details.",
        sender: {
          id: "user2",
          name: "Michael Chen",
          role: "analyst"
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 25)
      }
    ],
    "field-team": [
      {
        id: "msg1",
        content: "Team, we need additional samples from the river delta region.",
        sender: {
          id: "user3",
          name: "Alex Rodriguez",
          role: "field-lead"
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 45)
      },
      {
        id: "msg2",
        content: "I'll be heading there tomorrow morning. Any specific locations to prioritize? I'll update Sample #45 with new data.",
        sender: {
          id: "user4",
          name: "Jamie Wilson",
          role: "technician"
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 30)
      }
    ],
    "lab-analysis": [
      {
        id: "msg1",
        content: "The new spectrometer is calibrated and ready for the heavy metal analysis. See HPI Analysis #12 for calibration details.",
        sender: {
          id: "user5",
          name: "Dr. Patel",
          role: "lab-director"
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 120)
      }
    ]
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: input,
      sender: {
        id: "current-user",
        name: "Admin User",
        role: "admin"
      },
      timestamp: new Date()
    };
    
    setMessages(prev => ({
      ...prev,
      [activeRoom]: [...(prev[activeRoom] || []), newMessage]
    }));
    
    setInput("");
  };

  const createNewRoom = () => {
    const roomName = prompt("Enter name for new chat room:");
    if (roomName && roomName.trim()) {
      const newRoomId = `room-${Date.now()}`;
      
      // Add new room
      setChatRooms(prev => [
        ...prev,
        {
          id: newRoomId,
          name: roomName.trim(),
          participants: 1,
          unread: 0,
          lastActivity: new Date()
        }
      ]);
      
      // Initialize empty message list
      setMessages(prev => ({
        ...prev,
        [newRoomId]: [
          {
            id: "welcome",
            content: `Welcome to the ${roomName.trim()} room!`,
            sender: {
              id: "system",
              name: "System",
              role: "system"
            },
            timestamp: new Date()
          }
        ]
      }));
      
      // Switch to new room
      setActiveRoom(newRoomId);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary" />
          Collaborative Chat Rooms
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex p-0">
        <div className="w-72 border-r bg-muted/30">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Chat Rooms
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Communicate with your team about water quality data
            </p>
          </div>
          <div className="p-2">
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search discussions..." 
                  className="pl-8 text-xs h-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNewRoom}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-7rem)]">
            <div className="p-2 space-y-2">
              {chatRooms
                .filter(room => 
                  searchQuery ? room.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
                )
                .map((room) => (
                <div
                  key={room.id}
                  className={`p-3 rounded-md cursor-pointer border ${
                    activeRoom === room.id
                      ? "bg-primary/10 border-primary/20"
                      : "hover:bg-muted border-transparent"
                  }`}
                  onClick={() => {
                    setActiveRoom(room.id);
                    // Clear unread count when entering room
                    setChatRooms(prev =>
                      prev.map(r =>
                        r.id === room.id ? { ...r, unread: 0 } : r
                      )
                    );
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{room.name}</div>
                      {room.status && (
                        <div 
                          className={`w-2 h-2 rounded-full ${room.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                          title={`Status: ${room.status}`}
                        ></div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {room.hasAlert && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" title="Alert!" />
                      )}
                      {room.unread > 0 && (
                        <Badge variant="destructive" className="ml-1">
                          {room.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <Users className="h-3 w-3 mr-1" />
                    {room.participants} participants
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last active {new Date(room.lastActivity).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
            <div>
              <h3 className="font-semibold flex items-center">
                {activeRoom === "general" ? (
                  <Hash className="w-4 h-4 mr-2 text-blue-500" />
                ) : (
                  <Lock className="w-4 h-4 mr-2 text-blue-500" />
                )}
                {chatRooms.find(room => room.id === activeRoom)?.name || "Chat Room"}
              </h3>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Users className="h-3 w-3 mr-1" />
                {chatRooms.find(room => room.id === activeRoom)?.participants || 0} participants • Last active {new Date(chatRooms.find(room => room.id === activeRoom)?.lastActivity || new Date()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                title="Add Member"
                onClick={() => setShowAddMemberModal(true)}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Member</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                title="Room Settings"
                onClick={() => setShowRoomSettingsModal(true)}
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Room Settings</span>
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-1 p-4 bg-blue-50/30">
            <div className="space-y-4">
              {(messages[activeRoom] || []).map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender.id === "current-user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.sender.id !== "current-user" && (
                      <Avatar className={`h-8 w-8 ${
                        message.sender.role === "admin" ? "bg-blue-600" :
                        message.sender.role === "analyst" ? "bg-emerald-600" :
                        message.sender.role === "field-lead" ? "bg-amber-600" :
                        message.sender.role === "system" ? "bg-gray-500" :
                        "bg-primary/80"
                      }`}>
                        <span className="text-xs text-white">
                          {message.sender.name.substring(0, 2).toUpperCase()}
                        </span>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg px-3 py-2 shadow-sm ${
                        message.sender.id === "current-user"
                          ? "bg-primary text-primary-foreground"
                          : message.sender.id === "system"
                          ? "bg-muted/50 text-muted-foreground"
                          : "bg-white border border-gray-100"
                      }`}
                    >
                      {message.sender.id !== "current-user" && message.sender.id !== "system" && (
                        <p className="text-xs font-medium text-primary mb-1">
                          {message.sender.name}
                          <Badge className={`ml-2 ${
                            message.sender.role === "admin" ? "bg-blue-100 text-blue-800" :
                            message.sender.role === "analyst" ? "bg-emerald-100 text-emerald-800" :
                            message.sender.role === "field-lead" ? "bg-amber-100 text-amber-800" :
                            message.sender.role === "technician" ? "bg-purple-100 text-purple-800" :
                            message.sender.role === "lab-director" ? "bg-indigo-100 text-indigo-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {message.sender.role}
                          </Badge>
                        </p>
                      )}
                      <p className="text-sm">{formatMessageWithReferences(message.content)}</p>
                      <p className="text-xs opacity-50 mt-1 text-right">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    {message.sender.id === "current-user" && (
                      <Avatar className="h-8 w-8 bg-blue-500">
                        <User className="h-4 w-4 text-white" />
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Admin Panel */}
        <div className={`w-64 border-l bg-white transition-all duration-300 ${showAdminPanel ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold text-sm">Admin Panel</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => setShowAdminPanel(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-3">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">ROOM OVERVIEW</h4>
            <div className="space-y-2">
              {chatRooms.map(room => (
                <div 
                  key={room.id} 
                  className="flex items-center justify-between p-2 rounded-md bg-gray-50 text-xs"
                >
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${room.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-medium">{room.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1 text-gray-500" />
                    <span>{room.participants}</span>
                    {room.hasAlert && (
                      <AlertTriangle className="h-3 w-3 ml-2 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 border-t">
            <h4 className="text-xs font-medium mb-2 text-muted-foreground">ALERTS</h4>
            <div className="space-y-2">
              <div className="p-2 rounded-md bg-red-50 border border-red-100 text-xs">
                <div className="flex items-center text-red-700 font-medium mb-1">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Critical HPI Values</span>
                </div>
                <p className="text-red-600">HPI values exceeding threshold in Field Team room</p>
              </div>
              <div className="p-2 rounded-md bg-amber-50 border border-amber-100 text-xs">
                <div className="flex items-center text-amber-700 font-medium mb-1">
                  <Bell className="h-3 w-3 mr-1" />
                  <span>Sampling Reminder</span>
                </div>
                <p className="text-amber-600">Field team scheduled for sampling tomorrow</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Toggle button for admin panel */}
        {!showAdminPanel && (
          <Button 
            variant="outline" 
            size="sm" 
            className="absolute right-4 top-4 bg-white"
            onClick={() => setShowAdminPanel(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            <span className="text-xs">Admin Panel</span>
          </Button>
        )}

        {/* Add Member Modal */}
        <Dialog open={showAddMemberModal} onOpenChange={setShowAddMemberModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Member to Room</DialogTitle>
              <DialogDescription>
                Add a new member to the {chatRooms.find(room => room.id === activeRoom)?.name} room.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="name" className="text-right">
                   Name
                 </Label>
                 <Input 
                   id="name" 
                   className="col-span-3" 
                   placeholder="Enter member name" 
                   value={newMemberName}
                   onChange={(e) => setNewMemberName(e.target.value)}
                 />
               </div>
               <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="role" className="text-right">
                   Role
                 </Label>
                 <Select onValueChange={setNewMemberRole} value={newMemberRole}>
                   <SelectTrigger className="col-span-3">
                     <SelectValue placeholder="Select role" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="admin">Admin</SelectItem>
                     <SelectItem value="analyst">Analyst</SelectItem>
                     <SelectItem value="field-lead">Field Lead</SelectItem>
                     <SelectItem value="technician">Technician</SelectItem>
                     <SelectItem value="lab-director">Lab Director</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={() => {
                // Add member logic
                if (newMemberName && newMemberRole) {
                  // Update participant count for the active room
                  setChatRooms(prev => 
                    prev.map(room => 
                      room.id === activeRoom 
                        ? { ...room, participants: room.participants + 1 } 
                        : room
                    )
                  );
                  
                  // Add a system message about the new member
                  const newMessage = {
                    id: `msg-${Date.now()}`,
                    content: `${newMemberName} has joined the room as ${newMemberRole}.`,
                    sender: {
                      id: "system",
                      name: "System",
                      role: "system"
                    },
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => ({
                    ...prev,
                    [activeRoom]: [...(prev[activeRoom] || []), newMessage]
                  }));
                  
                  // Reset form and close modal
                  setNewMemberName("");
                  setNewMemberRole("");
                  setShowAddMemberModal(false);
                  
                  alert("Member added successfully!");
                } else {
                  alert("Please fill in all fields");
                }
              }}>
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Room Settings Modal */}
        <Dialog open={showRoomSettingsModal} onOpenChange={setShowRoomSettingsModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Room Settings</DialogTitle>
              <DialogDescription>
                Configure settings for the {chatRooms.find(room => room.id === activeRoom)?.name} room.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="room-name" className="text-right">
                  Room Name
                </Label>
                <Input 
                  id="room-name" 
                  className="col-span-3" 
                  defaultValue={chatRooms.find(room => room.id === activeRoom)?.name} 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch id="status" defaultChecked={chatRooms.find(room => room.id === activeRoom)?.status === "active"} />
                  <Label htmlFor="status">
                    {chatRooms.find(room => room.id === activeRoom)?.status === "active" ? "Active" : "Inactive"}
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alerts" className="text-right">
                  Alerts
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch id="alerts" defaultChecked={chatRooms.find(room => room.id === activeRoom)?.hasAlert} />
                  <Label htmlFor="alerts">
                    {chatRooms.find(room => room.id === activeRoom)?.hasAlert ? "Enabled" : "Disabled"}
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="destructive" className="mr-auto" onClick={() => {
                if (confirm("Are you sure you want to delete this room?")) {
                  // Delete room logic would go here
                  alert("Room deleted successfully!");
                  setShowRoomSettingsModal(false);
                }
              }}>
                Delete Room
              </Button>
              <Button type="submit" onClick={() => {
                // Save settings logic would go here
                alert("Room settings saved successfully!");
                setShowRoomSettingsModal(false);
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}