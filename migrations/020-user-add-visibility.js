var db = require('../src/db').sequelize;

module.exports = {
	up: function() {
		try {
			return db.query(`
			  ALTER TABLE users ADD COLUMN viewableByRole varchar(255) NULL;
			`);
		} catch(e) {
			return true;
		}
	},
	down: function() {
		return db.query(`ALTER TABLE ideas DROP viewableByRole;`);
	}
}
