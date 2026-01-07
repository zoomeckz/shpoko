import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFriends } from "@/hooks/useFriends";
import { useAuth } from "@/contexts/AuthContext";
import { useDuolingoSounds } from "@/hooks/useDuolingoSounds";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Search,
  MessageCircle,
  Trophy,
  Flame,
  Star,
  Check,
  X,
  Send,
  Bell,
  Crown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Friends = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { playCorrect, playClick } = useDuolingoSounds();
  const {
    friends,
    pendingRequests,
    sentRequests,
    messages,
    unreadCount,
    loading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    sendEncouragement,
    markAllAsRead,
    encouragementMessages,
  } = useFriends();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedTab, setSelectedTab] = useState("friends");
  const [showMessagesDialog, setShowMessagesDialog] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSendRequest = async (friendId: string) => {
    playClick();
    const success = await sendFriendRequest(friendId);
    if (success) {
      playCorrect();
      toast({ title: "Friend request sent! 📬" });
      setSearchResults((prev) => prev.filter((u) => u.id !== friendId));
    }
  };

  const handleAccept = async (friendshipId: string) => {
    playClick();
    const success = await acceptFriendRequest(friendshipId);
    if (success) {
      playCorrect();
      toast({ title: "Friend request accepted! 🎉" });
    }
  };

  const handleReject = async (friendshipId: string) => {
    await rejectFriendRequest(friendshipId);
    toast({ title: "Friend request declined" });
  };

  const handleSendEncouragement = async (friendId: string) => {
    playClick();
    const success = await sendEncouragement(friendId);
    if (success) {
      playCorrect();
      toast({ title: "Encouragement sent! 💪" });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 pb-20 lg:pb-8 px-4">
          <div className="max-w-3xl mx-auto py-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold font-nunito flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  Friends
                </h1>
                <p className="text-muted-foreground">
                  Learn together, grow together!
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Messages Button */}
                <Dialog open={showMessagesDialog} onOpenChange={setShowMessagesDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center justify-between">
                        Messages
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                          >
                            Mark all read
                          </Button>
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto space-y-3">
                      {messages.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                          No messages yet
                        </p>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              !msg.read && "bg-primary/5 border-primary/30"
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={msg.sender?.profile_picture || undefined} />
                                <AvatarFallback>
                                  {msg.sender?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">
                                {msg.sender?.username}
                              </span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                {new Date(msg.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by username..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={searching}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Find
                  </Button>
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={result.profile_picture || undefined} />
                              <AvatarFallback>
                                {result.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{result.username}</span>
                                {result.is_premium && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" />
                                  {result.xp} XP
                                </span>
                                <span className="flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-orange-500" />
                                  {result.streak}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleSendRequest(result.id)}>
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="friends" className="flex-1">
                  Friends ({friends.length})
                </TabsTrigger>
                <TabsTrigger value="requests" className="flex-1">
                  Requests
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="compare" className="flex-1">
                  Compare
                </TabsTrigger>
              </TabsList>

              {/* Friends List */}
              <TabsContent value="friends">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Loading friends...
                  </div>
                ) : friends.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-bold mb-2">No friends yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Search for users to add them as friends!
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friendship, idx) => (
                      <motion.div
                        key={friendship.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Card className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={friendship.friend?.profile_picture || undefined}
                              />
                              <AvatarFallback>
                                {friendship.friend?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">
                                  {friendship.friend?.username}
                                </span>
                                {friendship.friend?.is_premium && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  Lvl {friendship.friend?.level}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-primary" />
                                  {friendship.friend?.xp} XP
                                </span>
                                <span className="flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-orange-500" />
                                  {friendship.friend?.streak} day streak
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleSendEncouragement(friendship.friend?.id || "")
                                }
                              >
                                <MessageCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removeFriend(friendship.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Pending Requests */}
              <TabsContent value="requests">
                <div className="space-y-4">
                  {pendingRequests.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3">Pending Requests</h3>
                      <div className="space-y-2">
                        {pendingRequests.map((request) => (
                          <Card key={request.id} className="p-4">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage
                                  src={request.friend?.profile_picture || undefined}
                                />
                                <AvatarFallback>
                                  {request.friend?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {request.friend?.username}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  wants to be your friend
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAccept(request.id)}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(request.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {sentRequests.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-3">Sent Requests</h3>
                      <div className="space-y-2">
                        {sentRequests.map((request) => (
                          <Card key={request.id} className="p-4 opacity-75">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarImage
                                  src={request.friend?.profile_picture || undefined}
                                />
                                <AvatarFallback>
                                  {request.friend?.username?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {request.friend?.username}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  Request pending...
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {pendingRequests.length === 0 && sentRequests.length === 0 && (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No pending requests</p>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Compare Progress */}
              <TabsContent value="compare">
                {friends.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Add friends to compare progress!
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* Leaderboard style comparison */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          Friend Leaderboard
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[
                            ...(profile
                              ? [
                                  {
                                    id: user?.id,
                                    username: profile.username + " (You)",
                                    xp: profile.xp,
                                    streak: profile.streak,
                                    level: profile.level,
                                    isYou: true,
                                  },
                                ]
                              : []),
                            ...friends.map((f) => ({
                              id: f.friend?.id,
                              username: f.friend?.username,
                              xp: f.friend?.xp || 0,
                              streak: f.friend?.streak || 0,
                              level: f.friend?.level || 1,
                              isYou: false,
                            })),
                          ]
                            .sort((a, b) => b.xp - a.xp)
                            .map((person, idx) => (
                              <div
                                key={person.id}
                                className={cn(
                                  "flex items-center gap-4 p-3 rounded-lg",
                                  person.isYou
                                    ? "bg-primary/10 border border-primary/30"
                                    : "bg-muted/50"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                                    idx === 0
                                      ? "bg-yellow-500 text-black"
                                      : idx === 1
                                      ? "bg-gray-300 text-black"
                                      : idx === 2
                                      ? "bg-orange-400 text-black"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {idx + 1}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium">{person.username}</span>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Lvl {person.level}</span>
                                    <span className="flex items-center gap-1">
                                      <Flame className="w-3 h-3 text-orange-500" />
                                      {person.streak}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-primary">
                                    {person.xp.toLocaleString()} XP
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Friends;
