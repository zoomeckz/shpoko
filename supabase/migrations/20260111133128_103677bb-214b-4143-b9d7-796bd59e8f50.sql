-- Create table for user-owned skins
CREATE TABLE public.user_skins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skin_id TEXT NOT NULL,
  equipped BOOLEAN NOT NULL DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acquired_from TEXT DEFAULT 'purchase', -- 'purchase', 'gift', 'trade'
  gifted_by UUID,
  UNIQUE(user_id, skin_id)
);

-- Enable RLS
ALTER TABLE public.user_skins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_skins
CREATE POLICY "Users can view their own skins"
ON public.user_skins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skins"
ON public.user_skins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skins"
ON public.user_skins FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skins"
ON public.user_skins FOR DELETE
USING (auth.uid() = user_id);

-- Friends can see each other's skins for trading
CREATE POLICY "Friends can view each other's skins"
ON public.user_skins FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
    AND ((user_id = auth.uid() AND friend_id = user_skins.user_id)
      OR (friend_id = auth.uid() AND user_id = user_skins.user_id))
  )
);

-- Create table for skin trade requests
CREATE TABLE public.skin_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  sender_skin_id TEXT, -- NULL if it's a gift
  recipient_skin_id TEXT, -- NULL if sender is gifting
  trade_type TEXT NOT NULL DEFAULT 'trade', -- 'trade' or 'gift'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'cancelled'
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_trade CHECK (
    (trade_type = 'gift' AND sender_skin_id IS NOT NULL) OR
    (trade_type = 'trade' AND sender_skin_id IS NOT NULL AND recipient_skin_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.skin_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for skin_trades
CREATE POLICY "Users can view trades they're involved in"
ON public.skin_trades FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create trades as sender"
ON public.skin_trades FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update trades they're involved in"
ON public.skin_trades FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Senders can cancel their pending trades"
ON public.skin_trades FOR DELETE
USING (auth.uid() = sender_id AND status = 'pending');