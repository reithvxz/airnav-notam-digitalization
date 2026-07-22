const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize MySQL Database
const sequelize = new Sequelize('airnav_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false // disable logging for cleaner terminal
});

// Define User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  initial: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nama: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jabatan: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'employee' // 'admin' or 'employee'
  },
  tanda_tangan: {
    type: DataTypes.STRING,
    allowNull: true // Store filename/path of the signature
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

// Define Notam Model
const Notam = sequelize.define('Notam', {
  id: {
    type: DataTypes.STRING, // Using UUID or generated ID like before
    primaryKey: true
  },
  formNo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  jenis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lokasi: {
    type: DataTypes.STRING,
    allowNull: false
  },
  waktuMulai: {
    type: DataTypes.STRING,
    allowNull: false
  },
  waktuSelesai: {
    type: DataTypes.STRING,
    allowNull: false
  },
  formData: {
    type: DataTypes.TEXT, // Store the entire JSON object as string
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Relationships
User.hasMany(Notam, { foreignKey: 'createdBy' });
Notam.belongsTo(User, { foreignKey: 'createdBy' });

// Define Briefing Model
const Briefing = sequelize.define('Briefing', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  managerOnDuty: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shift: {
    type: DataTypes.STRING,
    allowNull: false
  },
  checklistData: {
    type: DataTypes.TEXT, // JSON array of 13 checklist items
    allowNull: false
  },
  incomingManager: {
    type: DataTypes.TEXT, // JSON {initial, nama, ttd, time}
    allowNull: false
  },
  outgoingManager: {
    type: DataTypes.TEXT, // JSON {initial, nama, ttd, time}
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Define PostShift Model
const PostShift = sequelize.define('PostShift', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  managerOnDuty: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shift: {
    type: DataTypes.STRING,
    allowNull: false
  },
  checklistData: {
    type: DataTypes.TEXT, // JSON array of 10 checklist items
    allowNull: false
  },
  incomingManager: {
    type: DataTypes.TEXT, // JSON {initial, nama, ttd, time}
    allowNull: false
  },
  outgoingManager: {
    type: DataTypes.TEXT, // JSON {initial, nama, ttd, time}
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Define Event Model
const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false // Format: YYYY-MM-DD
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: true // Format: HH:MM
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: true // Format: HH:MM
  },
  isAllDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'Other'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachment: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

User.hasMany(Briefing, { foreignKey: 'createdBy' });
Briefing.belongsTo(User, { foreignKey: 'createdBy' });

User.hasMany(PostShift, { foreignKey: 'createdBy' });
PostShift.belongsTo(User, { foreignKey: 'createdBy' });

// Sync database function
const initDb = async () => {
  await sequelize.sync(); // Creates tables if they don't exist
  console.log("Database synchronized");
};

module.exports = { sequelize, User, Notam, Briefing, PostShift, Event, initDb };
