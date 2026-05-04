import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="min-h-screen bg-nayamo-bg-primary flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ 
          repeat: Infinity, 
          duration: 1, 
          ease: "linear" 
        }}
        className="w-12 h-12 border-4 border-nayamo-gold/20 border-t-nayamo-gold rounded-full"
      />
    </div>
  );
}

