const fetch = require('node-fetch');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const crypto = require('crypto')

const express = require('express');
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(function(req, res, next) {
    const ttl = Date.now() + 60 * 1000;
    const secret = process.env.IMAGE_VERIFICATION_TOKEN + ttl
    const hash = crypto.createHmac("sha256", secret).digest("hex")
    const url = `${process.env.IMAGE_APP_URL}/image?exp_date=${ttl}&signature=${hash}`

    res.json(url)
  })

module.exports = router;
