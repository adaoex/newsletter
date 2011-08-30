<?php

/**
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */
// No direct access to this file
defined('_JEXEC') or die('Restricted access');

//  Uncoment this rows for debug
//  ini_set('error_reporting', E_ALL | E_STRICT | E_NOTICE | E_DEPRECATED);
//  ini_set('display_errors', '1');
//  ini_set("log_errors" , "0");
//  ini_set("error_log" , "/var/log/php-error.log");

// import joomla controller library
jimport('joomla.application.component.controller');
jimport('joomla.application.component.view');
jimport('joomla.form.helper');
jimport('migur.migur');

// Add the helper
JLoader::import('helpers.javascript', JPATH_COMPONENT_ADMINISTRATOR, '');
JLoader::import('helpers.rssfeed', JPATH_COMPONENT_ADMINISTRATOR, '');
JLoader::import('helpers.newsletter', JPATH_COMPONENT_ADMINISTRATOR, '');

// Handle the messages from previous requests
$sess = JFactory::getSession();
$msg = $sess->get('migur.queue');
if ($msg) {
	$sess->set('application.queue', $msg);
	$sess->set('migur.queue', null);
}

JFormHelper::addRulePath(JPATH_COMPONENT . DS . 'models' . DS . 'rules');
JTable::addIncludePath(JPATH_COMPONENT . DS . 'tables');

// Setup the cache
$cache = JFactory::getCache('com_newsletter');
$cache->setCaching(true);
$cache->setLifeTime(900); // cache to 5 min


// Get an instance of the controller
$controller = JController::getInstance('Newsletter');

// Perform the Request task
$controller->execute(JRequest::getCmd('task'));



// Redirect if set by the controller
$controller->redirect();

// if there is no redirection then let's check the license and notify the admin
// No need to check if this is a redirection
if ( JRequest::getString('tmpl') != 'component') {

	// Get license data (may be cached data)
	$info = NewsletterHelper::getCommonInfo();

	// If it has no valid license then show the RED message
	if ($info->is_valid == "JNO") {

		$app = JFactory::getApplication();
		$app->enqueueMessage(JText::_('COM_NEWSLETTER_LICENSE_INVALID'), 'error');
	}
}
