import { intro, outro, text, confirm, spinner, cancel } from '@clack/prompts';
import * as fs from 'fs';
import * as path from 'path';
import * as toml from '@iarna/toml';
import { execSync, spawnSync } from 'child_process';
import crypto from 'crypto';

let dbName: string;

// Function to execute shell commands
function executeCommand(command: string) {
    console.log(`\x1b[33m${command}\x1b[0m`);
    try {
        return execSync(command, { encoding: 'utf-8' });
    } catch (error: any) { return { error: true, message: error.stdout || error.stderr }; }
}

// Function to prompt user for input without readline-sync
async function prompt(message: string, defaultValue: string): Promise<string> {
    return await text({ message: `${message} (${defaultValue}):`, placeholder: defaultValue, defaultValue }) as string
}


// Function to create database and update wrangler.toml
async function createDatabaseAndConfigure() {
    intro(`Let's set up your database...`);
    const defaultDBName = path.basename(process.cwd()) + '-db';
    dbName = await prompt('Enter the name of your database', defaultDBName);

    let databaseID: string;

    const wranglerTomlPath = path.join(__dirname, '..', 'apps', 'web', 'wrangler.toml');
    let wranglerToml: toml.JsonMap;

    try {
        const wranglerTomlContent = fs.readFileSync(wranglerTomlPath, 'utf-8');
        wranglerToml = toml.parse(wranglerTomlContent);
    } catch (error) {
        console.error('\x1b[31mError reading wrangler.toml:', error, '\x1b[0m');
        cancel('Operation cancelled.');
    }

    // Run command to create a new database
    const creationOutput = executeCommand(`bunx wrangler d1 create ${dbName}`);

    if (creationOutput === undefined || typeof creationOutput !== 'string') {
        console.log("\x1b[33mDatabase creation failed, maybe you have already created a database with that name. I'll try to find the database ID for you.\x1b[0m");
        const dbInfoOutput = executeCommand(`bunx wrangler d1 info ${dbName}`);
        console.log(dbInfoOutput);
        const getInfo = (dbInfoOutput as string).match(/│ [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} │/i );
        if (getInfo && getInfo.length === 1) {
            console.log("\x1b[33mFound it! The database ID is: ", getInfo[0], "\x1b[0m");
            databaseID = getInfo[0].replace("│ ", "").replace(" │", "");
        } else {
            console.error("\x1b[31mSomething went wrong when initialising the database. Please try again.\x1b[0m");
            cancel('Operation cancelled.');
        }
    }
    else {
        // Extract database ID from the output
        const matchResult = (creationOutput as string).match(/database_id = "(.*)"/);
        if (matchResult && matchResult.length === 2 && matchResult !== undefined) {
            databaseID = matchResult[1]!
        } else {
            console.error('Failed to extract database ID from the output.');
            cancel('Operation cancelled.');
        }
    }

    // Update wrangler.toml with database configuration
    wranglerToml = {
        ... wranglerToml!,
        d1_databases: [
            {
                binding: "DATABASE",
                database_name: dbName,
                database_id: databaseID!,
            }
        ]
    }

    console.log(wranglerToml);

    try {
        const updatedToml = toml.stringify(wranglerToml);
        console.log(updatedToml);
        fs.writeFileSync(wranglerTomlPath, updatedToml);
        console.log('\x1b[33mDatabase configuration updated in wrangler.toml\x1b[0m');
    } catch (error) {
        console.error('\x1b[31mError updating wrangler.toml:', error, '\x1b[0m');
        cancel('Operation cancelled.');
    }

    outro('Database configuration completed.');
}


// Function to prompt for Google client credentials
async function promptForGoogleClientCredentials() {
    intro('Now, time for auth!');

    const devVarsPath = path.join(__dirname, '..', 'apps', 'web', '.dev.vars');

    if (!fs.existsSync(devVarsPath)) {
        const clientId = await prompt('Enter your Google Client ID', '');
        const clientSecret = await prompt('Enter your Google Client Secret', '');

        try {
            fs.writeFileSync(devVarsPath, `GOOGLE_CLIENT_ID=${clientId}\nGOOGLE_CLIENT_SECRET=${clientSecret}\n`);
            console.log('\x1b[33m.dev.vars file created with Google Client ID and Client Secret.\x1b[0m');
        } catch (error) {
            console.error('\x1b[31mError creating .dev.vars file:', error, '\x1b[0m');
            cancel('Operation cancelled.');
        }
    } else {
        console.log('\x1b[31m.dev.vars file already exists. Skipping creation.\x1b[0m');
    }

    outro('.dev.vars updated with Google Client ID and Client Secret.');
}

// Function to generate secure random 32-character string
function generateSecureRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

// Function to update .dev.vars with secure random string
async function updateDevVarsWithSecret() {
    const secret = generateSecureRandomString(32);
    const devVarsPath = path.join(__dirname, '..', 'apps', 'web', '.dev.vars');

    try {
        if (!fs.readFileSync(devVarsPath, 'utf-8').includes('NEXTAUTH_SECRET')) {
            fs.appendFileSync(devVarsPath, `\nNEXTAUTH_SECRET=${secret}`);
            console.log('\x1b[33mSecret appended to .dev.vars file.\x1b[0m');
        } else {
            console.log('\x1b[31mNEXTAUTH_SECRET already exists in .dev.vars\x1b[0m');
        }
    } catch (error) {
        console.error('\x1b[31mError updating .dev.vars file:', error, '\x1b[0m');
        cancel('Operation cancelled.');
    }

    outro('.dev.vars updated with secure secret.');
}

// Function to run database migrations
async function runDatabaseMigrations(dbName: string) {
    const setupMigrationSpinner = spinner();
    setupMigrationSpinner.start('Generating setup migration...');
    executeCommand('cd apps/web && bunx drizzle-kit generate --name setup');
    setupMigrationSpinner.stop('Setup migration generated.');

    const localMigrationSpinner = spinner();
    localMigrationSpinner.start('Running local database migrations...');
    executeCommand(`cd apps/web && wrangler d1 execute ${dbName} --local --file=migrations/0000_setup.sql`);
    localMigrationSpinner.stop('Local database migrations completed.');

    const remoteMigrationSpinner = spinner();
    remoteMigrationSpinner.start('Running remote database migrations...');
    executeCommand(`cd apps/web && wrangler d1 execute ${dbName} --file=migrations/0000_setup.sql`);
    remoteMigrationSpinner.stop('Remote database migrations completed.');
}

// Main function
async function main() {
    try {
        await createDatabaseAndConfigure();
        await promptForGoogleClientCredentials();
        console.log('\x1b[33mReady... Set... Launch\x1b[0m');
        await updateDevVarsWithSecret();
        await runDatabaseMigrations(dbName);

        console.log('\x1b[33mRunning bun run dev command...\x1b[0m');
        spawnSync('bun', ['run', 'dev'], { stdio: 'inherit' });
    } catch (error) {
        console.error('\x1b[31mError:', error, '\x1b[0m');
        cancel('Operation cancelled.');
    }
}

// Run the main function
main();
