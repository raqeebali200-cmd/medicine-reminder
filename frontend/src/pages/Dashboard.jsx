import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { enablePushNotifications } from '../utils/notify';

export default function Dashboard() {
  const [reminders, setReminders] = useState([]);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00'); 
  const [editData, setEditData] = useState(null); 
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [activeAlarm, setActiveAlarm] = useState(null);
  
  const nav = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const loadAll = async () => {
    try {
      const r = await api.get('/reminders');
      setReminders(r.data);
    } catch (err) { 
      console.error(err); 
      showToast('Failed to load schedule', 'error');
    }
  };

  useEffect(() => { loadAll(); }, []);

  // In-App Alarm Clock
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      const currentHHMM = now.toTimeString().slice(0, 5);
      const dueReminder = reminders.find(r => r.times && r.times.includes(currentHHMM));
      
      if (dueReminder && (!activeAlarm || activeAlarm._id !== dueReminder._id)) {
        setActiveAlarm(dueReminder);
      }
    }, 10000); 
    return () => clearInterval(timer);
  }, [reminders, activeAlarm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editData) {
        await api.put(`/medications/${editData.medicationId}`, { name, dosage });
        await api.put(`/reminders/${editData.reminderId}`, { times: [time] });
        showToast('Medication updated successfully!');
        setEditData(null); 
      } else {
        const { data: med } = await api.post('/medications', { name, dosage });
        await api.post('/reminders', { medicationId: med._id, times: [time] });
        showToast('Medication scheduled successfully!');
      }
      setName(''); setDosage(''); setTime('08:00');
      await loadAll(); 
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      showToast(err.response?.data?.error || 'Error saving medication', 'error');
    } finally { setIsLoading(false); }
  };

  const handleEditClick = (r) => {
    if (!r.medicationId) {
      showToast('Cannot edit: Medication data missing', 'error');
      return;
    }
    setEditData({ reminderId: r._id, medicationId: r.medicationId._id });
    setName(r.medicationId.name || '');
    setDosage(r.medicationId.dosage || '');
    setTime(r.times && r.times.length > 0 ? r.times[0] : '08:00');
  };

  const cancelEdit = () => {
    setEditData(null); setName(''); setDosage(''); setTime('08:00');
  };

  const deleteReminder = async (id) => {
    try {
      await api.delete('/reminders/' + id);
      loadAll();
      showToast('Reminder deleted');
    } catch (err) { showToast('Failed to delete', 'error'); }
  };

  const logout = () => { localStorage.removeItem('token'); nav('/login'); };
  const enablePush = async () => {
    try { await enablePushNotifications(); showToast('Background Alerts activated! 🔔'); } 
    catch (e) { showToast('Permission denied', 'error'); }
  };

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div style={styles.page}>
      
      {/* FULL SCREEN BACKGROUND */}
      <div style={styles.bgGradient}></div>
      
      {/* FLOATING ICONS */}
      <motion.div animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} style={{...styles.floatingIcon, top: '15%', left: '5%', fontSize: '4rem'}}>💊</motion.div>
      <motion.div animate={{ y: [0, 40, 0], rotate: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} style={{...styles.floatingIcon, bottom: '10%', right: '5%', fontSize: '5rem'}}>✚</motion.div>

      {/* IN-APP ALARM POPUP */}
      <AnimatePresence>
        {activeAlarm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.alarmOverlay}>
            <motion.div initial={{ scale: 0.5, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.5, opacity: 0 }} style={styles.alarmModal}>
              <motion.div animate={{ rotate: [0, -15, 15, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: '4rem', marginBottom: '10px' }}>🔔</motion.div>
              <h2 style={{ fontSize: '1.8rem', color: '#0F172A', marginBottom: '10px' }}>Time for Medicine!</h2>
              <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '20px' }}>
                Take <strong>{activeAlarm.medicationId?.name || 'Medicine'}</strong> 
                {activeAlarm.medicationId?.dosage && ` (${activeAlarm.medicationId.dosage})`}
              </p>
              <button onClick={() => setActiveAlarm(null)} style={styles.btnAlarmDismiss}>Got it, Dismiss</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={styles.toast}>
            <div style={{...styles.toastIcon, background: toast.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: toast.type === 'error' ? '#DC2626' : '#10B981'}}>
              {toast.type === 'error' ? '✕' : '✓'}
            </div>
            <span style={{fontWeight: '700', color: '#0F172A'}}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>✚</div>
            <span style={styles.logoText}>MediTrack</span>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            <motion.button 
              animate={{ boxShadow: ["0px 0px 0px rgba(244,63,94,0)", "0px 0px 20px rgba(244,63,94,0.6)", "0px 0px 0px rgba(244,63,94,0)"] }}
              transition={{ repeat: Infinity, duration: 2 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
              style={styles.btnSecondary} onClick={enablePush}
            >
              Alerts 🔔
            </motion.button>
            <button style={styles.btnGhost} onClick={logout}>Log out</button>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Manage your daily health schedule here.</p>
          </div>
          
          <div style={styles.clockBox}>
            <span style={{ fontSize: '1.5rem' }}>🕒</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: '800', textTransform: 'uppercase' }}>Current Time</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#F43F5E', lineHeight: '1' }}>{liveTime}</div>
            </div>
          </div>
        </div>

        <div style={styles.layout}>
          
          {/* LEFT COLUMN: FORM */}
          <div style={styles.glassCard}>
            <h2 style={styles.cardTitle}>{editData ? 'Edit Medication' : 'Add Medication'}</h2>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Medicine Name</label>
                <input style={styles.input} placeholder="e.g. Amoxicillin" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Dosage (Optional)</label>
                <input style={styles.input} placeholder="e.g. 500mg" value={dosage} onChange={(e) => setDosage(e.target.value)} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Scheduled Time</label>
                <input type="time" style={styles.input} value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>

              <button 
                style={{...styles.btnPrimary, background: editData ? '#475569' : '#F43F5E'}} 
                type="submit" disabled={isLoading}
              >
                {isLoading ? 'Saving...' : editData ? 'Update Schedule' : '+ Add to Schedule'}
              </button>

              {editData && (
                <button type="button" onClick={cancelEdit} style={styles.btnCancelEdit}>
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN: SCHEDULE LIST */}
          <div style={styles.listSection}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
              <h2 style={{...styles.cardTitle, color: '#F8FAFC', margin: 0}}>Your Schedule</h2>
              <button onClick={loadAll} style={styles.btnRefresh}>↻</button>
            </div>
            
            {/* SCROLLABLE LIST CONTAINER */}
            <div style={styles.listScrollContainer}>
              {reminders.length === 0 ? (
                <div style={styles.emptyState}>
                  <div style={{fontSize: '2.5rem', marginBottom: '10px', color: '#F43F5E'}}>✚</div>
                  <p style={{fontWeight: '800', color: '#F8FAFC', margin: 0, fontSize: '1.1rem'}}>Your schedule is clear.</p>
                  <p style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginTop: '5px'}}>Add a medication using the form.</p>
                </div>
              ) : (
                <motion.div variants={listVariants} initial="hidden" animate="visible" style={styles.grid}>
                  <AnimatePresence mode="popLayout">
                    {reminders.map((r) => (
                      <motion.div 
                        key={r._id} variants={itemVariants} layout 
                        exit={{ opacity: 0, scale: 0.8, x: -50, transition: { duration: 0.2 } }} 
                        style={styles.reminderItem}
                      >
                        <div style={styles.itemLeft}>
                          <div style={styles.itemIcon}>💊</div>
                          <div>
                            <h3 style={styles.itemName}>{r.medicationId ? r.medicationId.name : "Unknown Medication"}</h3>
                            <div style={styles.itemMeta}>
                              {r.medicationId?.dosage && <span style={styles.badge}>{r.medicationId.dosage}</span>}
                              <span style={styles.timeText}>Scheduled: <strong style={{color: '#F43F5E'}}>{r.times ? r.times.join(', ') : 'No time set'}</strong></span>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button style={styles.btnEdit} onClick={() => handleEditClick(r)}>✎</button>
                          <button style={styles.btnDelete} onClick={() => deleteReminder(r._id)}>✕</button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  /* Forces the exact screen height and prevents page scrolling */
  page: { height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  bgGradient: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #14B8A6 100%)', zIndex: -1 },
  floatingIcon: { position: 'fixed', opacity: 0.1, zIndex: 0, pointerEvents: 'none' },
  
  toast: { position: 'fixed', top: '20px', right: '20px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '12px' },
  toastIcon: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' },
  
  nav: { background: 'rgba(15, 118, 110, 0.3)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', height: '64px', flexShrink: 0, zIndex: 10 },
  navContainer: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoIcon: { background: '#F43F5E', color: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' },
  logoText: { fontSize: '1.2rem', fontWeight: '800', color: '#F8FAFC' },
  
  btnSecondary: { padding: '8px 16px', background: '#F43F5E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800' },
  btnGhost: { padding: '8px 16px', background: 'transparent', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' },

  /* Main container takes up exactly the remaining space */
  main: { flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', width: '100%', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 },
  pageTitle: { fontSize: '2rem', fontWeight: '800', color: '#F8FAFC', letterSpacing: '-1px', margin: 0 },
  pageSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginTop: '2px', fontWeight: '500' },
  
  clockBox: { background: 'rgba(255, 255, 255, 0.9)', padding: '8px 16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px' },

  /* Grid layout fills the remaining space */
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 },
  
  glassCard: { background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(30px)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  cardTitle: { fontSize: '1.2rem', fontWeight: '800', margin: '0 0 16px 0', color: '#0F172A' },
  
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.8rem', fontWeight: '700', color: '#334155' },
  input: { padding: '12px', border: '2px solid rgba(203, 213, 225, 0.5)', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', background: 'rgba(255,255,255,0.7)', width: '100%', fontWeight: '600', color: '#0F172A' },
  
  btnPrimary: { padding: '12px', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
  btnCancelEdit: { background: 'transparent', border: 'none', color: '#64748B', marginTop: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem' },
  btnRefresh: { background: 'transparent', border: 'none', color: '#F8FAFC', fontWeight: '800', cursor: 'pointer', fontSize: '1.2rem' },

  /* List section strictly prevents overflow */
  listSection: { display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 },
  listScrollContainer: { flex: 1, overflowY: 'auto', paddingRight: '8px' },
  grid: { display: 'flex', flexDirection: 'column', gap: '10px' },
  
  reminderItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.9)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,1)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  itemIcon: { fontSize: '1.2rem', background: '#CCFBF1', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px' },
  itemName: { margin: '0 0 2px 0', fontSize: '1rem', fontWeight: '800', color: '#0F172A' },
  itemMeta: { display: 'flex', alignItems: 'center', gap: '8px' },
  badge: { background: '#DBEAFE', color: '#1D4ED8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800' },
  timeText: { color: '#475569', fontSize: '0.85rem', fontWeight: '700' },
  
  btnEdit: { border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem', color: '#0F172A', background: '#F1F5F9' },
  btnDelete: { border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1rem', color: '#DC2626', background: '#FEE2E2' },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '16px', border: '2px dashed rgba(255, 255, 255, 0.2)' },

  alarmOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  alarmModal: { background: '#FFFFFF', padding: '30px', borderRadius: '24px', textAlign: 'center', maxWidth: '350px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' },
  btnAlarmDismiss: { background: '#F43F5E', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer', width: '100%', boxShadow: '0 10px 20px -5px rgba(244, 63, 94, 0.4)' }
};