import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Leaf, ArrowLeft, Copy, Check, Heart, Trash2, Send } from "lucide-react";
import { toast } from "sonner";
import { MessageReaction } from "@/components/MessageReaction";

interface FriendMessage {
  id: string;
  friend_name: string;
  message: string;
  created_at: string;
}

interface MessageReactionRecord {
  message_id: string;
}

const Friends = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [reactions, setReactions] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [isSubmitMode, setIsSubmitMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [friendMessage, setFriendMessage] = useState("");
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [targetUserName, setTargetUserName] = useState<string>("");

  // Check if this is a friend submitting a message via invite link
  useEffect(() => {
    const forUserId = searchParams.get("for");
    if (forUserId) {
      setIsSubmitMode(true);
      setTargetUserId(forUserId);
      fetchTargetUserName(forUserId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isSubmitMode && !loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate, isSubmitMode]);

  useEffect(() => {
    if (user && !isSubmitMode) {
      fetchMessages();
      fetchReactions();
    }
  }, [user, isSubmitMode]);

  const fetchTargetUserName = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();
    
    if (data) {
      setTargetUserName(data.display_name || "your friend");
    }
  };

  const fetchMessages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("friend_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setMessages(data);
    }
  };

  const fetchReactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("message_reactions")
      .select("message_id")
      .eq("user_id", user.id);
    
    if (data) {
      setReactions(new Set(data.map((r: MessageReactionRecord) => r.message_id)));
    }
  };

  const getInviteLink = () => {
    if (!user) return "";
    return `${window.location.origin}/friends?for=${user.id}`;
  };

  const copyInviteLink = async () => {
    const link = getInviteLink();
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied! Share it with your friends.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitFriendMessage = async () => {
    if (!targetUserId || !friendName.trim() || !friendMessage.trim()) {
      toast.error("Please fill in your name and message.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("friend_messages").insert({
      user_id: targetUserId,
      friend_name: friendName.trim(),
      message: friendMessage.trim(),
    });

    setSubmitting(false);

    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      toast.success("Your message has been sent!");
      setFriendName("");
      setFriendMessage("");
    }
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase
      .from("friend_messages")
      .delete()
      .eq("id", id);

    if (!error) {
      setMessages(messages.filter((m) => m.id !== id));
      toast.success("Message deleted.");
    }
  };

  // Friend submission mode (no login required)
  if (isSubmitMode) {
    return (
      <div className="min-h-screen gradient-calm">
        <div className="flex flex-col min-h-screen px-6 py-8 max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground">Send Support</h1>
              <p className="text-sm text-muted-foreground">
                For {targetUserName}
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft mb-8 animate-float-up">
            <p className="text-foreground leading-relaxed">
              Your friend is working on improving their self-control. Your supportive message will appear when they need encouragement most — during moments of temptation.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4 animate-float-up delay-100">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Your name
              </label>
              <Input
                placeholder="e.g. Sarah"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Your supportive message
              </label>
              <Textarea
                placeholder="Write something encouraging... e.g. 'I believe in you! Remember how far you've come.'"
                value={friendMessage}
                onChange={(e) => setFriendMessage(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Keep it short, warm, and encouraging.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmitFriendMessage}
              disabled={submitting || !friendName.trim() || !friendMessage.trim()}
            >
              {submitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Your message will be shown anonymously during their moments of need.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-calm">
        <div className="animate-breathe">
          <Leaf className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  // Main friends management view
  return (
    <div className="min-h-screen gradient-calm">
      <div className="flex flex-col min-h-screen px-6 py-8 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display text-xl text-foreground">Friend Support</h1>
            <p className="text-sm text-muted-foreground">
              Invite friends to send you encouragement
            </p>
          </div>
        </div>

        {/* Invite Section */}
        <div className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft mb-6 animate-float-up">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-5 w-5 text-accent" />
            <h2 className="font-medium text-foreground">Invite Friends</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Share this link with friends. They can send you supportive messages that will appear during your emergency moments.
          </p>
          <div className="flex gap-2">
            <Input
              readOnly
              value={getInviteLink()}
              className="text-xs"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyInviteLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Messages Section */}
        <div className="animate-float-up delay-100">
          <h2 className="font-medium text-foreground mb-4">
            Messages from friends ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div className="p-6 rounded-2xl bg-card border border-border/50 text-center">
              <Heart className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No messages yet. Share your invite link to receive support!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-xl bg-card border border-border/50 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-foreground italic">"{msg.message}"</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        — {msg.friend_name}
                      </p>
                      {/* Reaction buttons */}
                      <MessageReaction
                        messageId={msg.id}
                        userId={user.id}
                        friendName={msg.friend_name}
                        hasReacted={reactions.has(msg.id)}
                        onReact={() => setReactions(new Set([...reactions, msg.id]))}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={() => deleteMessage(msg.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
