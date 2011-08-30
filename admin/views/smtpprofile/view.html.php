<?php

/**
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */
// No direct access to this file
JHtml::addIncludePath(JPATH_COMPONENT . '/helpers/html');
JHtml::_('behavior.formvalidation');
defined('_JEXEC') or die('Restricted access');
jimport('joomla.form.helper');
jimport('migur.library.toolbar');
jimport('joomla.html.pagination');
JHtml::_('behavior.framework');

// import Joomla view library

/**
 * Newsletter View
 */
class NewsletterViewSmtpprofile extends MigurView
{

	protected $items;
	protected $pagination;
	protected $state;

	/**
	 * Display the view
	 *
	 * @return	void
	 */
	public function display($tpl = null)
	{
		JHTML::stylesheet('media/com_newsletter/css/admin.css');
		JHTML::stylesheet('media/com_newsletter/css/smtpprofile.css');
		JHTML::script('media/com_newsletter/js/migur/js/core.js');
		//JHTML::script('media/com_newsletter/js/migur/js/message.js');
		//$script = $this->get('Script');
		//$this->script = $script;


		$this->ssForm = $this->get('Form', 'smtpprofile');
		//var_dump($this->ssForm); die();
		// Check for errors.
		if (count($errors = $this->get('Errors'))) {
			JError::raiseError(500, implode("\n", $errors));
			return false;
		}

		$this->addToolbar();

		parent::display($tpl);

		// Set the document
		$this->setDocument();
	}

	/**
	 * Add the page title and toolbar.
	 *
	 * @since	1.0
	 */
	protected function addToolbar()
	{
		$bar = JToolBar::getInstance('smtp-toolbar', 'smtpprofileForm');
		$bar->appendButton('Standard', 'cancel', 'JTOOLBAR_CANCEL', '', false);
		$bar->appendButton('Standard', 'save', 'JTOOLBAR_SAVE', 'smtpprofile.save', false);
	}

	/**
	 * Method to set up the document properties
	 *
	 * @return void
	 */
	protected function setDocument()
	{
		$isNew = (!JRequest::get('smtp_profile_id', false) );
		$document = JFactory::getDocument();
		$document->setTitle($isNew ? JText::_('COM_NEWSLETTER_SMTP_CREATING') : JText::_('COM_NEWSLETTER_SMTP_EDITING'));
		$document->addScript(JURI::root() . "/administrator/components/com_newsletter/views/smtpprofile/submitbutton.js");
		$document->addScript(JURI::root() . "/administrator/components/com_newsletter/views/smtpprofile/smtpprofile.js");
		JText::script('COM_NEWSLETTER_SMTP_ERROR_UNACCEPTABLE');
	}

}