"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const WHATSAPP_NUMBER = "22896692972";

export function WhatsAppWidget() {
  const { lang } = useStore();
  const t = useDict(lang);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 transition-all duration-500",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      {/* Popup card */}
      <div
        className={cn(
          "w-[300px] sm:w-[340px] bg-background border border-border shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right",
          open
            ? "scale-100 opacity-100"
            : "scale-90 opacity-0 pointer-events-none"
        )}
      >
        <div className="bg-[#075E54] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-serif text-lg">
              L
            </div>
            <div>
              <p className="font-serif text-base leading-tight">Lousha</p>
              <p className="text-[11px] text-white/80">
                {lang === "fr" ? "En ligne" : "Online"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 hover:bg-white/10 rounded transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div
          className="p-4"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        >
          <div className="bg-background shadow-sm border border-border p-3 rounded-lg rounded-tl-none max-w-[85%]">
            <p className="text-sm text-foreground font-light">
              {t.whatsapp.label} 👋
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {lang === "fr"
                ? "Réponse généralement sous 1h."
                : "Usually replies within 1 hour."}
            </p>
          </div>
        </div>
        <div className="p-3 bg-background border-t border-border flex gap-2">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-[#1eb858] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {t.contact.whatsapp}
          </a>
          <button
            onClick={() => router.push("/contact")}
            className="px-3 border border-border text-foreground hover:bg-secondary transition text-[12px] tracking-luxe-sm uppercase font-sans"
          >
            {t.nav.contact}
          </button>
        </div>
      </div>

      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="WhatsApp"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-60" />
        )}
        <span className="relative">
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 fill-current"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
