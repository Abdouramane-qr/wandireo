declare module '@/actions/App/Http/Controllers/Settings/ProfileController' {
    const controller: {
        update: { form: () => Record<string, unknown> };
        destroy: { form: () => Record<string, unknown> };
    };

    export default controller;
}

declare module '@/actions/App/Http/Controllers/Settings/SecurityController' {
    const controller: {
        update: { form: () => Record<string, unknown> };
    };

    export default controller;
}
