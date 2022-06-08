// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "gip-projekt" is now active!');

	let disposable = vscode.commands.registerCommand('gip-projekt.createproject', () => {
		// Set folder picker options
		const options: vscode.OpenDialogOptions = {
			canSelectFolders: true,
			openLabel: 'Ordner auswählen',
		};
		
		// Set project name
		vscode.window.showInputBox().then((projectName) => {
			if (projectName !== null) {
				// Pick folder
				vscode.window.showOpenDialog(options).then(folderUri => {
					if (folderUri && folderUri[0]) {
						createWorkspace(context, projectName!, folderUri[0]);
					}
				});
			}
		});
	});

	context.subscriptions.push(disposable);
}

function createWorkspace(context: vscode.ExtensionContext, 
	projectName: string, folderUri: vscode.Uri) {
	// Create folder
	var fullPath = vscode.Uri.parse(`${folderUri.path}/${projectName}`);
	vscode.workspace.fs.readDirectory(fullPath).then((onfulfilled) => {
		vscode.window.showErrorMessage('Fehler 01: Ein Ordner mit dem Projektnamen existiert bereits.');
		return;
	});
	vscode.workspace.fs.createDirectory(fullPath);

	// Add folder to workspace
	vscode.workspace.updateWorkspaceFolders(0,
		undefined,
		{ uri: fullPath, name: projectName });

	// Copy Platform specific configs
	var configPath = "";
	switch (process.platform) {
		case 'win32':
			configPath = context.extensionUri.path + '/config/windows/';
			break;
		case 'darwin':
			configPath = context.extensionUri.path + '/config/osx/';
			break;
		case 'linux': // or wsl
			configPath = context.extensionUri.path + '/config/linux/';
			break;
	}
	if (configPath === '') {
		vscode.window.showErrorMessage('Fehler 02: Unbekanntes Betriebssystem.');
		return;
	}

	// Copy config files
	var configFiles = ['launch.json', 'tasks.json'];
	for (var i in configFiles) {
		vscode.workspace.fs.copy(vscode.Uri.parse(configPath + configFiles[i]), 
			vscode.Uri.parse(`${fullPath.path}/.vscode/${configFiles[i]}`));
	}

	// Copy sample main.cpp
	vscode.workspace.fs.copy(vscode.Uri.parse(configPath + 'main.cpp'), 
		vscode.Uri.parse(`${fullPath.path}/main.cpp`));

	// Show success message
	vscode.window.showInformationMessage('Projekt erfolgreich erstellt!');
}

// this method is called when your extension is deactivated
export function deactivate() { }
