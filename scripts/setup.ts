import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

let dbName: string

// Function to execute shell commands
function executeCommand(command: string) {
    console.log(`\x1b[33m${command}\x1b[0m`);
    try {
        return execSync(command, { encoding: 'utf-8' });
        //@ts-expect-error
    } catch (error: {
        stdout?: unknown
        stderr?: unknown
    }) {
        return { error: true, message: error.stdout || error.stderr };
    }
}

// Function to prompt user for input without readline-sync
function prompt(message: string, defaultValue: string): string {
    process.stdout.write(`${message} (${defaultValue}): `);
    const buffer: Buffer = Buffer.alloc(100);
    const bytes = fs.readSync(0, buffer, 0, buffer.length, null);
    const userInput = buffer.slice(0, bytes - 1).toString();
    return userInput || defaultValue;
}

// Function to install dependencies with loader message
function installDependencies() {
    console.log('\x1b[33mInstalling dependencies...\x1b[0m');
    // Run bun i command with loader
    executeCommand('bun i');
}

// Function to create database and update wrangler.toml
function createDatabaseAndConfigure() {
    // Guide the user
    console.log('\x1b[33mLet\'s set up your database...\x1b[0m');

    // Prompt user for the database name
    const defaultDBName = path.basename(process.cwd()) + '-db';
    dbName = prompt('Enter the name of your database', defaultDBName);

    // Run command to create a new database
    const creationOutput = executeCommand(`bunx wrangler d1 create ${dbName}`);

    const wranglerTomlPath = path.join(__dirname, '..', 'apps', 'web', 'wrangler.toml');

    // @ts-expect-error
    if (creationOutput.error) {
        console.log('\x1b[31mThe d1 database already exists. You will need to edit wrangler.toml to include the ID of your database.\x1b[0m');
        const databaseConfig = `\ndatabase_name = "${dbName}"\n`;
        fs.appendFileSync(wranglerTomlPath, databaseConfig);
        return;
    } else {
        // Extract database ID from the output
        const matchResult = (creationOutput as string).match(/database_id = "(.*)"/);
        if (matchResult && matchResult.length === 2) {
            const databaseID = matchResult[1];

            const databaseConfig = `\ndatabase_name = "${dbName}"\ndatabase_id = "${databaseID}"\n`;
            fs.appendFileSync(wranglerTomlPath, databaseConfig);

            // Guide the user
            console.log('\x1b[33mDatabase configuration updated in wrangler.toml\x1b[0m');
        } else {
            console.error('Failed to extract database ID from the output.');
            // Handle error gracefully
        }
    }
}

// Function to prompt for Google client credentials
function promptForGoogleClientCredentials() {
    // Guide the user
    console.log('\x1b[33mNow, time for auth!\x1b[0m');

    // Provide instructions on how to get Google client IDs
    console.log('Please follow the instructions below to obtain your Google client ID and client secret:');
    console.log('1. Go to the Google Developer Console (https://console.developers.google.com/)');
    console.log('2. Create a new project or select an existing one.');
    console.log('3. Enable the Google Drive API for your project.');
    console.log('4. Create credentials (OAuth client ID) for a Web application.');
    console.log('5. Add http://localhost:3000/api/auth/callback/google as the redirect domain')

    // Prompt user for client ID and client secret
    const clientId = prompt('Enter your Google Client ID', '');

    const clientSecret = prompt('Enter your Google Client Secret', '');

    // Get .dev.vars file path
    const devVarsPath = path.join(__dirname, '..', 'apps', 'web', '.dev.vars');

    // Check if .dev.vars already exists
    if (!fs.existsSync(devVarsPath)) {
        // Create .dev.vars file and write credentials
        fs.writeFileSync(devVarsPath, `GOOGLE_CLIENT_ID=${clientId}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`);
        console.log('\x1b[33m.dev.vars file created with Google Client ID and Client Secret.\x1b[0m');
    } else {
        // Append credentials to .dev.vars file
        fs.appendFileSync(devVarsPath, `\nGOOGLE_CLIENT_ID=${clientId}\nGOOGLE_CLIENT_SECRET=${clientSecret}`);
        console.log('\x1b[33mGoogle Client ID and Client Secret appended to .dev.vars file.\x1b[0m');
    }
}

// Function to generate secure random 32-character string
function generateSecureRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Function to update .dev.vars with secure random string
function updateDevVarsWithSecret() {
    // Generate secure random string
    const secret = generateSecureRandomString(32);
    
    // Get .dev.vars file path
    const devVarsPath = path.join(__dirname, '..', 'apps', 'web', '.dev.vars');

    // Append secret to .dev.vars file
    fs.appendFileSync(devVarsPath, `\nNEXTAUTH_SECRET=${secret}`);
    console.log('\x1b[33mSecret appended to .dev.vars file.\x1b[0m');
}

// Function to run database migrations
function runDatabaseMigrations(dbName: string) {

    // Generate setup migration
    executeCommand('cd apps/web && bunx drizzle-kit generate --name setup');

    // Run migration
    executeCommand(`cd apps/web && wrangler d1 execute ${dbName} --local --file=migrations/0000_setup.sql`);
}

// Main function
async function main() {
    installDependencies();
    createDatabaseAndConfigure();
    promptForGoogleClientCredentials();
    console.log('\x1b[33mReady... Set... Launch\x1b[0m');

    // Generate secure random string and update .dev.vars
    updateDevVarsWithSecret();
    runDatabaseMigrations(dbName);

    // Run `bun run dev` command
    console.log('\x1b[33mRunning bun run dev command...\x1b[0m');
    spawnSync('bun', ['run', 'dev'], { stdio: 'inherit' });
}

// Run the main function
main();
