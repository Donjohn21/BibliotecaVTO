module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended', 'banned'),
      defaultValue: 'active'
    },
    penaltyCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastPenaltyDate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role'
    });
    User.hasMany(models.Loan, {
      foreignKey: 'userId',
      as: 'loans'
    });
    User.hasMany(models.Reservation, {
      foreignKey: 'userId',
      as: 'reservations'
    });
  };

  return User;
};