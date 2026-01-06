"use client";

import { AnimatePresence, motion } from "framer-motion";

export type ToastItem = {
  id: string;
  message: string;
};

type ToastStackProps = {
  items: ToastItem[];
  onDismiss: (id: string) => void;
};

export function ToastStack({ items, onDismiss }: ToastStackProps) {
  return (
    <div className="toast-stack">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="toast"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => onDismiss(item.id)}
          >
            {item.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
