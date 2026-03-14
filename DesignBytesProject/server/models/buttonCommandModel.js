export default function buttonCommandModel(sequelize, DataTypes) {
  return sequelize.define(
    "button_command",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      actionId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "action_id",
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "requested_at",
      },
    },
    {
      tableName: "button_commands",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
}
