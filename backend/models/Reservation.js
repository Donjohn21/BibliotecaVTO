module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reservationDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'fulfilled', 'expired', 'cancelled'),
      defaultValue: 'pending'
    },
    notificationSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Reservation.associate = (models) => {
    Reservation.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Reservation.belongsTo(models.Book, {
      foreignKey: 'bookId',
      as: 'book'
    });
  };

  return Reservation;
};