<?php
/**
 * @version		$Id:  $
 * @package		Components
 * @subpackage	com_newsletter
 * @copyright	Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license		GNU General Public License version 2 or later; see LICENSE.txt
 */

// No direct access
defined('_JEXEC') or die;

jimport('joomla.application.component.view');
JLoader::import('helpers.subscriber', JPATH_COMPONENT_ADMINISTRATOR, '');

/**
 * HTML Subscribe View class for the Newsletter component
 *
 * @package		Newsletter.Site
 * @subpackage	com_newsletter
 * @since 		1.0
 */
class NewsletterViewSubscribe extends MigurView
{
	function display($tpl = null)
	{
		$uid = JRequest::getString('uid', '');
		$nid = JRequest::getString('nid', '');

		$user = JFactory::getUser();

		$subscriber = MigurModel::getInstance('Subscriber', 'NewsletterModelEntity');

		if (!empty($uid)) {
			$subscriber->load(array('subscription_key' => $uid));

		} elseif(!empty($user->id)) {
			$subscriber->load('-'.$user->id);
		}

		$lists = NewsletterHelperSubscriber::getLists($subscriber->subscription_key);

		$this->assignRef('user', $user);
		$this->assign('subscriber', $subscriber->toObject());
		$this->assignRef('lists', $lists);
		$this->assign('uid',   $subscriber->subscription_key);
		$this->assign('nid',   $nid);

		$this->setDocument();

		parent::display();
	}

	function setDocument(){
		NewsletterHelperView::addStyleSheet('media/com_newsletter/css/unsubscribe.css');
	}
}
