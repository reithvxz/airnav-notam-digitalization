const { sequelize, Preduty } = require('./database');
const crypto = require('crypto');

const managers = ['Ibny Haryanto', 'Budi Santoso', 'Siti Aminah', 'Andi Wijaya', 'Arief Rahman'];
const shifts = ['PAGI', 'SIANG', 'MALAM'];

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Sync the model just in case it's not created
    await Preduty.sync({ alter: true });
    
    const dummyData = [];
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    for (let i = 0; i < 200; i++) {
      const d = getRandomDate(threeMonthsAgo, now);
      const dateStr = d.toISOString().split('T')[0];
      const timeStr = d.toISOString().split('T')[1].substring(0, 5);
      
      const mod = managers[Math.floor(Math.random() * managers.length)];
      const shift = shifts[Math.floor(Math.random() * shifts.length)];
      const userId = Math.random() > 0.5 ? 1 : 2;

      dummyData.push({
        id: crypto.randomUUID(),
        date: dateStr,
        time: timeStr,
        managerOnDuty: mod,
        shift: shift,
        createdBy: userId,
        createdAt: d,
        updatedAt: d
      });
    }

    await Preduty.bulkCreate(dummyData);
    console.log(`Successfully inserted ${dummyData.length} dummy Preduty records.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed DB:', err);
    process.exit(1);
  }
}

seed();
