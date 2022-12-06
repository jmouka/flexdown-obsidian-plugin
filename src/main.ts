import { App, MarkdownPostProcessorContext, MarkdownRenderer, Plugin, PluginSettingTab, Setting } from 'obsidian';
import flexdown from 'src/flexdown.js';

interface FlexdownSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: FlexdownSettings = {
	mySetting: 'default'
}

export default class Flexdown extends Plugin {
	settings: FlexdownSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// This adds an editor command that can perform some operation on the current editor instance

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });
		
		
		// what does this do?
		// registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): MarkdownPostProcessor;
		
		let registered = this.registerMarkdownCodeBlockProcessor('flexdown', this.renderFlexdown);

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	renderFlexdown(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		let data = flexdown.parse(source);
		flexdown.render(data, el, 
			// function to create a new html node
			function(node: HTMLElement, tag:any, classes:string[]) {
				var newNode = node.createEl(tag);
				newNode.addClasses(classes);
				return newNode
			},
			// function to render markdown inside an html node
			function(markdownText:string, node: HTMLElement) {
				MarkdownRenderer.renderMarkdown(markdownText, node, ctx.sourcePath, this);
			}
		);

	}
}




class SampleSettingTab extends PluginSettingTab {
	plugin: Flexdown;

	constructor(app: App, plugin: Flexdown) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
