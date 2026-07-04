const cron = require('node-cron');
const pool = require('./db');
const wa = require('./wa');

function initScheduler() {
  console.log('Task Reminder Scheduler initialized.');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const nowH = now.getHours();
      const nowM = now.getMinutes();

      // Fetch all tasks with an assignee that are not done and haven't sent reminder
      const result = await pool.query(`
        SELECT t.*, u.name AS art_name, u.phone_number AS art_phone
        FROM tasks t
        JOIN users u ON t.assigned_to = u.id
        WHERE t.status != 'done' 
          AND t.target_time IS NOT NULL 
          AND t.reminder_sent = false
          AND u.phone_number IS NOT NULL
      `);

      for (const task of result.rows) {
        const [targetH, targetM] = task.target_time.split(':').map(Number);
        
        // Check if current time is past or equal to target_time
        if (nowH > targetH || (nowH === targetH && nowM >= targetM)) {
          const formattedTargetTime = `${String(targetH).padStart(2, '0')}:${String(targetM).padStart(2, '0')}`;
          const msg = `⏰ *Pengingat Tugas Belum Selesai*\n\nHalo *${task.art_name}*,\n\nTugas *"${task.title}"* ditargetkan selesai pada pukul *${formattedTargetTime}*.\n\nTugas ini tercatat belum selesai. Harap segera dikerjakan dan perbarui statusnya di website:\nhttp://localhost:5173`;
          
          console.log(`Sending reminder to ${task.art_name} (${task.art_phone}) for task: "${task.title}"`);
          const success = await wa.sendWaMessage(task.art_phone, msg);
          if (success) {
            await pool.query('UPDATE tasks SET reminder_sent = true WHERE id = $1', [task.id]);
          }
        }
      }
    } catch (err) {
      console.error('Error running scheduler check:', err);
    }
  });

  // Reset reminder_sent at midnight every day
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Resetting daily task reminders...');
      await pool.query("UPDATE tasks SET reminder_sent = false WHERE status != 'done'");
    } catch (err) {
      console.error('Error resetting reminders at midnight:', err);
    }
  });
}

module.exports = {
  initScheduler
};
