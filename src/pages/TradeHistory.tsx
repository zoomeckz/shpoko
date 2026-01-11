import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRightLeft, Gift, Clock, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Sidebar } from "@/components/duolingo/Sidebar";
import { TopBar } from "@/components/duolingo/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SHOP_ITEMS } from "@/hooks/useShopItems";
import { format } from "date-fns";

interface TradeHistoryItem {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_skin_id: string | null;
  recipient_skin_id: string | null;
  trade_type: "trade" | "gift";
  status: "accepted" | "declined" | "cancelled";
  message: string | null;
  created_at: string;
  responded_at: string | null;
  sender_profile?: { username: string; profile_picture: string | null };
  recipient_profile?: { username: string; profile_picture: string | null };
}

const TradeHistory = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "trade" | "gift">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "accepted" | "declined" | "cancelled">("all");

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("skin_trades")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .neq("status", "pending")
        .order("responded_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error("Error fetching trade history:", error);
        setLoading(false);
        return;
      }

      // Fetch profiles
      const userIds = [...new Set((data || []).flatMap(t => [t.sender_id, t.recipient_id]))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, username, profile_picture")
          .in("id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const tradesWithProfiles = (data || []).map(trade => ({
          ...trade,
          trade_type: trade.trade_type as "trade" | "gift",
          status: trade.status as "accepted" | "declined" | "cancelled",
          sender_profile: profileMap.get(trade.sender_id),
          recipient_profile: profileMap.get(trade.recipient_id),
        }));

        setTrades(tradesWithProfiles);
      } else {
        setTrades([]);
      }
      setLoading(false);
    };

    fetchTradeHistory();
  }, [user]);

  const getSkinDetails = (skinId: string) => {
    return SHOP_ITEMS.find(item => item.id === skinId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "declined":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Accepted</Badge>;
      case "declined":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Declined</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "from-amber-400 to-orange-500";
      case "epic": return "from-purple-400 to-pink-500";
      case "rare": return "from-blue-400 to-cyan-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  // Filter trades
  const filteredTrades = trades.filter(trade => {
    // Filter by type
    if (filterType !== "all" && trade.trade_type !== filterType) return false;
    
    // Filter by status
    if (filterStatus !== "all" && trade.status !== filterStatus) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const senderName = trade.sender_profile?.username.toLowerCase() || "";
      const recipientName = trade.recipient_profile?.username.toLowerCase() || "";
      const senderSkin = getSkinDetails(trade.sender_skin_id || "")?.name.toLowerCase() || "";
      const recipientSkin = getSkinDetails(trade.recipient_skin_id || "")?.name.toLowerCase() || "";
      
      return senderName.includes(query) || recipientName.includes(query) || 
             senderSkin.includes(query) || recipientSkin.includes(query);
    }
    
    return true;
  });

  const renderTradeCard = (trade: TradeHistoryItem) => {
    const isSender = trade.sender_id === user?.id;
    const senderSkin = trade.sender_skin_id ? getSkinDetails(trade.sender_skin_id) : null;
    const recipientSkin = trade.recipient_skin_id ? getSkinDetails(trade.recipient_skin_id) : null;

    return (
      <motion.div
        key={trade.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {trade.trade_type === "gift" ? (
              <Gift className="w-5 h-5 text-pink-500" />
            ) : (
              <ArrowRightLeft className="w-5 h-5 text-primary" />
            )}
            <span className="font-semibold capitalize">{trade.trade_type}</span>
            {getStatusBadge(trade.status)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {trade.responded_at ? format(new Date(trade.responded_at), "MMM d, yyyy 'at' h:mm a") : "N/A"}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sender */}
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {isSender ? "You sent" : `${trade.sender_profile?.username || "Unknown"} sent`}
            </p>
            {senderSkin && (
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getRarityColor(senderSkin.rarity || "common")} p-0.5`}>
                  <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                    <img src={senderSkin.image} alt={senderSkin.name} className="w-12 h-12 object-contain" />
                  </div>
                </div>
                <p className="text-sm font-medium mt-1">{senderSkin.name}</p>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex flex-col items-center gap-1">
            {getStatusIcon(trade.status)}
            {trade.trade_type === "trade" ? (
              <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
            ) : (
              <Gift className="w-6 h-6 text-pink-500" />
            )}
          </div>

          {/* Recipient */}
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {!isSender ? "You received" : `${trade.recipient_profile?.username || "Unknown"} received`}
            </p>
            {trade.trade_type === "trade" && recipientSkin ? (
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getRarityColor(recipientSkin.rarity || "common")} p-0.5`}>
                  <div className="w-full h-full bg-background rounded-lg flex items-center justify-center">
                    <img src={recipientSkin.image} alt={recipientSkin.name} className="w-12 h-12 object-contain" />
                  </div>
                </div>
                <p className="text-sm font-medium mt-1">{recipientSkin.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center">
                  <Gift className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Gift</p>
              </div>
            )}
          </div>
        </div>

        {trade.message && (
          <div className="mt-4 p-3 bg-accent/50 rounded-lg">
            <p className="text-sm text-muted-foreground">"{trade.message}"</p>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link to="/shop">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Trade History</h1>
            <p className="text-muted-foreground">View all your completed trades and gifts</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or skin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="trade">Trades</SelectItem>
                <SelectItem value="gift">Gifts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-500">
                {trades.filter(t => t.status === "accepted").length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-pink-500">
                {trades.filter(t => t.trade_type === "gift" && t.status === "accepted").length}
              </p>
              <p className="text-xs text-muted-foreground">Gifts Sent/Received</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {trades.filter(t => t.trade_type === "trade" && t.status === "accepted").length}
              </p>
              <p className="text-xs text-muted-foreground">Trades Completed</p>
            </div>
          </motion.div>

          {/* Trade List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-4">Loading history...</p>
            </div>
          ) : filteredTrades.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <ArrowRightLeft className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No trade history found</p>
              <p className="text-muted-foreground">
                {searchQuery || filterType !== "all" || filterStatus !== "all" 
                  ? "Try adjusting your filters"
                  : "Start trading with friends to see your history here!"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredTrades.map((trade, index) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {renderTradeCard(trade)}
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TradeHistory;
