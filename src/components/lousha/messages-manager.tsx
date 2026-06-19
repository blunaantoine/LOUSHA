"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { toast } from "sonner";
import { Trash2, Mail, MailOpen, Send, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  replied: boolean;
  reply: string | null;
  createdAt: string;
}

export function MessagesManager() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingKey, setLoadingKey] = useState<number | null>(0);
  const [selected, setSelected] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/messages", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d) => {
        setMessages(d.messages || []);
        setLoadingKey((k) => (k ?? 0) + 1);
      })
      .catch(() => setLoadingKey((k) => (k ?? 0) + 1));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loading = loadingKey === 0;

  const handleOpen = async (msg: Message) => {
    setSelected(msg);
    setReplyText("");
    if (!msg.read) {
      await fetch(`/api/admin/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      load();
    }
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/messages/${selected.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Échec");
        return;
      }
      toast.success(lang === "fr" ? "Réponse envoyée par email" : "Reply sent by email");
      setSelected(null);
      setReplyText("");
      load();
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "fr" ? "Supprimer ce message ?" : "Delete this message?")) return;
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    toast.success(lang === "fr" ? "Message supprimé" : "Message deleted");
    if (selected?.id === id) setSelected(null);
    load();
  };

  if (loading) {
    return <div className="h-32 bg-secondary animate-pulse rounded-2xl" />;
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-2xl">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-serif text-xl text-muted-foreground">
          {lang === "fr" ? "Aucun message" : "No messages"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-colors",
            msg.read ? "border-border bg-background" : "border-accent/30 bg-accent/5 hover:bg-accent/10"
          )}
          onClick={() => handleOpen(msg)}
        >
          <span className={cn("shrink-0", msg.read ? "text-muted-foreground" : "text-accent")}>
            {msg.read ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-sans font-medium text-sm truncate">{msg.name}</p>
              {msg.replied && (
                <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[9px] tracking-luxe-sm uppercase">
                  {lang === "fr" ? "Répondu" : "Replied"}
                </span>
              )}
              {!msg.read && (
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] tracking-luxe-sm uppercase">
                  {lang === "fr" ? "Nouveau" : "New"}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{msg.message}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">
            {new Date(msg.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "2-digit", month: "short" })}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
            className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      {/* Modal de réponse */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-background rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto scroll-elegant">
            <div className="sticky top-0 flex items-center justify-between px-6 h-16 border-b border-border bg-background z-10">
              <h2 className="font-serif text-xl">{lang === "fr" ? "Message" : "Message"}</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:opacity-60">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground">De</p>
                <p className="font-sans font-medium">{selected.name} <span className="text-muted-foreground">({selected.email})</span></p>
              </div>
              <div>
                <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{lang === "fr" ? "Message" : "Message"}</p>
                <div className="p-4 bg-secondary/40 rounded-xl text-sm leading-relaxed">{selected.message}</div>
              </div>
              {selected.reply && (
                <div>
                  <p className="text-[10px] tracking-luxe-sm uppercase text-green-600 mb-1">{lang === "fr" ? "Votre réponse" : "Your reply"}</p>
                  <div className="p-4 bg-green-50 rounded-xl text-sm leading-relaxed">{selected.reply}</div>
                </div>
              )}
              {!selected.replied && (
                <div>
                  <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{lang === "fr" ? "Répondre" : "Reply"}</p>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-background border border-border px-3 py-2 text-sm rounded-xl focus:outline-none focus:border-accent resize-none"
                    placeholder={lang === "fr" ? "Votre réponse..." : "Your reply..."}
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-3 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {lang === "fr" ? "Envoyer la réponse" : "Send reply"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
