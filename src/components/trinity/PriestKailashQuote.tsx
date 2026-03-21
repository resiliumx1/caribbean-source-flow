export function PriestKailashQuote() {
  return (
    <section style={{ background: 'var(--site-green-dark)', borderTop: '1px solid var(--site-border)', borderBottom: '1px solid var(--site-border)', padding: '80px 24px' }}>
      <div className="container mx-auto max-w-3xl text-center relative">
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '180px', color: 'var(--site-gold)', opacity: 0.15, position: 'absolute', top: '-80px', left: '-20px', lineHeight: 1, pointerEvents: 'none' }}>
          "
        </span>
        <blockquote style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontStyle: 'italic', fontSize: 'clamp(1.5rem, 3vw, 32px)', color: '#f2ead8', lineHeight: 1.5, marginBottom: '24px' }}>
          "Western medicine treats symptoms. Bush medicine addresses
          terrain — the cellular environment where disease takes root."
        </blockquote>
        <cite style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: '14px', color: 'var(--site-gold)', fontStyle: 'normal' }}>
          — Priest Kailash Kay Leonce, Master Herbalist
        </cite>
      </div>
    </section>
  );
}
