declare global {
    namespace NodeJS {
        interface ProcessEnv extends CloudflareEnv {
            GOOGLE_CLIENT_ID: string;
            GOOGLE_CLIENT_SECRET: string;
        }
    }
}

export {};
