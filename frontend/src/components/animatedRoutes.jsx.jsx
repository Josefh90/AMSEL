// src/components/AnimatedRoutes.jsx
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, Outlet } from "react-router-dom";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute', width: '100%' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
