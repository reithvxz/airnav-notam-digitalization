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

// Sync database function
const initDb = async () => {
  await sequelize.sync(); // Creates tables if they don't exist
  console.log("Database synchronized");
};

module.exports = { sequelize, User, Notam, initDb };
