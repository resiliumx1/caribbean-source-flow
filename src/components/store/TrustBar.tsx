import { Lock, Truck, Leaf, RotateCcw } from "lucide-react";

const items = [
  { Icon: Lock, label: "Secure Checkout" },
  { Icon: Truck, label: "3-Day US Delivery" },
  { Icon: Leaf, label: "100% Natural" },
  { Icon: RotateCcw, label: "30-Day Returns" },
];

export function TrustBar() {
  return (
    <section
      className="w-full"
      style={{ background: "#0d1a0f", padding: "40px 0" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-0">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center">
              <div className="flex items-center gap-3 px-6 py-2">
                <item.Icon className="w-7 h-7" style={{ color: "#c9a84c" }} />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#f2ead8",
                  }}
                >
                  {item.label}
                </span>
              </div>
              {i < items.length - 1 && (
                <div
                  className="hidden md:block h-6 mx-2"
                  style={{
                    width: "1px",
                    background: "rgba(201,168,76,0.3)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
