import { motion } from "framer-motion";
import {ChevronUp} from 'lucide-react'
export default function Tray(){
  return(
    <motion.div
      initial={{ opacity: 0, y:20 }}
      animate={{ opacity: 1 , y:0}}
      transition={{ delay: 0.2 }}
      className="relative flex justify-center items-center"
      >
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-90 h-8 bg-white/70 shadow-xl shadow-black backdrop-blur-sm rounded-lg"></div>
      {/* <ChevronUp className="absolute -top-9 w-5 h-5 text-[#fcc3b9]"/> */}

    </motion.div>

  )
}