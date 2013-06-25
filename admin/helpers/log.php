<?php

/**
 * The newsltter main component helper
 *
 * @version	   $Id:  $
 * @copyright  Copyright (C) 2011 Migur Ltd. All rights reserved.
 * @license	   GNU General Public License version 2 or later; see LICENSE.txt
 */
// No direct access
defined('_JEXEC') or die;

JLoader::import('tables.mailboxprofile', COM_NEWSLETTER_PATH_ADMIN);
JLoader::import('tables.smtpprofile', COM_NEWSLETTER_PATH_ADMIN);


/**
 * Content component helper.
 * 
 * To test:
 * LogHelper::addDebug('Newsletter bebug', 'test', array('name1' => 'value1'));
 * LogHelper::addMessage('Newsletter message', 'test', array('name2' => 'value2'));
 * LogHelper::addError('Newsletter error', 'test', array('name3' => 'value3'));
 * JError::raiseError(501, 'Joomla error');
 * JError::raiseNotice(501, 'notice'); // onto screen
 *
 * @since		1.0
 */
class NewsletterHelperLog
{
	
	const CAT_BOUNCES = 'bounces';

	const CAT_MAILER = 'mailer';

	const CAT_SUBSCRIPTION = 'subscription';
	
	const CAT_AUTOMAILING = 'automailing';
    
    const CAT_TRACKING = 'tracking';
	
	const CAT_MAILBOX = 'mailbox';

	const CAT_UPLOAD = 'upload';

	const CAT_IMPORT = 'import';

    const CAT_EXCLUDE = 'exclude';

	public static $langIsLoaded = false;
	
	/**
	 * Set db logger. Since all JErrors E_ERROR will be added to log.
	 * Usefull if you render something J! native. 
	 * Covers all E_ERROR generated by 
	 * JError::raiseError, JError::raise, JError::throwError.
	 * 
	 * All execs of JLog::add(...) with 
	 * JLog::EMERGENCY | JLog::ALERT | JLog::CRITICAL | JLog::ERROR
	 * will be added to LOGS table.
	 */ 
	static public function startJoomlaDbErrorLogger() 
	{
		// Add handler to JError for E_ERROR
		JError::setErrorHandling(
			E_ERROR, 
			'callback', 
			array('LogHelper', 'addJError'));

		// Now we log all the troubles into our LOGS table.
		JLog::addLogger(
			array(
				'logger' => 'database',
				'db_table' => '#__newsletter_logs'),
			JLog::EMERGENCY | JLog::ALERT | JLog::CRITICAL | JLog::ERROR
		);
		
	}

	
	
	/**
	 * Log a debug messagge into file. Only if debugging is on
	 * 
	 * @param string Message
	 * @param string File name, usae current date otherwise
	 * @param boolean Use to force the logging
	 */ 
	static public function addDebug($msg, $category = null, $data = null) 
	{
		$params = JComponentHelper::getParams('com_newsletter');
		$logging = $params->get('debug', false);
		
		if (!$logging) {
			return;
		}
		
		return self::addEntry(JLog::DEBUG, $msg, $category, $data);
	}

	
	
	/**
	 * Log a message into log.
	 * 
	 * @param string Message
	 * @param string File name, usae current date otherwise
	 * @param boolean Use to force the logging
	 */ 
	static public function addMessage($msg, $category = null, $data = null) 
	{
		return self::addEntry(JLog::INFO, $msg, $category, $data);
	}
	
	

	/**
	 * Log a message into log.
	 * 
	 * @param string Message
	 * @param string File name, usae current date otherwise
	 * @param boolean Use to force the logging
	 */ 
	static public function addWarning($msg, $category = null, $data = null) 
	{
		return self::addEntry(JLog::WARNING, $msg, $category, $data);
	}
	
	

	/**
	 * Log a message into log.
	 * 
	 * @param string Message
	 * @param string File name, usae current date otherwise
	 * @param boolean Use to force the logging
	 */ 
	static public function addError($msg, $category = null, $data = null) 
	{
		return self::addEntry(JLog::ERROR, $msg, $category, $data);
	}

	

	/**
	 * Log a message into log.
	 * 
	 * @param string Message
	 * @param string File name, usae current date otherwise
	 * @param boolean Use to force the logging
	 */ 
	static public function addJError($error) 
	{
		return self::addEntry(JLog::ERROR, $error->get('message'), $error->get('category'), array('code' => $error->get('code')));
	}
	
	
	
	/**
	 * Log a entry into log.
	 * 
	 * @param string Message
	 * @param string File name, usae current date otherwise
	 * @param boolean Use to force the logging
	 */ 
	static public function addEntry($priority, $msg, $category = null, $data = null) 
	{
		try {

			if (!self::$langIsLoaded) {
				self::$langIsLoaded = self::loadTranslations();
			}
			
			// Cant use it because or we cant log WARNINGS AND NOTICES 
			// or we wil log ALL WARNINGS AND NOTICES even J! deprecated messages..Baad.

			//$logEntry = new JLogEntry(
			//	$msg,
			//	$priority,
			//	$category,
			//	date('Y-m-d H:i:s'));
			//
			//$logEntry->params = json_encode($data);
			//@JLog::add($logEntry);
			
			// To avoid infinit looping if something wrong with JTable::getInstance()
			$dbo = JFactory::getDbo();
			require_once(COM_NEWSLETTER_PATH_ADMIN . DIRECTORY_SEPARATOR .'tables'. DIRECTORY_SEPARATOR .'log.php');
			$table = new NewsletterTableLog($dbo);
			
			// Type conversion
			if ($data instanceof Exception) {
				$data = array(
					'Exception' => get_class($data),
					'message'   => $data->getMessage(),
					'trace'     => $data->getTraceAsString(),
					'code'      => $data->getCode(),
					'file'      => $data->getFile(),
					'line'      => $data->getLine()
				);	
			}
			
			if ($data instanceof JObject) {
				$data = json_encode($data->getProperties());
			}
			
			if (is_array($data) || is_object($data)) {
				$data = json_encode($data);
			}

			// Storing
			$table->save(array(
				'message'  => JText::_($msg),
				'priority' => $priority,
				'category' => $category,
				'date'     => date('Y-m-d H:i:s'),
				'params'   => (string)$data
			));
			
		} catch(Exception $e) {
			
			return false;
		}	
		
		return true;
	}
	
	
	static public function debugBacktrace($html = true, $compact = true) {
		
		$backtracel = '';
		$del = $html? '<br /><br />':"\n\n";
		
		if (!$compact) {
			
			foreach(debug_backtrace() as $k=>$v){
				if($v['function'] == "include" || $v['function'] == "include_once" || $v['function'] == "require_once" || $v['function'] == "require"){
					$backtracel .= "#".$k." ".$v['function']."(".$v['args'][0].") called at [".$v['file'].":".$v['line']."]".$del;
				}else{
					$backtracel .= "#".$k." ".$v['function']."() called at [".$v['file'].":".$v['line']."]".$del;
				}
			}
			
		} else {
			
			ob_end_flush();
			ob_start();
			debug_print_backtrace();
			$raw = ob_get_clean();
			
			preg_match_all('/#[^#]*/', $raw, $matches);
			
			$backtracel = ''; 
			$tagOpen = ''; 
			$tagClosed = '';
			
			foreach($matches[0] as $row){
				$backtracel .= $tagOpen.$row.$tagClosed.$del;
				
				if ($html) {
					$tagOpen = ($tagOpen == '')? '<b>':'';
					$tagClosed = ($tagClosed == '')? '</b>':'';
				}
			}
		}
		
		return $backtracel;
	}
	
	static function loadTranslations() 
	{
		$lang = JFactory::getLanguage();
		return $lang->load('com_newsletter_log', JPATH_ADMINISTRATOR);
	}
}

/**
 * Legacy support for class name
 * Should be removed after 12.07
 */
class LogHelper extends NewsletterHelperLog
{}