'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.changeColumn('game_users', 'player_order', {
			type: Sequelize.INTEGER,
			autoIncrement: false,
      allowNull: false
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.changeColumn('game_users', 'player_order', {
			type: Sequelize.INTEGER,
		});
	},
};
