module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    loanDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'returned', 'overdue'),
      defaultValue: 'active'
    },
    penaltyAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    penaltyPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Loan.associate = (models) => {
    Loan.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Loan.belongsTo(models.Book, {
      foreignKey: 'bookId',
      as: 'book'
    });
  };

  return Loan;
};