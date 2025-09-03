import { motion } from "framer-motion";

type Box = { id: string; label: string };

const BOXES: Box[] = [
  { id: "box-customers", label: "Customers" },
  { id: "box-warehouse", label: "Warehouse" },
  { id: "box-suppliers", label: "Suppliers" },
];

export default function GameBoard() {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {BOXES.map((b, i) => (
        <motion.div
          id={b.id}                                // <<— important: FlowCanvas measures these
          key={b.id}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 * i }}
          className="relative h-56 md:h-64 rounded-2xl border border-neutral-800 bg-neutral-900/60
                     shadow-[0_0_0_1px_rgba(255,255,255,0.05)] flex items-center justify-center"
        >
          <div className="text-xl font-medium">{b.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
