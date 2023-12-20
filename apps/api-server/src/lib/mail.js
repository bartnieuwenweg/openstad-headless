const config = require('config');
const nodemailer = require('nodemailer');
const merge = require('merge');
const { htmlToText } = require('html-to-text');
const MailConfig = require('./mail-config');
const mailTransporter = require('./mailTransporter');

const debug = require('debug');
const log = debug('app:mail:sent');
const logError = debug('app:mail:error');

// nunjucks is used when sending emails
var nunjucks = require('nunjucks');
var moment = require('moment-timezone');
var env = nunjucks.configure('email');

var dateFilter = require('../lib/nunjucks-date-filter');
dateFilter.setDefaultFormat('DD-MM-YYYY HH:mm');
env.addFilter('date', dateFilter);

// Global variables.
env.addGlobal('HOSTNAME', config.get('domain'));
env.addGlobal('PROJECTNAME', config.get('projectName'));
//env.addGlobal('PAGENAME_POSTFIX', config.get('pageNamePostfix'));
env.addGlobal('EMAIL', config.get('mail.from'));

env.addGlobal('GLOBALS', config.get('express.rendering.globals'));

env.addGlobal('config', config);

// Default options for a single email.
let defaultSendMailOptions = {
  from: config.get('mail.from'),
  subject: 'No title',
  text: 'No message',
};

// generic send mail function
function sendMail(project, options) {
  if (options.attachments) {
    options.attachments.forEach((entry, index) => {
      options.attachments[index] = {
        filename: entry,
        path: 'email/uploads/' + entry,
        cid: entry,
      };
    });
  }

  mailTransporter.getTransporter(project).then((transporter) => {
    transporter.sendMail(
      merge(defaultSendMailOptions, options),
      function (error, info) {
        if (error) {
          logError(error.message);
        } else {
          log(info.response);
        }
      }
    );
  });
}

async function sendNotificationMail(data, project) {
  try {
    let projectConfig = await new MailConfig(project);
    data.logo = projectConfig.getLogo();

    let html;

    if (data.html) {
      html = data.html;
    } else if (data.template) {
      html = nunjucks.renderString(data.template, data);
    } else {
      html = nunjucks.render('notifications_admin.njk', data);
    }

    sendMail(project, {
      to: data.to,
      from: data.from,
      subject: data.subject,
      html: html,
      text: `Er hebben recent activiteiten plaatsgevonden op ${data.PROJECTNAME} die mogelijk voor jou interessant zijn!`,
      attachments: projectConfig.getDefaultEmailAttachments(),
    });
  } catch (err) {
    console.error(err);
  }
}

async function sendConceptEmail(resource, project, user) {
  try {
    let projectConfig = await new MailConfig(project);

    let resourceConceptEmail =
      projectConfig.getResourceConceptEmail();
    const hasBeenPublished = resource.publishDate;
    if (hasBeenPublished) {
      resourceConceptEmail =
        projectConfig.getResourceConceptToPublishedEmail();
    }

    const url = projectConfig.getCmsUrl();
    const logo = projectConfig.getLogo();
    const hostname = projectConfig.getCmsHostname();
    const projectname = projectConfig.getTitle();

    let inzendingPath = resourceConceptEmail.inzendingPath;
    const inzendingURL = getInzendingURL(
      inzendingPath,
      url,
      resource,
    );

    let fromAddress = resourceConceptEmail.from || config.email;
    if (!fromAddress)
      return console.error('Email error: fromAddress not provided');
    if (fromAddress.match(/^.+<(.+)>$/, '$1'))
      fromAddress = fromAddress.replace(/^.+<(.+)>$/, '$1');

    const data = prepareEmailData(
      user,
      resource,
      hostname,
      projectname,
      inzendingURL,
      url,
      fromAddress,
      logo
    );

    const template = resourceConceptEmail.template;
    const html = prepareHtml(template, data);
    const text = convertHtmlToText(html);
    const attachments =
      resourceConceptEmail.attachments ||
      projectConfig.getDefaultEmailAttachments();

    sendMail(project, {
      to: resource.email ? resource.email : user.email,
      from: fromAddress,
      subject:
        resourceConceptEmail.subject || 'Bedankt voor je CONCEPT inzending!',
      html: html,
      text: text,
      attachments,
    });
  } catch (err) {
    console.error(err);
  }
}

// send email to user that submitted a resource
async function sendThankYouMail(resource, project, user) {
  try {
    let projectConfig = await new MailConfig(project);

    const url = projectConfig.getCmsUrl();
    const hostname = projectConfig.getCmsHostname();
    const projectname = projectConfig.getTitle();
    let inzendingPath =
      projectConfig.getFeedbackEmailInzendingPath();
    const inzendingURL = getInzendingURL(
      inzendingPath,
      url,
      resource,
    );

    let fromAddress =
      projectConfig.getFeedbackEmailFrom() || config.email;
    if (!fromAddress)
      return console.error('Email error: fromAddress not provided');
    if (fromAddress.match(/^.+<(.+)>$/, '$1'))
      fromAddress = fromAddress.replace(/^.+<(.+)>$/, '$1');

    const logo = projectConfig.getLogo();
    const data = prepareEmailData(
      user,
      resource,
      hostname,
      projectname,
      inzendingURL,
      url,
      fromAddress,
      logo
    );

    let template = projectConfig.getResourceFeedbackEmailTemplate();
    const html = prepareHtml(template, data);
    const text = convertHtmlToText(html);
    const attachments =
      projectConfig.getResourceFeedbackEmailAttachments() ||
      projectConfig.getDefaultEmailAttachments();

    sendMail(project, {
      // in some cases the resource, like order or account has a different email from the submitted user, default to resource, otherwise send to owner of resource
      to: resource.email ? resource.email : user.email,
      from: fromAddress,
      subject:
        projectConfig.getResourceFeedbackEmailSubject() ||
        'Bedankt voor je inzending',
      html: html,
      text: text,
      attachments,
    });
  } catch (err) {
    console.error(err);
  }
}

function prepareEmailData(
  user,
  resource,
  hostname,
  projectname,
  inzendingURL,
  url,
  fromAddress,
  logo
) {
  return {
    date: new Date(),
    user,
    resource,
    HOSTNAME: hostname,
    PROJECTNAME: projectname,
    inzendingURL,
    URL: url,
    EMAIL: fromAddress,
    logo,
  };
}

function prepareHtml(template, data) {
  /**
   * This is for legacy reasons
   * if contains <html> we assume it doesn't need a layout wrapper then render as a string
   * if not included then include by rendering the string and then rendering a blanco
   * the layout by calling the blanco template
   */
  let html;
  if (template.includes('<html>')) {
    html = nunjucks.renderString(template, data);
  } else {
    html = nunjucks.render(
      'blanco.njk',
      Object.assign(data, {
        message: nunjucks.renderString(template, data),
      })
    );
  }
  return html;
}

function convertHtmlToText(html) {
  return htmlToText(html, {
    ignoreImage: true,
    hideLinkHrefIfSameAsText: true,
    uppercaseHeadings: false,
  });
}

// send email to user that is about to be anonymized
// todo: this is a copy of sendThankYouMail and has too many code duplications; that should be merged. But since there is a new notification system that should be implemented more widly I am not going to spent time on that now
async function sendInactiveWarningEmail(project, user) {
  try {
    let projectConfig = await new MailConfig(project);

    const url = projectConfig.getCmsUrl();
    const hostname = projectConfig.getCmsHostname();
    const projectname = projectConfig.getTitle();
    let fromAddress = project.config.notifications.fromAddress || config.email;
    if (!fromAddress)
      return console.error('Email error: fromAddress not provided');
    if (fromAddress.match(/^.+<(.+)>$/, '$1'))
      fromAddress = fromAddress.replace(/^.+<(.+)>$/, '$1');
    const logo = projectConfig.getLogo();

    const XDaysBeforeAnonymization =
      (project.config.anonymize &&
        project.config.anonymize.anonymizeUsersAfterXDaysOfInactivity -
          project.config.anonymize.warnUsersAfterXDaysOfInactivity) ||
      60;
    let ANONYMIZEDATE = new Date();
    ANONYMIZEDATE = ANONYMIZEDATE.setDate(
      ANONYMIZEDATE.getDate() + XDaysBeforeAnonymization
    );
    ANONYMIZEDATE = new Date(ANONYMIZEDATE).toLocaleDateString('nl-NL');

    let data = {
      date: new Date(),
      user: user,
      HOSTNAME: hostname,
      PROJECTNAME: projectname,
      URL: url,
      EMAIL: fromAddress,
      logo: logo,
      XDaysBeforeAnonymization,
      DISPLAYNAME: user.displayName,
      ANONYMIZEDATE,
    };

    let template = project.config.anonymize.inactiveWarningEmail.template;
    let html = nunjucks.renderString(template, data);

    let text = htmlToText.fromString(html, {
      ignoreImage: true,
      hideLinkHrefIfSameAsText: true,
      uppercaseHeadings: false,
    });

    let attachments =
      projectConfig.getResourceFeedbackEmailAttachments() ||
      projectConfig.getDefaultEmailAttachments();

    sendMail(project, {
      to: user.email,
      from: fromAddress,
      subject:
        project.config.anonymize.inactiveWarningEmail.subject ||
        'Je account wordt binnenkort verwijderd',
      html: html,
      text: text,
      attachments,
    });
  } catch (err) {
    console.error(err);
  }
}

function getInzendingURL(inzendingPath, url, resource) {
  let idRegex = new RegExp(`\\{(?:resources|resource)?Id\\}`, 'g');
  let oldIdRegex = new RegExp(`\\[\\[(?:Resources|resource)?Id\\]\\]`, 'g');

  inzendingPath =
    (inzendingPath &&
      inzendingPath
        .replace(idRegex, resource.id)
        .replace(oldIdRegex, resource.id)
        .replace(/\[\[resourceType\]\]/, 'resources')) ||
    '/';
  return url + inzendingPath;
}

module.exports = {
  sendMail,
  sendNotificationMail,
  sendThankYouMail,
  sendConceptEmail,
  sendInactiveWarningEmail,
};
