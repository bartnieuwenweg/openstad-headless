var sanitize = require('../util/sanitize');
var config = require('config')
const merge = require('merge');

// For detecting throwaway accounts in the email address validation.
var emailBlackList = require('../../config/mail_blacklist')
  , emailDomain    = /^.+@(.+)$/;

var notifications = require('../notifications');
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');

module.exports = function( db, sequelize, DataTypes ) {
	var Comment = sequelize.define('comment', {

		parentId: {
			type         : DataTypes.INTEGER,
      auth: {
        updateableBy : 'editor',
      },
			allowNull    : true
		},

		ideaId: {
			type         : DataTypes.INTEGER,
      auth: {
        updateableBy : 'editor',
      },
			allowNull    : false
		},

		userId: {
			type         : DataTypes.INTEGER,
      auth: {
        updateableBy : 'editor',
      },
			allowNull    : false,
			defaultValue: 0,
		},

		sentiment: {
			type         : DataTypes.ENUM('against', 'for', 'no sentiment'),
			defaultValue : 'for',
			allowNull    : false
		},

		description: {
			type         : DataTypes.TEXT,
			allowNull    : false,
			validate     : {
				// len: {
				//  	args : [30,500],
				//  	msg  : 'Bericht moet tussen 30 en 500 tekens zijn'
				// }
				textLength(value) {
				 	let len = sanitize.summary(value.trim()).length;
					let descriptionMinLength = ( this.config && this.config.comments && this.config.comments.descriptionMinLength || 30 )
					let descriptionMaxLength = ( this.config && this.config.comments && this.config.comments.descriptionMaxLength || 500 )
					if (len < descriptionMinLength || len > descriptionMaxLength)
					throw new Error(`Beschrijving moet tussen ${descriptionMinLength} en ${descriptionMaxLength} tekens zijn`);
				}
			},
			set          : function( text ) {
				this.setDataValue('description', sanitize.argument(text));
			}
		},

		label: {
			type         : DataTypes.STRING,
			allowNull    : true
		},

		yes: {
			type         : DataTypes.VIRTUAL
		},

		hasUserVoted: {
			type         : DataTypes.VIRTUAL
		},

		createDateHumanized: {
			type         : DataTypes.VIRTUAL,
			get          : function() {
				var date = this.getDataValue('createdAt');
				try {
					if( !date ) return 'Onbekende datum';
          return new Intl.DateTimeFormat(...config.datetime.format).format(date)
				} catch( error ) {
					return (error.message || 'dateFilter error').toString()
				}
			}
		},

	}, {

		hooks: {

			beforeValidate: function( instance, options ) {

				return new Promise((resolve, reject) => {

					if (instance.ideaId) {
						db.Idea.scope('includeProject').findByPk(instance.ideaId)
							.then( idea => {
								if (!idea) throw Error('Idea niet gevonden')
								instance.config = merge.recursive(true, config, idea.project.config);
								return idea;
							})
							.then( idea => {
								return resolve();
							}).catch(err => {
								throw err;
							})

					} else {
						instance.config = config;
            return resolve();
					}

				});

			},

			afterCreate: function(instance, options) {
				db.Idea.findByPk(instance.ideaId)
					.then( idea => {
						notifications.addToQueue({ type: 'comment', action: 'create', projectId: idea.projectId, instanceId: instance.id });
					})
			},

			afterUpdate: function(instance, options) {
				db.Idea.findByPk(instance.ideaId)
					.then( idea => {
						notifications.addToQueue({ type: 'comment', action: 'update', projectId: idea.projectId, instanceId: instance.id });
					})
			},

		},

		individualHooks: true,

	});

	Comment.scopes = function scopes() {
		// Helper function used in `includeVoteCount` scope.
		function voteCount( tableName ) {
			return [sequelize.literal(`
				(SELECT
					COUNT(*)
				FROM
					comment_votes av
				WHERE
					av.deletedAt IS NULL AND (
						av.checked IS NULL OR
						av.checked  = 1
					) AND
					av.commentId = ${tableName}.id)
			`), 'yes'];
		}

		return {

			defaultScope: {
				include: [{
					model      : db.User,
					attributes : ['id', 'role', 'displayName', 'nickName', 'name', 'email']
				}]
			},

			forProjectId: function( projectId ) {
				return {
					where: {
						ideaId: [ sequelize.literal(`select id FROM ideas WHERE projectId = ${projectId}`) ]
					}
				};
			},

			includeRepliesOnComments: function( userId ) {
				let commentVoteThreshold = 5; // todo: configureerbaar
				return {
					include: [{
						model      : db.Comment,
						as         : 'replies',
						required   : false,
            // force attribs because the automatic list is incomplete
					  attributes : ['id', 'parentId', 'ideaId', 'userId', 'sentiment', 'description', 'label', 'createdAt', 'updatedAt', 'createDateHumanized']
					}],
					where: {
						parentId: null
					},
					// HACK: Inelegant?
					order: [
//						sequelize.literal(`GREATEST(0, \`yes\` - ${commentVoteThreshold}) DESC`),
						sequelize.literal('parentId'),
						sequelize.literal('createdAt')
					]
				};
			},

			includeIdea: function() {
				return {
					include: [{
						model      : db.Idea,
						attributes : ['id', 'projectId', 'title', 'status', 'viewableByRole']
					}]
				}
			},

			includeVoteCount: function( tableName ) {
				return {
					attributes: Object.keys(this.rawAttributes).concat([
						voteCount(tableName, 'yes')
					])
				};
			},

			includeUserVote: function( tableName, userId ) {
				userId = Number(userId);
				if( !userId ) return {};

				return {
					attributes: Object.keys(this.rawAttributes).concat([
						[sequelize.literal(`
							(SELECT
								COUNT(*)
							FROM
								comment_votes av
							WHERE
								av.deletedAt IS NULL AND (
									av.checked IS NULL OR
									av.checked  = 1
								) AND
								av.commentId = ${tableName}.id AND
								av.userId     = ${userId})
						`), 'hasUserVoted']
					])
				};
			},

			includeUser: {
				include: [{
					model      : db.User,
					as         : 'user',
					required   : false
				}]
			},

		}
	}

	Comment.associate = function( models ) {
		this.belongsTo(models.Idea, { onDelete: 'CASCADE' }); // TODO: defined in the DB as NOT NULL, which is incorrect when parentId is used
		this.belongsTo(models.User, { onDelete: 'CASCADE' });
		this.hasMany(models.CommentVote, {
			as: 'votes',
      onDelete: 'CASCADE',
      hooks: true,
		});
		this.hasMany(models.Comment, { // TODO: cascade does not work here
			foreignKey : 'parentId',
			as         : 'replies',
      onDelete: 'CASCADE',
      hooks: true,
		});
	}

	Comment.prototype.addUserVote = function( user, ip ) {
		var data = {
			commentId : this.id,
			userId     : user.id,
			ip         : ip
		};

		// See `Idea.addUserVote` for an explanation of the logic below.
		return db.CommentVote.findOne({where: data})
			.then(function( vote ) {
				if( vote ) {
					return vote.destroy();
				} else {
					// HACK: See `Idea.addUserVote`.
					data.deletedAt = null;
					return db.CommentVote.upsert(data);
				}
			})
			.then(function( result ) {
				return result && !!result.deletedAt;
			});
	}

	Comment.auth = Comment.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'member',
    updateableBy: ['moderator','owner'],
    deleteableBy: ['moderator','owner'],
    canVote: function(user, self) {
      // TODO: ik denk dat je alleen moet kunnen voten bij idea.isOpen, maar dat doet hij nu ook niet. Sterker: hij checkt nu alleen maar op parentId.
      if (userHasRole(user, 'member') && self.id && !self.parentId) {
        return true;
      } else {
        return false;
      }
    },
    canReply: function(user, self) {
      if (!self.idea) return false;
      if (self.idea.isRunning() && userHasRole(user, 'member') && self.id && !self.parentId) {
        return true;
      } else {
        return false;
      }
    },
    toAuthorizedJSON(user, result, self) {
      // TODO: ik denk dat ik doit overal wil. Misschien met een scope of andere param.
      result.can = {};
      if ( self.can('reply', user) ) result.can.reply = true;
      if ( self.can('update', user) ) result.can.edit = true;
      if ( self.can('delete', user) ) result.can.delete = true;
      return result;
    }
  }

	return Comment;

}
