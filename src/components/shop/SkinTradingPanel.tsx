import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Gift, ArrowLeftRight, Users, Send, Check, X, 
  ChevronRight, Sparkles, Clock, UserCircle, History 
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSkinTrading, type FriendWithSkins, type SkinTrade } from "@/hooks/useSkinTrading";
import { useShopItems, type ShopItem } from "@/hooks/useShopItems";
import { useToast } from "@/hooks/use-toast";
import { ProfilePicture } from "@/components/ProfilePictureSelector";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface SkinTradingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkinTradingPanel = ({ isOpen, onClose }: SkinTradingPanelProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getRarityBadge } = useShopItems();
  const {
    userSkins,
    pendingTrades,
    friendsWithSkins,
    loading,
    sendGift,
    proposeTrade,
    acceptTrade,
    declineTrade,
    cancelTrade,
    getSkinDetails,
  } = useSkinTrading();

  const [activeTab, setActiveTab] = useState("pending");
  const [selectedFriend, setSelectedFriend] = useState<FriendWithSkins | null>(null);
  const [tradeMode, setTradeMode] = useState<"gift" | "trade">("gift");
  const [selectedMySkin, setSelectedMySkin] = useState<string | null>(null);
  const [selectedTheirSkin, setSelectedTheirSkin] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState("");

  const incomingTrades = pendingTrades.filter(t => t.recipient_id === user?.id);
  const outgoingTrades = pendingTrades.filter(t => t.sender_id === user?.id);

  const handleSendGift = async () => {
    if (!selectedFriend || !selectedMySkin) return;

    const result = await sendGift(selectedFriend.id, selectedMySkin, giftMessage || undefined);
    
    if (result.success) {
      toast({
        title: "Gift Sent! 🎁",
        description: `Your gift is on its way to ${selectedFriend.username}!`,
      });
      resetSelection();
    } else {
      toast({
        title: "Failed to Send Gift",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleProposeTrade = async () => {
    if (!selectedFriend || !selectedMySkin || !selectedTheirSkin) return;

    const result = await proposeTrade(
      selectedFriend.id, 
      selectedMySkin, 
      selectedTheirSkin,
      giftMessage || undefined
    );
    
    if (result.success) {
      toast({
        title: "Trade Proposed! 🔄",
        description: `Trade request sent to ${selectedFriend.username}!`,
      });
      resetSelection();
    } else {
      toast({
        title: "Failed to Propose Trade",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleAcceptTrade = async (trade: SkinTrade) => {
    const result = await acceptTrade(trade.id);
    
    if (result.success) {
      const isGift = trade.trade_type === "gift";
      toast({
        title: isGift ? "Gift Received! 🎁" : "Trade Complete! 🔄",
        description: isGift 
          ? "Check your collection for your new skin!"
          : "Skins have been swapped successfully!",
      });
    } else {
      toast({
        title: "Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleDeclineTrade = async (trade: SkinTrade) => {
    const result = await declineTrade(trade.id);
    
    if (result.success) {
      toast({
        title: "Declined",
        description: trade.trade_type === "gift" ? "Gift declined" : "Trade declined",
      });
    }
  };

  const handleCancelTrade = async (trade: SkinTrade) => {
    const result = await cancelTrade(trade.id);
    
    if (result.success) {
      toast({
        title: "Cancelled",
        description: "Trade request cancelled",
      });
    }
  };

  const resetSelection = () => {
    setSelectedFriend(null);
    setSelectedMySkin(null);
    setSelectedTheirSkin(null);
    setGiftMessage("");
  };

  const renderSkinCard = (skinId: string, small = false) => {
    const skin = getSkinDetails(skinId);
    if (!skin) return null;

    return (
      <div className={cn(
        "rounded-lg overflow-hidden bg-accent/50 border",
        small ? "w-12 h-12" : "w-16 h-16"
      )}>
        {skin.image ? (
          <img src={skin.image} alt={skin.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {skin.icon}
          </div>
        )}
      </div>
    );
  };

  const renderTradeCard = (trade: SkinTrade, isIncoming: boolean) => {
    const senderSkin = trade.sender_skin_id ? getSkinDetails(trade.sender_skin_id) : null;
    const recipientSkin = trade.recipient_skin_id ? getSkinDetails(trade.recipient_skin_id) : null;
    const profile = isIncoming ? trade.sender_profile : trade.recipient_profile;

    return (
      <motion.div
        key={trade.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-accent/30 rounded-xl border"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <ProfilePicture pictureId={profile?.profile_picture} size="sm" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{profile?.username || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            {trade.trade_type === "gift" ? (
              <><Gift className="w-3 h-3" /> Gift</>
            ) : (
              <><ArrowLeftRight className="w-3 h-3" /> Trade</>
            )}
          </Badge>
        </div>

        {/* Skins display */}
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="text-center">
            {renderSkinCard(trade.sender_skin_id!)}
            <p className="text-xs mt-1 font-medium">{senderSkin?.name}</p>
          </div>
          {trade.trade_type === "trade" && (
            <>
              <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
              <div className="text-center">
                {renderSkinCard(trade.recipient_skin_id!)}
                <p className="text-xs mt-1 font-medium">{recipientSkin?.name}</p>
              </div>
            </>
          )}
        </div>

        {trade.message && (
          <p className="text-sm text-muted-foreground italic mb-3">"{trade.message}"</p>
        )}

        {/* Actions */}
        {isIncoming ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 gap-1"
              onClick={() => handleAcceptTrade(trade)}
              disabled={loading}
            >
              <Check className="w-4 h-4" /> Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1"
              onClick={() => handleDeclineTrade(trade)}
              disabled={loading}
            >
              <X className="w-4 h-4" /> Decline
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="w-full gap-1 text-muted-foreground"
            onClick={() => handleCancelTrade(trade)}
            disabled={loading}
          >
            <X className="w-4 h-4" /> Cancel Request
          </Button>
        )}
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Skin Trading
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Gift skins to friends or propose trades</span>
            <Link 
              to="/trade-history" 
              onClick={onClose}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <History className="w-3 h-3" />
              View History
            </Link>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="relative">
              <Clock className="w-4 h-4 mr-1" />
              Pending
              {incomingTrades.length > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold"
                >
                  {incomingTrades.length}
                </motion.span>
              )}
            </TabsTrigger>
            <TabsTrigger value="gift">
              <Gift className="w-4 h-4 mr-1" />
              Gift
            </TabsTrigger>
            <TabsTrigger value="trade">
              <ArrowLeftRight className="w-4 h-4 mr-1" />
              Trade
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            {/* Pending Tab */}
            <TabsContent value="pending" className="m-0 space-y-4">
              {incomingTrades.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Incoming ({incomingTrades.length})
                  </h3>
                  <div className="space-y-3">
                    {incomingTrades.map(trade => renderTradeCard(trade, true))}
                  </div>
                </div>
              )}
              
              {outgoingTrades.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Send className="w-4 h-4" />
                    Sent ({outgoingTrades.length})
                  </h3>
                  <div className="space-y-3">
                    {outgoingTrades.map(trade => renderTradeCard(trade, false))}
                  </div>
                </div>
              )}

              {pendingTrades.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending trades</p>
                </div>
              )}
            </TabsContent>

            {/* Gift Tab */}
            <TabsContent value="gift" className="m-0">
              <AnimatePresence mode="wait">
                {!selectedFriend ? (
                  <motion.div
                    key="friends"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="text-sm font-medium mb-3">Select a friend to gift</h3>
                    {friendsWithSkins.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Add friends to start gifting!</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {friendsWithSkins.map(friend => (
                          <button
                            key={friend.id}
                            onClick={() => {
                              setSelectedFriend(friend);
                              setTradeMode("gift");
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                              <ProfilePicture pictureId={friend.profile_picture} size="sm" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium">{friend.username}</p>
                              <p className="text-xs text-muted-foreground">
                                {friend.skins.length} skins
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="select-skin"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetSelection}
                      className="mb-3"
                    >
                      ← Back
                    </Button>

                    <h3 className="text-sm font-medium mb-3">
                      Gift to {selectedFriend.username}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Select skin to gift</p>
                        <div className="grid grid-cols-4 gap-2">
                          {userSkins.map(skin => {
                            const details = getSkinDetails(skin.skin_id);
                            if (!details) return null;
                            return (
                              <button
                                key={skin.id}
                                onClick={() => setSelectedMySkin(skin.skin_id)}
                                className={cn(
                                  "p-2 rounded-lg border-2 transition-all",
                                  selectedMySkin === skin.skin_id
                                    ? "border-primary bg-primary/10"
                                    : "border-transparent hover:border-muted-foreground/30"
                                )}
                              >
                                {renderSkinCard(skin.skin_id, true)}
                              </button>
                            );
                          })}
                        </div>
                        {userSkins.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No skins to gift yet
                          </p>
                        )}
                      </div>

                      <Textarea
                        placeholder="Add a message (optional)"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />

                      <Button
                        className="w-full gap-2"
                        onClick={handleSendGift}
                        disabled={!selectedMySkin || loading}
                      >
                        <Gift className="w-4 h-4" />
                        Send Gift
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Trade Tab */}
            <TabsContent value="trade" className="m-0">
              <AnimatePresence mode="wait">
                {!selectedFriend ? (
                  <motion.div
                    key="friends"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h3 className="text-sm font-medium mb-3">Select a friend to trade with</h3>
                    {friendsWithSkins.filter(f => f.skins.length > 0).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No friends with skins to trade</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {friendsWithSkins.filter(f => f.skins.length > 0).map(friend => (
                          <button
                            key={friend.id}
                            onClick={() => {
                              setSelectedFriend(friend);
                              setTradeMode("trade");
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                          >
                            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                              <ProfilePicture pictureId={friend.profile_picture} size="sm" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium">{friend.username}</p>
                              <div className="flex gap-1 mt-1">
                                {friend.skins.slice(0, 3).map(s => (
                                  <div key={s.id} className="w-6 h-6 rounded overflow-hidden">
                                    {renderSkinCard(s.skin_id, true)}
                                  </div>
                                ))}
                                {friend.skins.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{friend.skins.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="select-skins"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetSelection}
                      className="mb-3"
                    >
                      ← Back
                    </Button>

                    <h3 className="text-sm font-medium mb-3">
                      Trade with {selectedFriend.username}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Your skin to offer</p>
                        <div className="grid grid-cols-4 gap-2">
                          {userSkins.map(skin => (
                            <button
                              key={skin.id}
                              onClick={() => setSelectedMySkin(skin.skin_id)}
                              className={cn(
                                "p-2 rounded-lg border-2 transition-all",
                                selectedMySkin === skin.skin_id
                                  ? "border-primary bg-primary/10"
                                  : "border-transparent hover:border-muted-foreground/30"
                              )}
                            >
                              {renderSkinCard(skin.skin_id, true)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Their skin you want</p>
                        <div className="grid grid-cols-4 gap-2">
                          {selectedFriend.skins.map(skin => (
                            <button
                              key={skin.id}
                              onClick={() => setSelectedTheirSkin(skin.skin_id)}
                              className={cn(
                                "p-2 rounded-lg border-2 transition-all",
                                selectedTheirSkin === skin.skin_id
                                  ? "border-primary bg-primary/10"
                                  : "border-transparent hover:border-muted-foreground/30"
                              )}
                            >
                              {renderSkinCard(skin.skin_id, true)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Textarea
                        placeholder="Add a message (optional)"
                        value={giftMessage}
                        onChange={(e) => setGiftMessage(e.target.value)}
                        className="resize-none"
                        rows={2}
                      />

                      <Button
                        className="w-full gap-2"
                        onClick={handleProposeTrade}
                        disabled={!selectedMySkin || !selectedTheirSkin || loading}
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        Propose Trade
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
