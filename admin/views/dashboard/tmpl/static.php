<?php echo $this->loadTemplate('updater', ''); ?>

<div id="links">
    <a href="http://migur.com/support/documentation/newsletter" target="_blank" class="horizontal margin-5">
		<?php echo JText::_('COM_NEWSLETTER_DOCS'); ?>
    </a>
    |
    <a href="http://migur.com/support/tutorials/newsletter" target="_blank" class="horizontal margin-5">
		<?php echo JText::_('COM_NEWSLETTER_VIDEO'); ?>
    </a>
    |
    <a href="http://migur.com/community/forum/4-newsletter-component" target="_blank" class="horizontal margin-5">
		<?php echo JText::_('COM_NEWSLETTER_SUPPORT'); ?>
    </a>
</div>

<?php echo $this->loadTemplate('news', ''); ?>

<!-- For later versions

		<fieldset id="config">
			<div class="legend"><?php //echo JText::_('COM_NEWSLETTER_CONFIG_SCORE') . "<br />"; ?></div>
			<div class="center blue margin-5"><?php //echo "75 / 100"; ?></div>
		</fieldset>
-->
