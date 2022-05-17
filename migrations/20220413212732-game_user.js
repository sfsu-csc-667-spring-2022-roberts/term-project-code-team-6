'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.createTable('game_users', {
			game_id: {
				type: Sequelize.INTEGER,
				references: {
					model: 'games',
					key: 'id',
				},
			},
			user_id: {
				type: Sequelize.INTEGER,
				references: {
					model: 'users',
					key: 'id',
				},
			},
			isReady: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
			player_order: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.dropTable('game_users');
	},
};
