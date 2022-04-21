'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.addColumn('games', 'curr_color', {
				type: Sequelize.STRING,
				defaultValue: 'wild',
			}),
			queryInterface.addColumn('games', 'curr_value', {
				type: Sequelize.STRING,
				defaultValue: 'wild',
			}),
		]);
	},

	async down(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.removeColumn('games', 'curr_color'),
			queryInterface.removeColumn('games', 'curr_value'),
		]);
	},
};
