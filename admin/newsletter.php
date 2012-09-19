<?php

/**
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access to this file
defined('_JEXEC') or die('Restricted access');

//  Uncoment this rows for debug
//  ini_set('error_reporting', E_ALL | E_NOTICE);
//  ini_set('display_errors', '1');
//  ini_set("log_errors" , "0");
//  ini_set("error_log" , "/var/log/php-error.log");

require_once 'constants.php';

// Run autoloader
JLoader::import('helpers.autoload', COM_NEWSLETTER_PATH_ADMIN);
NewsletterHelperAutoload::setup();

try {

	// import joomla controller library
	jimport('joomla.application.component.controller');
	jimport('joomla.application.component.view');
	jimport('joomla.form.helper');
	jimport('migur.migur');

	
	JLoader::import('helpers.acl', COM_NEWSLETTER_PATH_ADMIN);
	
	// First check if user has access to the component.
	if (
		!AclHelper::canAccessComponent() /*|| 
		!AclHelper::actionIsAllowed(JRequest::getCmd('task'))*/
	) {
		AclHelper::redirectToAccessDenied();
	}
	
	// Add the helper
	JLoader::import('helpers.plugin', COM_NEWSLETTER_PATH_ADMIN);
	JLoader::import('helpers.javascript', COM_NEWSLETTER_PATH_ADMIN);
	JLoader::import('helpers.rssfeed', COM_NEWSLETTER_PATH_ADMIN);
	JLoader::import('helpers.newsletter', COM_NEWSLETTER_PATH_ADMIN);
	JLoader::import('helpers.log', COM_NEWSLETTER_PATH_ADMIN);
	JLoader::import('helpers.support', COM_NEWSLETTER_PATH_ADMIN);
	
	// Add the helper
	JHtml::addIncludePath(
		COM_NEWSLETTER_PATH_ADMIN . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'html');
	
	JToolbar::getInstance()->addButtonPath(
		COM_NEWSLETTER_PATH_ADMIN . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'toolbar' . DIRECTORY_SEPARATOR . 'button');

	MigurToolbar::addGlobalButtonPath(
		COM_NEWSLETTER_PATH_ADMIN . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'toolbar' . DIRECTORY_SEPARATOR . 'button');

	// Add translations used in JavaScript
	NewsletterHelperJavascript::requireTranslations();

	// Load 'Migur' group of plugins
	NewsletterHelperPlugin::prepare();	
	
	$app = JFactory::getApplication();
	$app->triggerEvent('onMigurStart');

	// Handle the messages from previous requests
	$sess = JFactory::getSession();
	$msg = $sess->get('migur.queue');
	if ($msg) {
		$sess->set('application.queue', $msg);
		$sess->set('migur.queue', null);
	}

	JFormHelper::addRulePath(JPATH_COMPONENT_ADMINISTRATOR . DIRECTORY_SEPARATOR . 'models' . DIRECTORY_SEPARATOR . 'rules');
	JTable::addIncludePath(JPATH_COMPONENT_ADMINISTRATOR . DIRECTORY_SEPARATOR . 'tables');
	MigurModel::addIncludePath(JPATH_COMPONENT_ADMINISTRATOR . DIRECTORY_SEPARATOR . 'models', 'NewsletterModel');
	MigurModel::addIncludePath(JPATH_COMPONENT_ADMINISTRATOR . DIRECTORY_SEPARATOR . 'models' . DIRECTORY_SEPARATOR . 'entities', 'NewsletterModelEntity');

	// Add the site root and user's ACL to JS
	JavascriptHelper::addStringVar('migurSiteRoot', JUri::root());
	JavascriptHelper::addObject('migurUserAcl', AclHelper::toArray());

	// Setup the cache
	$cache = JFactory::getCache('com_newsletter');
	$cache->setCaching(true);
	$cache->setLifeTime(900); // cache to 5 min

	// Get an instance of the controller
	// Here we get full task and preserve it from exploding
    JRequest::setVar('completetask', JRequest::getCmd('task'));
    
	$controller = MigurController::getInstance('Newsletter');
	
	// Perform the Request task
	// Here we get only tail of a task 
	$taskMethod = JFactory::getApplication()->input->get('task');
	$controller->execute($taskMethod);

	// Trigger events after exacution
	$app->triggerEvent('onMigurShoutdown');

	// Redirect if set by the controller
	$controller->redirect();

	//$app = JFactory::getApplication();
	//$results = $app->triggerEvent('onAfterRender', array());

	// If there is no redirection then let's check the license and notify the admin
	// No need to check if this is a redirection
	if ( JRequest::getString('tmpl') != 'component') {

		// Get license data (may be cached data)
		$info = NewsletterHelper::getCommonInfo();

		// If it has no valid license then show the RED message
		if ($info->is_valid == "JNO") {
			$app->enqueueMessage(JText::_('COM_NEWSLETTER_LICENSE_INVALID'), 'error');
		}
	}
	
} catch (Exception $e) {
	
	NewsletterHelperLog::addDebug(
		'COM_NEWSLETTER_UNCAUGHT_EXCEPTION',
		'common',
		$e);
	
	throw $e;
}

