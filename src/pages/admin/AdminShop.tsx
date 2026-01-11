import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ShoppingBag, ArrowLeftRight, Gift, TrendingUp, Check, X, Clock } from "lucide-react";

export default function AdminShop() {
  const queryClient = useQueryClient();

  // Fetch skin trades
  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ["admin-skin-trades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skin_trades")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch streak freeze transactions
  const { data: freezeTransactions } = useQuery({
    queryKey: ["admin-freeze-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streak_freeze_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Trade stats
  const tradeStats = {
    total: trades?.length || 0,
    pending: trades?.filter(t => t.status === "pending").length || 0,
    completed: trades?.filter(t => t.status === "accepted").length || 0,
    declined: trades?.filter(t => t.status === "declined").length || 0,
  };

  return (
    <AdminLayout title="Shop Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shop & Trading Management</h1>
          <p className="text-muted-foreground">
            Monitor trades, purchases, and shop activity
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ArrowLeftRight className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Trades</p>
                  <p className="text-2xl font-bold">{tradeStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{tradeStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{tradeStats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <X className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Declined</p>
                  <p className="text-2xl font-bold">{tradeStats.declined}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trades">
          <TabsList>
            <TabsTrigger value="trades">Skin Trades</TabsTrigger>
            <TabsTrigger value="freezes">Streak Freezes</TabsTrigger>
          </TabsList>

          <TabsContent value="trades">
            <TradesSection trades={trades} isLoading={tradesLoading} />
          </TabsContent>

          <TabsContent value="freezes">
            <FreezesSection transactions={freezeTransactions} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function TradesSection({ trades, isLoading }: { trades: any[] | undefined; isLoading: boolean }) {
  const queryClient = useQueryClient();

  const updateTradeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("skin_trades")
        .update({ status, responded_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-skin-trades"] });
      toast.success("Trade updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteTradeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("skin_trades")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-skin-trades"] });
      toast.success("Trade deleted");
    },
    onError: (error) => toast.error(error.message),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "accepted":
        return "bg-green-500/20 text-green-500";
      case "declined":
        return "bg-red-500/20 text-red-500";
      case "cancelled":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skin Trades</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sender Skin</TableHead>
                <TableHead>Recipient Skin</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades?.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-mono text-xs">
                    {trade.sender_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {trade.recipient_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs ${
                      trade.trade_type === "gift"
                        ? "bg-purple-500/20 text-purple-500"
                        : "bg-blue-500/20 text-blue-500"
                    }`}>
                      {trade.trade_type}
                    </span>
                  </TableCell>
                  <TableCell>{trade.sender_skin_id || "-"}</TableCell>
                  <TableCell>{trade.recipient_skin_id || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs ${getStatusBadge(trade.status)}`}>
                      {trade.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(trade.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {trade.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTradeMutation.mutate({ id: trade.id, status: "accepted" })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateTradeMutation.mutate({ id: trade.id, status: "declined" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this trade?")) {
                          deleteTradeMutation.mutate(trade.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function FreezesSection({ transactions }: { transactions: any[] | undefined }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Streak Freeze Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>XP Cost</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-xs">
                  {tx.user_id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-xs ${
                    tx.transaction_type === "purchase"
                      ? "bg-green-500/20 text-green-500"
                      : tx.transaction_type === "use"
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-blue-500/20 text-blue-500"
                  }`}>
                    {tx.transaction_type}
                  </span>
                </TableCell>
                <TableCell>{tx.amount}</TableCell>
                <TableCell>{tx.xp_cost || "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(tx.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
