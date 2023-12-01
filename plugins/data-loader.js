import { resolve as resolvePath, dirname } from 'node:path'
import merge from 'lodash.merge'
import lookup from '../lib/lookup'

const ERROR_PATH_UNDEFINED = 'Path of processing file is not defined. \
Local transformer is not effective.'

/**
 * @param options
 * @param options.pattern: string - glob pattern to module with transformer
 * @param options.basePath: string - path where website code is located
 * @param {number} options.lookupLimit - maximum level above the current file
 *   to look up for the loader
 */
function attachDataLoader(options) {
	const pattern = options?.pattern ?? 'loader.js'
	const basePath = options?.basePath ?? process.cwd()

	const dataLoader = async (tree, file) => {
		if (file.path == null) {
			console.warn(ERROR_PATH_UNDEFINED)
			return
		}

		const loaders = await lookup(pattern, dirname(file.path), {
			dir: basePath,
			limit: options?.lookupLimit,
		})
		loaders.sort((a, b) => a.length - b.length)

		const data = file.data // could be scoped potentially

		for (const loaderPath of loaders) {
			const module = await import(loaderPath)
			const loader = module.default
			const patch = await loader.call(file, file, tree)
			merge(data, patch)
		}
	}

	return dataLoader
}

export default attachDataLoader
