import { readdir } from 'node:fs/promises'
import { dirname, join as joinPaths, resolve as resolvePath } from 'node:path'

const resolveTest = (init) => {
	if (typeof init == 'function') {
		return init
	}

	if (typeof init == 'string') {
		return value => value === init
	}

	if (init instanceof RegExp) {
		return value => init.test(value)
	}

	throw new Error('Invalid test passed to file lookup')
}

async function lookup(pattern, path) {
	const test = resolveTest(pattern)
	const entries = await readdir(path, { withFileTypes: true })
	return entries
		.filter(dirent => dirent.isFile())
		.filter(dirent => test(dirent.name))
		.map(dirent => joinPaths(path, dirent.name))
}

/**
 * Walks from the given paths upwards until reaches the root path
 * and lists all file names matching test.
 *
 * @param {string | RegExp | (fileName: string) => boolean} test
 * @param {string} path - starting directory path to look at (and its parents)
 * @param {string} options?.base - directory where the search ends;
 *   if not set, resolved to the current working directory
 * @param {number} options?.limit - maximum number of levels about the specified
 *   path to seach for the files matching pattern;
 *   if not set, resolves to Infinity
 */
export async function lookupAll(pattern, path, options) {
	const basePath = options.dir ? resolvePath(options.dir) : process.cwd()
	path = resolvePath(path)

	if (!resolvePath(path).startsWith(basePath)) {
		throw Error('Final lookup path is not under the base path')
	}
	
	let depthLimit = options.limit ?? Infinity
	const directoryList = [path]
	while (path !== basePath && path !== '/' && depthLimit --> 0) {
		path = dirname(path)
		directoryList.push(path)
	}

	const matchedFiles = await Promise.all(directoryList.map(path => lookup(pattern, path)))
	return matchedFiles.flat()
}

export default lookupAll
