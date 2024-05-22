const Sequelize = require('sequelize');
const express = require('express');
const moment = require('moment');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const searchInResults = require('../../middleware/search-in-results');
const c = require('config');

const { Op } = require('sequelize');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const router = express.Router({ mergeParams: true });
const userhasModeratorRights = (user) => {
  return hasRole( user, 'moderator')
};

// scopes: for all get requests
router.all('*', function (req, res, next) {
  req.scope = [
    'defaultScope',
    'api',
    { method: ['onlyVisible', req.user.id, req.user.role] },
  ];

  // in case the votes are archived don't use these queries
  // this means they can be cleaned up from the main table for performance reason
  if (!req.project.config.archivedVotes) {
    if (
      req.query.includeVoteCount &&
      ((req.project &&
        req.project.config &&
        req.project.config.votes &&
        req.project.config.votes.isViewable) ||
        userhasModeratorRights(req.user))
    ) {
      req.scope.push({
        method: ['includeVoteCount', req.project.config.votes],
      });
    }

    if (
      req.query.includeUserVote &&
      req.project &&
      req.project.config &&
      req.project.config.votes &&
      req.project.config.votes.isViewable &&
      req.user &&
      req.user.id
    ) {
      // ik denk dat je daar niet het hele object wilt?
      req.scope.push({ method: ['includeUserVote', req.user.id] });
    }
  }
  // because includeVoteCount is used in other locations but should only be active if isViewable
  if (
    (req.project &&
      req.project.config &&
      req.project.config.votes &&
      req.project.config.votes.isViewable) ||
    userhasModeratorRights(req.user)
  ) {
    req.canIncludeVoteCount = true; // scope.push(undefined) would be easier but creates an error
  }

  if (req.query.running) {
    req.scope.push('selectRunning');
  }

  if (req.query.includeComments) {
    req.scope.push({ method: ['includeComments', req.user.id] });
  }

  if (req.query.includeCommentsCount) {
    req.scope.push('includeCommentsCount');
  }

  if (req.query.includeTags) {
    req.scope.push('includeTags');
  }

  if (req.query.includePoll) {
    req.scope.push({ method: ['includePoll', req.user.id] });
  }

  if (req.query.tags) {
    let tags = req.query.tags;
    req.scope.push({ method: ['selectTags', tags] });
    req.scope.push('includeTags');
  }

  if (req.query.statuses) {
    let statuses = req.query.statuses;
    req.scope.push({ method: ['selectStatuses', statuses] });
    req.scope.push('includeStatuses');
  }

  if (req.query.includeUser) {
    req.scope.push('includeUser');
  }

  if (req.canIncludeVoteCount) req.scope.push('includeVoteCount');
  // todo? volgens mij wordt dit niet meer gebruikt
  // if (req.query.highlighted) {
  //  	query = db.Resource.getHighlighted({ projectId: req.params.projectId })
  // }

  return next();
});

router
  .route('/')

  // list image resources
  // ----------
  .get(auth.can('ImageResource', 'list'))
  .get(pagination.init)
  .get(function (req, res, next) {
    let { dbQuery } = req;

    dbQuery.where = {
      projectId: req.params.projectId,
      ...req.queryConditions,
      ...dbQuery.where,
      deletedAt: null,
    };

    if (dbQuery.hasOwnProperty('order')) {
      /**
       * Handle yes/no sorting
       */
      dbQuery.order = dbQuery.order.map(function (sortingQuery) {
        if (sortingQuery[0] === 'yes' || sortingQuery[0] === 'no') {
          return [Sequelize.literal(sortingQuery[0]), sortingQuery[1]];
        }

        return sortingQuery;
      });
    }

    db.ImageResource.scope(...req.scope)
      .findAndCountAll(dbQuery)
      .then(function (result) {
        result.rows.forEach((imageResource) => {
          imageResource.project = req.project;
          if (req.query.includePoll && imageResource.poll)
            imageResource.poll.countVotes(!req.query.includeVotes);
        });
        const { rows } = result;
        req.results = rows;
        req.dbQuery.count = result.count;

        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(searchInResults({}))
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // create image resource
  // -----------
  .post(auth.can('ImageResource', 'create'))
  .post(function (req, res, next) {
    if (!req.project) return next(createError(401, 'Project niet gevonden'));
    return next();
  })
  .post(function (req, res, next) {
    try {
      req.body.location = req.body.location
        ? JSON.parse(req.body.location)
        : null;
    } catch (err) {}

    if (
      req.body.location &&
      typeof req.body.location == 'object' &&
      !Object.keys(req.body.location).length
    ) {
      req.body.location = null;
    }

    let userId = req.user.id;
    if (hasRole( req.user, 'admin') && req.body.userId) userId = req.body.userId;

    if (!!req.body.submittedData) {
      req.body = {
        ...req.body,
        ...req.body.submittedData,
      };

      delete req.body.submittedData;
    }

    const data = {
      ...req.body,
      projectId: req.params.projectId,
      userId,
      startDate: req.body.startDate || new Date(),
    };

    let responseData;
    db.ImageResource.authorizeData(data, 'create', req.user, null, req.project)
      .create(data)
      .then((imageResourceInstance) => {
        db.ImageResource.scope(...req.scope)
          .findByPk(imageResourceInstance.id)
          .then((result) => {
            result.project = req.project;
            req.results = result;
            return next();
          });
      })
      .catch(function (error) {
        // todo: dit komt uit de oude routes; maak het generieker
        if (
          typeof error == 'object' &&
          error instanceof Sequelize.ValidationError
        ) {
          let errors = [];
          error.errors.forEach(function (error) {
            // notNull kent geen custom messages in deze versie van sequelize; zie https://github.com/sequelize/sequelize/issues/1500
            // TODO: we zitten op een nieuwe versie van seq; vermoedelijk kan dit nu wel
            errors.push(
              error.type === 'notNull Violation' && error.path === 'location'
                ? 'Kies een locatie op de kaart'
                : error.message
            );
          });
          //	res.status(422).json(errors);

          next(createError(422, errors.join(', ')));
        } else {
          next(error);
        }
      });
  })
  .post(async function (req, res, next) {
    // skip updating status if user is not allowed to mutate status
    if (!req.results.auth.canMutateStatus(req.user, req.results)) {
      delete req.body.statuses;
    }
    return next();
  })
  .post(async function (req, res, next) {
    // statuses
    let statuses = req.body.statuses || [];
    if (!Array.isArray(statuses)) statuses = [statuses];
    statuses = statuses.filter(status => Number.isInteger(status));
    if (!statuses.length) {
      let defaultStatusIds = req.project.config?.resources?.defaultStatusIds || [];
      if (!Array.isArray(defaultStatusIds)) defaultStatusIds = [defaultStatusIds];
      statuses = defaultStatusIds;
    }
    if (statuses.length) {
      await req.results.setStatuses(statuses);
      req.scope.push('includeStatuses');
    }
    return next();
  })
  .post(async function (req, res, next) {
    // tags
    let tags = req.body.tags || [];
    if (!Array.isArray(tags)) tags = [tags];
    tags = tags.filter(tag => Number.isInteger(tag));
    if (!tags.length) {
      let defaultTagIds = req.project.config?.resources?.defaultTagIds || [];
      if (!Array.isArray(defaultTagIds)) defaultTagIds = [defaultTagIds];
      tags = defaultTagIds;
    }
    if (tags.length) {
      await req.results.setTags(tags);
      req.scope.push('includeTags');
    }
    return next();
  })
  .post(async function (req, res, next) {
    // refetch after tags and status updates
    db.ImageResource.scope(...req.scope)
      .findOne({
        where: { id: req.results.id, projectId: req.params.projectId },
      })
      .then((result) => {
        console.log(result.dataValues);
        req.results = result;
        return next();
      });
  })

// one resource
// --------
router
  .route('/:imageResourceId(\\d+)')
  .all(function (req, res, next) {
    var imageResourceId = parseInt(req.params.imageResourceId) || 1;

    let scope = [...req.scope];
    if (req.canIncludeVoteCount) scope.push('includeVoteCount');

    db.ImageResource.scope(...scope)
      .findOne({
        where: { id: imageResourceId, projectId: req.params.projectId },
      })
      .then((found) => {
        if (!found) throw new Error('Image resource not found');
        found.project = req.project;
        if (req.query.includePoll) {
          // TODO: naar poll hooks
          if (found.poll) found.poll.countVotes(!req.query.includeVotes);
        }
        req.imageResource = found;
        req.results = req.imageResource;
        next();
      })
      .catch((err) => {
        console.log('err', err);
        next(err);
      });
  })

  // view image resource
  // ---------
  .get(auth.can('ImageResource', 'view'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  })

  // update image resource
  // -----------
  .put(auth.useReqUser)
  .put(function (req, res, next) {
    req.tags = req.body.tags;
    next();
  })
  .put(function (req, res, next) {
    var imageResource = req.results;

    if (!(imageResource && imageResource.can && imageResource.can('update')))
      return next(new Error('You cannot update this image Resource'));

    if (req.body.location) {
      try {
        req.body.location = JSON.parse(req.body.location || null);
      } catch (err) {}

      if (
        req.body.location &&
        typeof req.body.location === 'object' &&
        !Object.keys(req.body.location).length
      ) {
        req.body.location = undefined;
      }
    } else {
      if (req.body.location === null) {
        req.body.location = JSON.parse(null);
      }
    }

    let data = {
      ...req.body,
    };

    if (userhasModeratorRights(req.user)) {
      if (data.modBreak) {
        data.modBreakUserId = req.body.modBreakUserId = req.user.id;
        data.modBreakDate = req.body.modBreakDate = new Date().toString();
      }
    }

    imageResource
      .authorizeData(data, 'update')
      .update(data)
      .then((result) => {
        result.project = req.project;
        req.results = result;
        next();
      })
      .catch(next);
  })
  .put(async function (req, res, next) {
    // tags
    let tags = req.body.tags;
    if (!Array.isArray(tags)) return next();

    if (!tags.every((t) => Number.isInteger(t))) {
      next('Tags zijn niet gegeven in het juiste formaat');
    }

    const projectId = req.params.projectId;
    const tagEntities = await getValidTags(projectId, tags, req.user);
    
    const imageResourceInstance = req.results;
    imageResourceInstance.setTags(tagEntities).then((result) => {
      // refetch. now with tags
      let scope = [...req.scope, 'includeTags'];
      if (req.canIncludeVoteCount) scope.push('includeVoteCount');
      return db.ImageResource.scope(...scope)
        .findOne({
          where: { id: imageResourceInstance.id, projectId: req.params.projectId },
        })
        .then((found) => {
          if (!found) throw new Error('Image resource not found');

          if (req.query.includePoll) {
            // TODO: naar poll hooks
            if (found.poll) found.poll.countVotes(!req.query.includeVotes);
          }
          found.project = req.project;
          req.results = found;
          next();
        })
        .catch(next);
    });
  })
  .put(async function (req, res, next) {
    // skip updating status if user is not allowed to mutate status
    if (!req.results.auth.canMutateStatus(req.user, req.results)) {
      delete req.body.statuses;
    }
    return next();
  })
  .put(async function (req, res, next) {
    // statuses
    let statuses = req.body.statuses;
    if (!Array.isArray(statuses)) return next();

    if (!statuses.every((t) => Number.isInteger(t))) {
      next('Statuses zijn niet gegeven in het juiste formaat');
    }

    const projectId = req.params.projectId;
    const statusEntities = await getValidStatuses(projectId, statuses, req.user);

    const imageResourceInstance = req.results;
    imageResourceInstance.setStatuses(statusEntities).then((result) => {
      // refetch. now with statuses
      let scope = [...req.scope, 'includeStatuses'];
      if (req.canIncludeVoteCount) scope.push('includeVoteCount');
      return db.ImageResource.scope(...scope)
        .findOne({
          where: { id: imageResourceInstance.id, projectId: req.params.projectId },
        })
        .then((found) => {
          if (!found) throw new Error('Image resource not found');

          if (req.query.includePoll) {
            // TODO: naar poll hooks
            if (found.poll) found.poll.countVotes(!req.query.includeVotes);
          }
          found.project = req.project;
          req.results = found;
          next();
        })
        .catch(next);
    });
  })
  .put(function (req, res, next) {
    res.json(req.results);
  })

  // delete image resource
  // ---------
  .delete(auth.useReqUser)
  .delete(function (req, res, next) {
    const imageResource = req.results;
    if (!(imageResource && imageResource.can && imageResource.can('delete')))
      return next(new Error('You cannot delete this image resource'));

    imageResource
      .destroy()
      .then(() => {
        res.json({ imageResource: 'deleted' });
      })
      .catch(next);
  });

// Get all valid tags of the project based on given ids
async function getValidTags(projectId, tags) {
  const uniqueIds = Array.from(new Set(tags));

  const tagsOfProject = await db.Tag.findAll({
    where: { projectId, id: { [Op.in]: uniqueIds } },
  });

  return tagsOfProject;
}

// Get all valid statuses of the project based on given ids
async function getValidStatuses(projectId, statuses) {
  const uniqueIds = Array.from(new Set(statuses));

  const statusesOfProject = await db.Status.findAll({
    where: { projectId, id: { [Op.in]: uniqueIds } },
  });

  return statusesOfProject;
}

module.exports = router;
