module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    underscored: true
  });

  Role.associate = function(models) {
    Role.hasMany(models.User, {
      foreignKey: 'roleId',
      as: 'users'
    });
  };

  return Role;
};