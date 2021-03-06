<?php

/**
 * Migur Ajax Search Plugin
 * 
 * @version		$Id: migursearch.php $
 * @package		Joomla
 * @subpackage	System
 * @copyright	Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license		GNU/GPL, see LICENSE.php
 */
// Check to ensure this file is included in Joomla!
defined('_JEXEC') or die;

jimport('joomla.plugin.plugin');

/**
 * Migur Parameter catcher
 *
 * @package		Joomla
 * @subpackage	Migur
 * @since 		1.6
 */
class plgSystemMiguruserreg extends JPlugin
{

	protected $_disabled = false;

	protected $_task = '';
	
	protected $_userGroupsBefore = array();
	
	protected $_rules = array();
	
	/**
	 * Plugin that enhances the core Joomla! Search field and gives Ajax results
	 * 
	 * @param $subject
	 * @param $config - array - config data of plugin
	 * 
	 * @return void
	 */
	public function __construct($subject, $config)
	{
		parent::__construct($subject, $config);

		// Check if component is present
		$bootstrap = JPATH_ADMINISTRATOR . 
			DIRECTORY_SEPARATOR . 'components' . 
			DIRECTORY_SEPARATOR . 'com_newsletter' . 
			DIRECTORY_SEPARATOR . 'bootstrap.php';
		
		if (!file_exists($bootstrap)) {
			$this->_disabled = true;
			return;
		}	
		
		$newsletter = JComponentHelper::getComponent('com_newsletter');
		if (empty($newsletter)) {
			$this->_disabled = true;
			return;
		}	

		require_once $bootstrap;
		
		MigurComNewsletterBootstrap::initAutoloading();
		MigurComNewsletterBootstrap::initEnvironment();
		
		$lang = JFactory::getLanguage();
		$lang->load('plg_user_miguruserreg', JPATH_ADMINISTRATOR, null, false, false);

		JLoader::import('helpers.plugin', COM_NEWSLETTER_PATH_ADMIN);
		JLoader::import('models.automailing.manager', COM_NEWSLETTER_PATH_ADMIN);
		NewsletterHelperPlugin::prepare();
	}


	/** 
	 * Is used to get of a user's groups.
	 * 
	 * @param type $user
	 * @param type $isnew
	 * @param type $success
	 * @param type $msg 
	 */
	public function onUserAfterSave($user)
	{
		if ($this->_disabled) return true;

		// Try to determine what we should do...
		$option	= JRequest::getVar('option', '');
		$task	= JRequest::getVar('task', '');

		if ($option == 'com_users') {
			if ($task == 'register') {
				$this->_usersRegistrationRegister($user);
			}
		}
	}
	
	protected function _usersRegistrationRegister($user)
	{
		$lid = $this->params->get('listid');
		
		if (empty($lid)) {
			return;
		}
		
		// Get models
		$subscriberModel = MigurModel::getInstance('Subscriber', 'NewsletterModel');
		$listModel = MigurModel::getInstance('List', 'NewsletterModel');
		// Just for creation of a uid-sid relation
		$subscriber = $subscriberModel->getItem(array('user_id' => $user['id']));
		$sid = $subscriber['subscriber_id'];
		
		$list = $listModel->getItem($lid);

		try {
			$dbo = JFactory::getDbo();
			$dbo->transactionStart();
			
			$listModel->assignSubscriber($lid, $subscriber, array('confirmed' => false));

			// Add to history all subscriptions
			$history = JTable::getInstance('history', 'NewsletterTable');
			$history->save(array(
				'subscriber_id' => $sid,
				'list_id' => $lid,
				'newsletter_id' => NULL,
				'action' => NewsletterTableHistory::ACTION_SIGNEDUP,
				'date' => date('Y-m-d H:i:s'),
				'text' => addslashes($list->name)
			));
			unset($history);

			// If list is not confirmed then send the newsletter
			if(!$listModel->isConfirmed($lid, $sid)) {

				// Immediately mail subscription letter
				$res = $listModel->sendSubscriptionMail(
					$subscriber, 
					$list->list_id,
					array(
						'ignoreDuplicates' => true
					));

				// Set message and add some logs
				if($res) {
					$message =
						JText::sprintf('COM_NEWSLETTER_THANK_YOU_FOR_SUBSCRIBING', $user['name']) . ' ' .
						JText::_('COM_NEWSLETTER_YOU_WILL_NEED_CONFIRM_SUBSCRIPTION');
				}
			}		

			// Triggering the subscribed plugins.
			// Process automailing via internal plugin plgMigurAutomail
			JFactory::getApplication()->triggerEvent(
				'onMigurAfterSubscribe', 
				array(
					'subscriberId' => $sid,
					'lists' => array($lid))
			);

			$dbo->transactionCommit();
			
		} catch(Exception $e) {
			
			$dbo->transactionRollback();
			
			if (class_exists('NewsletterHelperLog')) {
				
				unset($user['password']);
				unset($user['password2']);
				
				NewsletterHelperLog::addError(
					JText::_($e->getMessage()),
					'plg_miguruserreg',
					$user);
			}	
		}
	}
}

