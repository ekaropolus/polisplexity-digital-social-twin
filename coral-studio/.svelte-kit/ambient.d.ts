
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const npm_package_devDependencies_tw_animate_css: string;
	export const npm_package_devDependencies__eslint_compat: string;
	export const npm_config_version_commit_hooks: string;
	export const npm_config_user_agent: string;
	export const NODE_VERSION: string;
	export const npm_package_dependencies_socket_io: string;
	export const npm_package_devDependencies_phosphor_icons_svelte: string;
	export const npm_package_devDependencies_bits_ui: string;
	export const npm_config_bin_links: string;
	export const HOSTNAME: string;
	export const YARN_VERSION: string;
	export const npm_node_execpath: string;
	export const npm_package_devDependencies_vite: string;
	export const npm_package_devDependencies_svelte_sonner: string;
	export const npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
	export const npm_config_init_version: string;
	export const SHLVL: string;
	export const npm_package_packageManager: string;
	export const npm_package_files_0: string;
	export const HOME: string;
	export const npm_package_devDependencies_clsx: string;
	export const npm_package_devDependencies__eslint_js: string;
	export const npm_package_devDependencies_eslint_plugin_svelte: string;
	export const npm_package_devDependencies_eslint_config_prettier: string;
	export const npm_package_devDependencies__internationalized_date: string;
	export const npm_package_devDependencies_paneforge: string;
	export const npm_config_init_license: string;
	export const YARN_WRAP_OUTPUT: string;
	export const npm_package_devDependencies_svelte_check: string;
	export const npm_config_version_tag_prefix: string;
	export const npm_package_scripts_check: string;
	export const npm_package_devDependencies_mode_watcher: string;
	export const npm_config_engine_strict: string;
	export const npm_package_description: string;
	export const npm_package_devDependencies_typescript: string;
	export const npm_package_devDependencies_tailwindcss: string;
	export const npm_package_readmeFilename: string;
	export const npm_package_bin_coral_studio: string;
	export const npm_package_dependencies_runed: string;
	export const npm_package_devDependencies_prettier: string;
	export const npm_package_scripts_dev: string;
	export const npm_package_type: string;
	export const npm_package_dependencies_express: string;
	export const npm_package_devDependencies__sveltejs_adapter_node: string;
	export const npm_package_scripts_check_watch: string;
	export const npm_package_private: string;
	export const npm_package_scripts_prepare: string;
	export const npm_package_scripts_lint: string;
	export const npm_config_registry: string;
	export const npm_package_devDependencies__tailwindcss_vite: string;
	export const npm_package_scripts_start: string;
	export const npm_config_ignore_scripts: string;
	export const npm_config_version: string;
	export const npm_package_devDependencies_prettier_plugin_tailwindcss: string;
	export const PATH: string;
	export const NODE: string;
	export const npm_package_devDependencies_typescript_eslint: string;
	export const npm_package_name: string;
	export const npm_package_devDependencies_eslint: string;
	export const npm_lifecycle_script: string;
	export const npm_package_devDependencies_tailwind_variants: string;
	export const npm_package_devDependencies__sveltejs_kit: string;
	export const npm_config_version_git_message: string;
	export const npm_lifecycle_event: string;
	export const npm_package_version: string;
	export const npm_config_argv: string;
	export const npm_package_devDependencies_svelte: string;
	export const npm_package_scripts_build: string;
	export const npm_package_devDependencies__lucide_svelte: string;
	export const npm_config_version_git_tag: string;
	export const npm_config_version_git_sign: string;
	export const npm_package_devDependencies_globals: string;
	export const npm_config_strict_ssl: string;
	export const npm_package_scripts_format: string;
	export const PWD: string;
	export const npm_execpath: string;
	export const npm_package_devDependencies_tailwind_merge: string;
	export const npm_package_dependencies_socket_io_client: string;
	export const npm_config_save_prefix: string;
	export const npm_config_ignore_optional: string;
	export const npm_package_devDependencies_prettier_plugin_svelte: string;
	export const npm_package_scripts_preview: string;
	export const INIT_CWD: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		npm_package_devDependencies_tw_animate_css: string;
		npm_package_devDependencies__eslint_compat: string;
		npm_config_version_commit_hooks: string;
		npm_config_user_agent: string;
		NODE_VERSION: string;
		npm_package_dependencies_socket_io: string;
		npm_package_devDependencies_phosphor_icons_svelte: string;
		npm_package_devDependencies_bits_ui: string;
		npm_config_bin_links: string;
		HOSTNAME: string;
		YARN_VERSION: string;
		npm_node_execpath: string;
		npm_package_devDependencies_vite: string;
		npm_package_devDependencies_svelte_sonner: string;
		npm_package_devDependencies__sveltejs_vite_plugin_svelte: string;
		npm_config_init_version: string;
		SHLVL: string;
		npm_package_packageManager: string;
		npm_package_files_0: string;
		HOME: string;
		npm_package_devDependencies_clsx: string;
		npm_package_devDependencies__eslint_js: string;
		npm_package_devDependencies_eslint_plugin_svelte: string;
		npm_package_devDependencies_eslint_config_prettier: string;
		npm_package_devDependencies__internationalized_date: string;
		npm_package_devDependencies_paneforge: string;
		npm_config_init_license: string;
		YARN_WRAP_OUTPUT: string;
		npm_package_devDependencies_svelte_check: string;
		npm_config_version_tag_prefix: string;
		npm_package_scripts_check: string;
		npm_package_devDependencies_mode_watcher: string;
		npm_config_engine_strict: string;
		npm_package_description: string;
		npm_package_devDependencies_typescript: string;
		npm_package_devDependencies_tailwindcss: string;
		npm_package_readmeFilename: string;
		npm_package_bin_coral_studio: string;
		npm_package_dependencies_runed: string;
		npm_package_devDependencies_prettier: string;
		npm_package_scripts_dev: string;
		npm_package_type: string;
		npm_package_dependencies_express: string;
		npm_package_devDependencies__sveltejs_adapter_node: string;
		npm_package_scripts_check_watch: string;
		npm_package_private: string;
		npm_package_scripts_prepare: string;
		npm_package_scripts_lint: string;
		npm_config_registry: string;
		npm_package_devDependencies__tailwindcss_vite: string;
		npm_package_scripts_start: string;
		npm_config_ignore_scripts: string;
		npm_config_version: string;
		npm_package_devDependencies_prettier_plugin_tailwindcss: string;
		PATH: string;
		NODE: string;
		npm_package_devDependencies_typescript_eslint: string;
		npm_package_name: string;
		npm_package_devDependencies_eslint: string;
		npm_lifecycle_script: string;
		npm_package_devDependencies_tailwind_variants: string;
		npm_package_devDependencies__sveltejs_kit: string;
		npm_config_version_git_message: string;
		npm_lifecycle_event: string;
		npm_package_version: string;
		npm_config_argv: string;
		npm_package_devDependencies_svelte: string;
		npm_package_scripts_build: string;
		npm_package_devDependencies__lucide_svelte: string;
		npm_config_version_git_tag: string;
		npm_config_version_git_sign: string;
		npm_package_devDependencies_globals: string;
		npm_config_strict_ssl: string;
		npm_package_scripts_format: string;
		PWD: string;
		npm_execpath: string;
		npm_package_devDependencies_tailwind_merge: string;
		npm_package_dependencies_socket_io_client: string;
		npm_config_save_prefix: string;
		npm_config_ignore_optional: string;
		npm_package_devDependencies_prettier_plugin_svelte: string;
		npm_package_scripts_preview: string;
		INIT_CWD: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
