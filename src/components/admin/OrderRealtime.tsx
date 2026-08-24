"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { SOURCE_LABELS } from "@/lib/admin/constants";
import { formatPrice } from "@/lib/utils/format";

/**
 * §12 - subscribe to orders INSERT, toast + soft chime.
 *
 * The chime is synthesised with the Web Audio API rather than shipped as
 * an audio file: it costs no bytes on a kitchen phone's mobile data, and
 * a short sine blip is exactly the "soft" the plan asks for. Browsers
 * block audio until the page has been interacted with, so a silent
 * failure here is expected and deliberately swallowed.
 */
function playChime() {
  try {
    const AudioCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const context = new AudioCtor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.5);
    oscillator.onended = () => context.close();
  } catch {
    // Autoplay policy or no audio device - the toast still lands.
  }
}

type NewOrder = {
  order_number: string | null;
  source: string;
  customer_name: string | null;
  total: number | null;
};

export function OrderRealtime() {
  const router = useRouter();
  // Keeps the subscription from re-registering on every router refresh.
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const supabase = createClient();
    const channel = supabase
      .channel("admin-orders-insert")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as NewOrder;
          playChime();
          toast.success("New order received", {
            description: [
              order.order_number,
              SOURCE_LABELS[order.source] ?? order.source,
              order.customer_name,
              order.total != null ? formatPrice(Number(order.total)) : null,
            ]
              .filter(Boolean)
              .join(" · "),
            duration: 10000,
          });
          // Pull the new row into whatever list is on screen.
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
