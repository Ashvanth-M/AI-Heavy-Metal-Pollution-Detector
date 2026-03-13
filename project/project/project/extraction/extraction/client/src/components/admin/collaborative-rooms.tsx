import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  User, 
  Users, 
  Plus, 
  MessagesSquare, 
  UserPlus, 
  Settings, 
  Lock, 
  Globe, 
  Hash,
  Search,
  AlertTriangle,
  Bell,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to detect and format data references
const formatMessageWithReferences = (content: string) => {
  // Pattern to match references like "PH Report #23", "HPI Analysis #45", etc.
  const referencePattern = /(PH Report #\d+|HPI Analysis #\d+|Sample #\d+|Report #\d+)/g;
  
  if (!content.match(referencePattern)) {
    return <span>{content}</span>;
  }
  
  const parts = content.split(referencePattern);
  const matches = content.match(referencePattern) || [];
  
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {matches[i] && (
            <button 
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors mx-1"
              onClick={() => alert(`Opening ${matches[i]}...`)}
            >
              {matches[i]}
            </button>
          )}
        </React.Fragment>
      ))}
    </>
  );
};

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: Date;
}

interface Room {
  id: string;
  name: string;
  description: string;
  type: "public" | "private";
  participants: number;
  unread: number;
  lastActivity: Date;
  messages: Message[];
  status?: "active" | "inactive";
  hasAlert?: boolean;
}

export function CollaborativeRooms() {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "water-quality",
      name: "Water Quality",
      description: "Discuss water quality monitoring and analysis",
      type: "public",
      participants: 8,
      unread: 0,
      lastActivity: new Date(Date.now() - 1000 * 60 * 15),
      status: "active",
      hasAlert: true,
      messages: [
        {
          id: "msg1",
          content: "Has anyone analyzed the latest samples from Chennai?",
          sender: {
            id: "admin1",
            name: "Admin User",
            role: "admin"
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: "msg2",
          content: "Yes, I've analyzed them. The HPI values are concerning in sectors E3 and E5. Check PH Report #23 for details.",
          sender: {
            id: "user2",
            name: "Michael Chen",
            role: "analyst"
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 25)
        },
        {
          id: "msg3",
          content: "We should schedule additional sampling in those areas next week. I've added the request to Sample #45.",
          sender: {
            id: "admin1",
            name: "Admin User",
            role: "admin"
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 15)
        }
      ]
    },
    {
      id: "field-team",
      name: "Field Team",
      description: "Coordinate field sampling activities",
      type: "private",
      participants: 5,
      unread: 2,
      lastActivity: new Date(Date.now() - 1000 * 60 * 45),
      status: "active",
      messages: [
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
          content: "I'll be heading there tomorrow morning. Any specific locations to prioritize? I've reviewed HPI Analysis #12 for guidance.",
          sender: {
            id: "user4",
            name: "Priya Sharma",
            role: "field-tech"
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 40)
        }
      ]
    },
    {
      id: "data-analysis",
      name: "Data Analysis",
      description: "Discuss data analysis techniques and findings",
      type: "public",
      participants: 12,
      unread: 5,
      lastActivity: new Date(Date.now() - 1000 * 60 * 120),
      status: "inactive",
      messages: [
        {
          id: "msg1",
          content: "I've updated the HMPI calculation model with the latest WHO guidelines. See Report #78 for the implementation details.",
          sender: {
            id: "user5",
            name: "David Wilson",
            role: "data-scientist"
          },
          timestamp: new Date(Date.now() - 1000 * 60 * 120)
        }
      ]
    }
  ]);
  
  // Set initial active room
  useEffect(() => {
    if (rooms.length > 0 && !activeRoom) {
      setActiveRoom(rooms[0].id);
    }
  }, [rooms, activeRoom]);

  const handleSendMessage = () => {
    if (!input.trim() || !activeRoom) return;
    
    // Add user message to the active room
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: input,
      sender: {
        id: user?.id || "current-user",
        name: user?.name || "Admin User",
        role: user?.role || "admin"
      },
      timestamp: new Date()
    };
    
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === activeRoom 
          ? { ...room, messages: [...room.messages, newMessage], lastActivity: new Date() }
          : room
      )
    );
    
    setInput("");
  };

  const handleCreateRoom = () => {
    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name: `New Room ${rooms.length + 1}`,
      description: "Click to edit description",
      type: "public",
      participants: 1,
      unread: 0,
      lastActivity: new Date(),
      status: "active",
      messages: [
        {
          id: "welcome-msg",
          content: "Welcome to the new room! You can start the discussion here.",
          sender: {
            id: "system",
            name: "System",
            role: "system"
          },
          timestamp: new Date()
        }
      ]
    };
    
    setRooms(prevRooms => [...prevRooms, newRoom]);
    setActiveRoom(newRoom.id);
  };

  const activeRoomData = activeRoom ? rooms.find(room => room.id === activeRoom) : null;
  
  // Filter rooms based on search query
  const filteredRooms = searchQuery 
    ? rooms.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : rooms;

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-md border">
      {/* Sidebar with room list */}
      <div className="w-72 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center">
            <MessagesSquare className="w-4 h-4 mr-2" />
            Collaborative Chat Rooms
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
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white hover:bg-blue-50"
              onClick={handleCreateRoom}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100%-7rem)]">
          <div className="space-y-2 p-2">
            {filteredRooms.map(room => (
              <div 
                key={room.id}
                className={`rounded-lg border p-3 cursor-pointer transition-all ${
                  activeRoom === room.id 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "bg-white hover:bg-blue-50/50 border-gray-100"
                }`}
                onClick={() => setActiveRoom(room.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    {room.type === "public" ? (
                      <Globe className="h-4 w-4 mr-2 text-blue-500" />
                    ) : (
                      <Lock className="h-4 w-4 mr-2 text-blue-500" />
                    )}
                    <div className="font-medium text-sm">{room.name}</div>
                  </div>
                  {room.unread > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {room.unread}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate mb-2">
                  {room.description}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {room.participants} participants
                  </div>
                  <div>
                    {new Date(room.lastActivity).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeRoomData ? (
          <>
            <div className="p-4 border-b flex justify-between items-center bg-white shadow-sm">
              <div>
                <h3 className="font-semibold flex items-center">
                  {activeRoomData.type === "public" ? (
                    <Hash className="w-4 h-4 mr-2 text-blue-500" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2 text-blue-500" />
                  )}
                  {activeRoomData.name}
                </h3>
                <div className="text-xs text-muted-foreground flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {activeRoomData.participants} participants • Last active {new Date(activeRoomData.lastActivity).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1" title="Add Member">
                  <UserPlus className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Add Member</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1" title="Room Settings">
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Room Settings</span>
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4 bg-blue-50/30">
              <div className="space-y-4">
                {activeRoomData.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender.id === user?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex items-start gap-2 max-w-[80%]">
                      {message.sender.id !== user?.id && (
                        <Avatar className="h-8 w-8 bg-blue-500">
                          <span className="text-xs text-white">
                            {message.sender.name.substring(0, 2).toUpperCase()}
                          </span>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 shadow-sm ${
                          message.sender.id === user?.id
                            ? "bg-blue-500 text-white"
                            : message.sender.id === "system"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-white border border-gray-100"
                        }`}
                      >
                        {message.sender.id !== user?.id && (
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium">
                              {message.sender.name}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] py-0 h-4 ${
                                message.sender.role === "admin" 
                                  ? "bg-blue-100 text-blue-700 border-blue-200" 
                                  : message.sender.role === "analyst" 
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : message.sender.role === "field-lead"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : message.sender.role === "field-tech"
                                  ? "bg-purple-100 text-purple-700 border-purple-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              {message.sender.role}
                            </Badge>
                          </div>
                        )}
                        <div className="text-sm">
                          {formatMessageWithReferences(message.content)}
                        </div>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      {message.sender.id === user?.id && (
                        <Avatar className="h-8 w-8 bg-blue-600">
                          <User className="h-4 w-4 text-white" />
                        </Avatar>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-white">
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
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Room Selected</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Select a room from the sidebar or create a new one
              </p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={handleCreateRoom}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Room
              </Button>
            </div>
          </div>
        )}
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
            {rooms.map(room => (
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
              <p className="text-red-600">HPI values exceeding threshold in Water Quality room</p>
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
    </div>
  );
}