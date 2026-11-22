import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

export default function Login() {
  const [view, setView] = useState('landing'); // 'landing' or 'form'
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();

  const handleAuthClick = (registerMode) => {
    setIsRegister(registerMode);
    setView('form');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const path = isRegister ? '/auth/register' : '/auth/login';
      const { data } = await api.post(path, { email, password });
      localStorage.setItem('token', data.token);
      nav('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div style={styles.container}>
      
      {/* --- ADVANCED BACKGROUND ANIMATIONS --- */}
      {/* 1. Rotating Grid */}
      <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }} style={styles.bgGrid} />
      
      {/* 2. Glowing Orbs */}
      <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }} style={{...styles.orb, top: '-10%', left: '-10%', background: 'rgba(244, 63, 94, 0.25)'}} />
      <motion.div animate={{ x: [0, -60, 0], y: [0, 60, 0], scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }} style={{...styles.orb, bottom: '-10%', right: '-10%', background: 'rgba(20, 184, 166, 0.35)'}} />
      <motion.div animate={{ x: [0, 40, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }} style={{...styles.orb, top: '40%', left: '30%', background: 'rgba(59, 130, 246, 0.15)'}} />

      {/* 3. Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -100, 0], opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 10 + i * 2, delay: i * 1.5, ease: "easeInOut" }}
          style={{ ...styles.particle, left: `${15 + i * 15}%`, top: `${80 - i * 10}%` }}
        />
      ))}

      {/* FLOATING HEALTH ICONS */}
      <motion.div animate={{ y: [0, -30, 0], rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} style={{...styles.floatingIcon, top: '20%', left: '8%', fontSize: '4rem'}}>💊</motion.div>
      <motion.div animate={{ y: [0, 40, 0], rotate: [0, -25, 0] }} transition={{ repeat: Infinity, duration: 11, ease: "easeInOut" }} style={{...styles.floatingIcon, bottom: '15%', left: '20%', fontSize: '3.5rem'}}>❤️</motion.div>
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }} style={{...styles.floatingIcon, top: '60%', right: '10%', fontSize: '5rem'}}>🩺</motion.div>

      <AnimatePresence mode="wait">
        
        {/* ==========================================
            VIEW 1: THE LANDING PAGE
            ========================================== */}
        {view === 'landing' && (
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05, transition: { duration: 0.4 } }}
            transition={{ duration: 0.6 }}
            style={styles.landingWrapper}
          >
            {/* TOP RIGHT BUTTONS */}
            <div style={styles.topRightNav}>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAuthClick(false)}
                style={styles.navBtn}
              >
                Login
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px -5px rgba(244, 63, 94, 0.5)" }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAuthClick(true)}
                style={styles.navBtnRegister}
              >
                Register
              </motion.button>
            </div>

            {/* CENTER CONTENT */}
            <div style={styles.centerContent}>
              <motion.div 
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2, type: "spring" }} 
                style={styles.logoIconLarge}
              >
                ✚
              </motion.div>
              
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={styles.mainTitle}>
                Your health,<br/>simplified.
              </motion.h1>
              
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={styles.mainSubtitle}>
                Experience the most elegant way to track your daily medications.
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            VIEW 2: THE LOGIN / REGISTER FORM
            ========================================== */}
        {view === 'form' && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 30, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
            style={styles.formWrapper}
          >
            <motion.div 
              animate={{ boxShadow: ["0px 25px 50px -12px rgba(0,0,0,0.3)", "0px 25px 60px -12px rgba(244,63,94,0.2)", "0px 25px 50px -12px rgba(0,0,0,0.3)"] }}
              transition={{ repeat: Infinity, duration: 4 }}
              style={styles.glassCard}
            >
              
              <button onClick={() => setView('landing')} style={styles.backBtn}>
                ← Back to Home
              </button>

              <h2 style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
              <p style={styles.subtitle}>{isRegister ? 'Start your premium health journey.' : 'Please enter your details to sign in.'}</p>

              {error && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.errorBox}>{error}</motion.div>}

              <motion.form onSubmit={submit} style={styles.form} variants={containerVariants} initial="hidden" animate="visible">
                <motion.div variants={itemVariants} style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <motion.input whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(244, 63, 94, 0.3)", borderColor: "#F43F5E", background: '#ffffff' }} style={styles.input} type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </motion.div>
                
                <motion.div variants={itemVariants} style={styles.inputGroup}>
                  <label style={styles.label}>Password</label>
                  <motion.input whileFocus={{ scale: 1.02, boxShadow: "0 0 0 4px rgba(244, 63, 94, 0.3)", borderColor: "#F43F5E", background: '#ffffff' }} style={styles.input} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </motion.div>

                <motion.button 
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -3, boxShadow: "0 20px 30px -10px rgba(244, 63, 94, 0.6)" }} 
                  whileTap={{ scale: 0.95 }} 
                  style={styles.btn} type="submit" disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}
                </motion.button>
              </motion.form>

              <p style={styles.switchText}>
                {isRegister ? 'Already have an account? ' : "New here? "}
                <motion.span 
                  whileHover={{ scale: 1.1, color: '#F43F5E' }} 
                  style={styles.link} 
                  onClick={() => { setIsRegister(!isRegister); setError(''); }}
                >
                  {isRegister ? 'Sign In' : 'Sign Up'}
                </motion.span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    height: '100vh', /* Forces exact screen height */
    width: '100vw', 
    overflow: 'hidden', /* Prevents scrolling */
    background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)', 
    position: 'relative',
  },

  /* ADVANCED BACKGROUND ELEMENTS */
  bgGrid: { position: 'absolute', width: '200vw', height: '200vw', backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0, pointerEvents: 'none', top: '-50%', left: '-50%' },
  orb: { position: 'absolute', width: '45vw', height: '45vw', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 },
  particle: { position: 'absolute', width: '6px', height: '6px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '50%', zIndex: 1, pointerEvents: 'none' },
  floatingIcon: { position: 'absolute', opacity: 0.12, zIndex: 1, pointerEvents: 'none', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' },

  /* LANDING PAGE STYLES */
  landingWrapper: { position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' },
  topRightNav: { position: 'absolute', top: '40px', right: '60px', display: 'flex', gap: '20px', zIndex: 10 },
  navBtn: { padding: '12px 32px', background: 'transparent', color: '#F8FAFC', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.3s' },
  navBtnRegister: { padding: '12px 32px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', boxShadow: '0 10px 20px -5px rgba(244, 63, 94, 0.4)', transition: 'all 0.3s' },

  centerContent: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px', zIndex: 5 },
  logoIconLarge: { fontSize: '3rem', background: '#F43F5E', color: 'white', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontWeight: 'bold', boxShadow: '0 20px 40px -10px rgba(244, 63, 94, 0.4)' },
  mainTitle: { fontSize: '3.5rem', fontWeight: '800', color: '#F8FAFC', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-1.5px' },
  mainSubtitle: { fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', fontWeight: '500', maxWidth: '500px' },

  /* FORM PAGE STYLES */
  formWrapper: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, padding: '20px' },
  glassCard: { 
    background: 'rgba(255, 255, 255, 0.1)', 
    backdropFilter: 'blur(30px)', 
    padding: '40px 32px', /* Reduced padding to fit screen perfectly */
    borderRadius: '24px', 
    width: '100%', 
    maxWidth: '380px', /* Slightly narrower to fit better */
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    border: '1px solid rgba(255, 255, 255, 0.3)', 
    position: 'relative'
  },
  backBtn: { position: 'absolute', top: '15px', left: '20px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' },
  
  title: { fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px 0', color: '#F8FAFC', letterSpacing: '-1px', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.8)', margin: '0 0 24px 0', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' },
  errorBox: { background: 'rgba(239, 68, 68, 0.2)', color: '#FCA5A5', padding: '10px', borderRadius: '10px', width: '100%', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center', fontWeight: '600', border: '1px solid rgba(239,68,68,0.4)' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.8rem', fontWeight: '700', color: '#F8FAFC' },
  input: { padding: '14px', background: 'rgba(255, 255, 255, 0.95)', border: '2px solid transparent', borderRadius: '12px', fontSize: '1rem', color: '#0F172A', outline: 'none', transition: 'all 0.3s ease', fontWeight: '600' },
  btn: { padding: '16px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '800', fontSize: '1rem', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
  
  switchText: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: '0.9rem', marginTop: '24px', fontWeight: '600' },
  link: { color: '#F8FAFC', fontWeight: '800', cursor: 'pointer', display: 'inline-block', marginLeft: '5px', textDecoration: 'underline' }
};