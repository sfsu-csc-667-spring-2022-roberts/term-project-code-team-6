'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn('games', 'discardedCount', {
			type: Sequelize.INTEGER,
			defaultValue: 0,
		});
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn('games', 'discardedCount');
	},
};
