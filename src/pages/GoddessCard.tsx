import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  Phone, Mail, MessageCircle, Share2, X, Sun, Moon,
  Globe, ChevronDown, Download, ExternalLink, ZoomIn
} from "lucide-react";
import goddessPhoto from "@/assets/goddess-itopia.png";
import ubuntuLogo from "@/assets/ubuntu-logo.png";
import kailashLogo from "@/assets/mount-kailash-logo-green.png";

const CARD_URL = "https://caribbean-source-flow.lovable.app/goddess";

// ─── Photo Lightbox ──────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.img
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          src={src}
          alt="Goddess R Itopia Archer"
          className="max-w-full max-h-full rounded-2xl object-cover shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── QR Lightbox ─────────────────────────────────────────────────────────────
function QRLightbox({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-sm p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
          className="flex flex-col items-center gap-5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5 bg-white rounded-2xl shadow-2xl">
            <QRCodeSVG
              value={CARD_URL}
              size={280}
              level="H"
              imageSettings={{
                src: kailashLogo,
                x: undefined,
                y: undefined,
                height: 52,
                width: 52,
                excavate: true,
              }}
            />
          </div>
          <p className="text-white/80 text-[14px] text-center font-medium tracking-wide">
            Point your camera here to open this card
          </p>
          <p className="text-white/40 text-[11px] text-center break-all">{CARD_URL}</p>
        </motion.div>
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X size={20} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── vCard builder ───────────────────────────────────────────────────────────
function downloadVCard() {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "FN:Goddess R Itopia Archer",
    "N:Archer;Goddess R Itopia;;;",
    "ORG:Mount Kailash Rejuvenation Centre",
    "TITLE:Managing Director",
    "TEL;TYPE=CELL,PREF:+13059429407",
    "TEL;TYPE=CELL:+17582855195",
    "EMAIL;TYPE=WORK:goddessitopia@mountkailashslu.com",
    "EMAIL;TYPE=WORK:goddessitopia@theubuntumovement.com",
    "URL:https://mountkailashslu.com",
    "END:VCARD",
  ].join("\r\n");

  const blob = new Blob([vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "goddess-itopia-archer.vcf";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Quick Action Button ─────────────────────────────────────────────────────
function ActionBtn({
  icon,
  label,
  href,
  onClick,
  color,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
  iconBg: string;
}) {
  const cls = `flex flex-col items-center gap-1.5 flex-1 py-3 px-1 rounded-2xl border transition-all duration-200 active:scale-95 ${color}`;
  const inner = (
    <>
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</span>
      <span className="text-[11px] font-semibold tracking-wide leading-none">{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

// ─── Role Card ───────────────────────────────────────────────────────────────
function RoleCard({
  badge,
  badgeColor,
  title,
  org,
  tagline,
  email,
  logo,
  gradient,
}: {
  badge: string;
  badgeColor: string;
  title: string;
  org: string;
  tagline: string;
  email?: string;
  logo: string;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative rounded-2xl p-5 overflow-hidden ${gradient} shadow-md`}
    >
      <img
        src={logo}
        alt={org}
        className="absolute top-4 right-4 w-12 h-12 object-contain opacity-80"
      />
      <span className={`inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-3 ${badgeColor}`}>
        {badge}
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1a1a2e]/60 mb-0.5">
        {title}
      </p>
      <h3 className="font-bold text-[15px] text-[#1a1a2e] leading-snug mb-2">{org}</h3>
      <p className="text-[13px] italic text-[#1a1a2e]/70 leading-relaxed mb-2">
        "{tagline}"
      </p>
      {email && (
        <a
          href={`mailto:${email}`}
          className="text-[11px] text-[#1a1a2e]/60 underline underline-offset-2 break-all hover:text-[#1a1a2e] transition-colors"
        >
          {email}
        </a>
      )}
    </motion.div>
  );
}

// ─── Contact Row ─────────────────────────────────────────────────────────────
function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 transition-colors group"
    >
      <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#C8A84E] group-hover:bg-[#C8A84E]/20 transition-colors">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">{label}</p>
        <p className="text-[13px] font-medium break-all leading-snug">{value}</p>
      </div>
      <ExternalLink size={13} className="ml-auto flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" />
    </a>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function GoddessCard() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("goddess-card-theme");
      if (stored) return stored === "dark";
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qrLightboxOpen, setQrLightboxOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("goddess-card-theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Goddess R Itopia Archer",
          text: "Digital Business Card — Managing Director, Mount Kailash Rejuvenation Centre",
          url: CARD_URL,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(CARD_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const bg = isDark ? "bg-[#0e0e16] text-white" : "bg-[#f4f0e8] text-[#1a1a2e]";
  const cardBg = isDark ? "bg-[#16161d]" : "bg-white";
  const borderColor = isDark ? "border-white/10" : "border-[#1a1a2e]/10";
  const mutedText = isDark ? "text-white/60" : "text-[#1a1a2e]/60";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`} style={{ fontFamily: "'Inter', sans-serif" }}>
      {lightboxOpen && <Lightbox src={goddessPhoto} onClose={() => setLightboxOpen(false)} />}
      {qrLightboxOpen && <QRLightbox onClose={() => setQrLightboxOpen(false)} />}

      <div className="mx-auto max-w-[480px] min-h-screen flex flex-col">

        {/* ── HERO ── */}
        <div
          className="relative overflow-hidden pt-8 pb-10 px-6 flex flex-col items-center text-white"
          style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #2c2c4a 60%, #1F3A2E 100%)" }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(200,168,78,0.18) 0%, transparent 65%)" }}
          />

          <button
            onClick={() => setIsDark(!isDark)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", damping: 16 }}
            onClick={() => setLightboxOpen(true)}
            className="relative mb-5 focus:outline-none"
            aria-label="View full photo"
          >
            <div
              className="w-[192px] h-[192px] rounded-full p-[3px] shadow-2xl"
              style={{ background: "linear-gradient(135deg, #E67E22, #C8A84E 40%, #2D5A4A 100%)" }}
            >
              <img
                src={goddessPhoto}
                alt="Goddess R Itopia Archer"
                className="w-full h-full rounded-full object-cover object-top"
              />
            </div>
            <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            </div>
          </motion.button>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[26px] font-bold text-center leading-tight mb-1"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Goddess R Itopia Archer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[13px] text-white/70 text-center tracking-wide"
          >
            Sovereign Matriarch · Community Transformer · Healer
          </motion.p>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className={`mx-4 -mt-5 relative z-10 rounded-2xl shadow-xl border ${borderColor} ${cardBg} p-3 flex gap-2`}>
          <ActionBtn
            icon={<Phone size={18} className="text-emerald-500" />}
            label="Call"
            href="tel:+13059429407"
            iconBg="bg-emerald-500/10"
            color={isDark ? "border-white/10 text-white hover:bg-white/5" : "border-[#1a1a2e]/10 text-[#1a1a2e] hover:bg-[#1a1a2e]/5"}
          />
          <ActionBtn
            icon={<Mail size={18} className="text-[#C8A84E]" />}
            label="Email"
            href="mailto:goddessitopia@mountkailashslu.com"
            iconBg="bg-[#C8A84E]/10"
            color={isDark ? "border-white/10 text-white hover:bg-white/5" : "border-[#1a1a2e]/10 text-[#1a1a2e] hover:bg-[#1a1a2e]/5"}
          />
          <ActionBtn
            icon={<MessageCircle size={18} className="text-green-500" />}
            label="WhatsApp"
            href="https://wa.me/13059429407"
            iconBg="bg-green-500/10"
            color={isDark ? "border-white/10 text-white hover:bg-white/5" : "border-[#1a1a2e]/10 text-[#1a1a2e] hover:bg-[#1a1a2e]/5"}
          />
          <ActionBtn
            icon={<Share2 size={18} className="text-[#E67E22]" />}
            label={copied ? "Copied!" : "Share"}
            onClick={handleShare}
            iconBg="bg-[#E67E22]/10"
            color={isDark ? "border-white/10 text-white hover:bg-white/5" : "border-[#1a1a2e]/10 text-[#1a1a2e] hover:bg-[#1a1a2e]/5"}
          />
        </div>

        {/* ── BIO ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mx-4 mt-4 rounded-2xl p-6 border ${borderColor} ${cardBg}`}
        >
          <div
            className="space-y-5 text-[17px] leading-[1.85] font-light"
            style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", letterSpacing: "0.01em" }}
          >
            <p>
              Goddess R. Itopia Archer is a <strong className="font-semibold">Sovereign Matriarch</strong> — a visionary leader devoted to community
              transformation, sacred feminine empowerment, and generational legacy-building.
            </p>
            <p>
              As Founder of The Ubuntu Movement, Managing Director of Mount Kailash Rejuvenation Centre, and Academic
              Coordinator of Mount Kailash Herbal School of Esoteric Knowledge, she architects spaces where wellness,
              education, culture, and economic empowerment converge — bridging ancient wisdom with modern strategy to guide
              youth, women, and families into self-mastery and collective elevation.
            </p>
            <blockquote
              className="text-[19px] italic font-normal pl-4 py-1"
              style={{ borderLeft: "2px solid #C8A84E", color: isDark ? "#C8A84E" : "#1F3A2E" }}
            >
              "She does not simply lead initiatives — she cultivates ecosystems."
            </blockquote>
          </div>
        </motion.section>

        {/* ── ROLES ── */}
        <section className="px-4 mt-6">
          <p className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-3 ${mutedText}`}>
            Roles & Organizations
          </p>
          <div className="space-y-3">
            <RoleCard
              badge="Community"
              badgeColor="bg-[#E67E22]/20 text-[#b35a08]"
              title="Founder & President"
              org="The Ubuntu Movement"
              tagline={'I am because we are" — The African philosophy of interconnectedness.'}
              email="goddessitopia@theubuntumovement.com"
              logo={ubuntuLogo}
              gradient="bg-gradient-to-br from-[#FFF3E0] to-[#FFE0B2]"
            />
            <RoleCard
              badge="Commerce"
              badgeColor="bg-[#2D5A4A]/20 text-[#1F3A2E]"
              title="Managing Director"
              org="Mount Kailash Rejuvenation Centre"
              tagline="Nature's answer for optimum health and well being — Established 1977"
              logo={kailashLogo}
              gradient="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]"
            />
            <RoleCard
              badge="Education"
              badgeColor="bg-[#C8A84E]/20 text-[#7a5c00]"
              title="Academic Coordinator"
              org="Mount Kailash Herbal School of Esoteric Knowledge"
              tagline="Bridging ancient wisdom with modern herbal medicine training"
              logo={kailashLogo}
              gradient="bg-gradient-to-br from-[#FFFDE7] to-[#FFF9C4]"
            />
          </div>
        </section>

        {/* ── CONTACT ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mx-4 mt-6 rounded-2xl border ${borderColor} overflow-hidden`}
          style={{ background: isDark ? "rgba(26,26,46,0.8)" : "rgba(255,255,255,0.8)" }}
        >
          <div className={`px-4 py-3 border-b ${borderColor}`}>
            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${mutedText}`}>Contact</p>
          </div>
          <ContactRow icon={<Phone size={15} />} label="US / Main" value="+1 (305) 942-9407" href="tel:+13059429407" />
          <div className={`border-t ${borderColor}`} />
          <ContactRow icon={<Phone size={15} />} label="Saint Lucia" value="+1 (758) 285-5195" href="tel:+17582855195" />
          <div className={`border-t ${borderColor}`} />
          <ContactRow icon={<Mail size={15} />} label="Ubuntu Movement" value="goddessitopia@theubuntumovement.com" href="mailto:goddessitopia@theubuntumovement.com" />
          <div className={`border-t ${borderColor}`} />
          <ContactRow icon={<Mail size={15} />} label="Mount Kailash" value="goddessitopia@mountkailashslu.com" href="mailto:goddessitopia@mountkailashslu.com" />
          <div className={`border-t ${borderColor}`} />
          <ContactRow icon={<Globe size={15} />} label="Website" value="mountkailashslu.com" href="https://mountkailashslu.com" />
        </motion.section>

        {/* ── CTAs ── */}
        <section className="px-4 mt-6 space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={downloadVCard}
            className="w-full py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2 text-white transition-all shadow-lg"
            style={{ background: "linear-gradient(135deg, #1F3A2E, #2D5A4A)" }}
          >
            <Download size={18} />
            Save to Contacts
          </motion.button>

          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 text-white transition-all shadow-md"
              style={{ background: "linear-gradient(135deg, #C8A84E, #E67E22)" }}
            >
              <Share2 size={16} />
              {copied ? "Copied!" : "Share Card"}
            </motion.button>

            <motion.a
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/13059429407"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2 text-white transition-all"
              style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
            >
              <MessageCircle size={16} />
              WhatsApp
            </motion.a>
          </div>
        </section>

        {/* ── QR CODE ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`mx-4 mt-6 rounded-2xl border ${borderColor} ${cardBg} overflow-hidden`}
        >
          <button
            onClick={() => setShowQR(!showQR)}
            className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${isDark ? "hover:bg-white/5" : "hover:bg-[#1a1a2e]/5"}`}
          >
            <span className="text-[13px] font-semibold">Scan to Share This Card</span>
            <motion.div animate={{ rotate: showQR ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={16} className={mutedText} />
            </motion.div>
          </button>

          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className={`border-t ${borderColor} flex flex-col items-center py-6 gap-3`}>
                  {/* Clickable QR → opens lightbox */}
                  <button
                    onClick={() => setQrLightboxOpen(true)}
                    className="relative group focus:outline-none"
                    aria-label="Enlarge QR code"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <QRCodeSVG
                        value={CARD_URL}
                        size={180}
                        level="H"
                        imageSettings={{
                          src: kailashLogo,
                          x: undefined,
                          y: undefined,
                          height: 36,
                          width: 36,
                          excavate: true,
                        }}
                      />
                    </div>
                    {/* Zoom hint overlay */}
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="bg-black/60 rounded-full p-2">
                        <ZoomIn size={20} className="text-white" />
                      </div>
                    </div>
                  </button>
                  <p className={`text-[11px] text-center ${mutedText}`}>
                    Point a camera here to open this card · Tap to enlarge
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── FOOTER ── */}
        <footer className="mt-10 mb-8 text-center">
          <a
            href="https://mountkailashslu.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[11px] ${mutedText} hover:opacity-100 transition-opacity`}
          >
            The Ubuntu Movement · Mount Kailash Rejuvenation Centre
          </a>
          <p className={`text-[10px] mt-1 ${mutedText} opacity-50`}>
            mountkailashslu.com
          </p>
        </footer>

      </div>
    </div>
  );
}
