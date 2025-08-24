import { motion } from "framer-motion";

export default function GameBoard() {
  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {["Customers","Warehouse","Suppliers"].map((name, i) => (
        <motion.div
          key={name}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 * i }}
          className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 h-48 flex items-center justify-center text-xl"
        >
          {name}
        </motion.div>
      ))}
    </div>
  );
}
